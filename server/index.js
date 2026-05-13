const express = require('express');
const path = require('path');
const crypto = require('crypto');

// Node 18+ 原生支持 fetch，无需额外安装
// Render 默认 Node 18+，本地开发也需 Node 18+

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zgolsxdwilktnxbzxfcw.supabase.co';

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON body，限制为 10mb 防止过大请求
app.use(express.json({ limit: '10mb' }));

// 静态文件（生产环境）
app.use(express.static(path.join(__dirname, '../dist')));

// ========== Sentry 错误监控 ==========
// 使用 @sentry/node 捕获未处理的错误和未捕获的异常
let Sentry;
try {
  if (process.env.SENTRY_DSN) {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1, // 采样 10% 的请求
    });
    app.use(Sentry.Handlers.errorHandler());
    console.log('[Sentry] 错误监控已启用');
  } else {
    console.log('[Sentry] 未配置 SENTRY_DSN，跳过错误监控');
  }
} catch (e) {
  console.log('[Sentry] 未安装 @sentry/node，错误监控未启用');
}

// ========== API 鉴权中间件 ==========
/**
 * 检查请求头 x-api-key 或 query 参数 api_key 是否匹配环境变量 API_KEY
 * 如果 API_KEY 环境变量未设置，则跳过鉴权（向后兼容开发环境）
 */
function authenticateApiKey(req, res, next) {
  const API_KEY = process.env.API_KEY;

  // 如果未设置 API_KEY，跳过鉴权（开发环境兼容）
  if (!API_KEY) {
    return next();
  }

  const clientKey = req.headers['x-api-key'] || req.query.api_key;

  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing API key' });
  }

  next();
}

// ========== 速率限制中间件 ==========
/**
 * 基于内存的简单速率限制
 * 每个 IP 每分钟最多 60 次请求
 * /api/generate-image 每个 IP 每分钟最多 10 次
 */
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 分钟
const RATE_LIMIT_MAX = 60;           // 每分钟最多 60 次
const RATE_LIMIT_GENERATE_MAX = 10;  // generate-image 每分钟最多 10 次

// 每分钟清理一次过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now - record.startTime >= RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

function rateLimit(maxRequests) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now - record.startTime >= RATE_LIMIT_WINDOW) {
      record = { count: 0, startTime: now };
      rateLimitStore.set(key, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - record.startTime)) / 1000),
      });
    }

    next();
  };
}

// ========== AI 图片生成缓存 ==========
// 使用内存缓存，避免相同 prompt 重复调用 API，节省费用
const imageCache = new Map();
const CACHE_MAX_SIZE = 500;            // 最多缓存 500 条
const CACHE_TTL = 24 * 60 * 60 * 1000; // 缓存 24 小时

/**
 * 生成缓存 key（基于 prompt + model + size + image_url）
 */
function getCacheKey(prompt, model, size, image_url) {
  const raw = `${prompt}|${model}|${size}|${image_url || ''}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}

function getCachedResult(key) {
  const entry = imageCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    imageCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedResult(key, data) {
  // 超过上限时删除最早的一条（简易 LRU）
  if (imageCache.size >= CACHE_MAX_SIZE) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  imageCache.set(key, { data, timestamp: Date.now() });
}

// ========== 请求队列（防止高并发崩溃）==========
// 使用简易队列实现，控制同时调用的 AI API 数量
const requestQueue = [];
let isProcessingQueue = false;
const MAX_CONCURRENT = 2;   // 最多 2 个并发请求
let activeRequests = 0;

async function processQueue() {
  if (isProcessingQueue || activeRequests >= MAX_CONCURRENT || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT) {
    const { resolve, reject, taskFn } = requestQueue.shift();
    activeRequests++;

    taskFn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeRequests--;
        processQueue(); // 继续处理队列
      });
  }

  isProcessingQueue = false;
}

function addToQueue(taskFn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ taskFn, resolve, reject });
    processQueue();
  });
}

// ========== 请求超时 & 重试 ==========
const API_TIMEOUT = 60000; // API 超时 60 秒
const MAX_RETRIES = 2;     // 最多重试 2 次

async function fetchWithTimeout(url, options, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (response.ok || response.status < 500) return response; // 4xx 不重试
      if (attempt < retries) {
        const wait = Math.pow(2, attempt) * 1000;
        console.warn(`[Retry] ${response.status}, 第 ${attempt + 1} 次重试，等待 ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt < retries && err.name !== 'AbortError') {
        const wait = Math.pow(2, attempt) * 1000;
        console.warn(`[Retry] 请求失败，第 ${attempt + 1} 次重试，等待 ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
}

// ========== 服务保活（防止 Render 免费层休眠）==========
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 每 14 分钟 ping 一次
const KEEP_ALIVE_TARGET = process.env.KEEP_ALIVE_URL || `http://localhost:${PORT}/health`;

setInterval(() => {
  fetch(KEEP_ALIVE_TARGET).catch(() => {});
}, KEEP_ALIVE_INTERVAL);
console.log(`[KeepAlive] 已启用，每 ${KEEP_ALIVE_INTERVAL / 60000} 分钟 ping 一次`);

// ========== 统计接口（需要鉴权）==========
app.get('/api/stats', authenticateApiKey, (req, res) => {
  res.json({
    cacheSize: imageCache.size,
    queueLength: requestQueue.length,
  });
});

// Health check（无需鉴权）
app.get('/health', (req, res) => res.send('OK'));

// ========== Supabase Storage Buckets 管理 ==========

/**
 * 获取所有 buckets
 */
app.get('/api/buckets', authenticateApiKey, rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 创建 Storage Bucket
 */
app.post('/api/buckets', authenticateApiKey, rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const { id, name, public: isPublic = true } = req.body;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }

  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, public: isPublic }),
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 初始化所需的 buckets（纹身图片、AI生成图、设计稿）
 */
app.post('/api/init-buckets', authenticateApiKey, rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }

  const buckets = [
    { id: 'tattoo-images', name: 'tattoo-images', public: true },
    { id: 'ai-generated', name: 'ai-generated', public: true },
    { id: 'tattoo-designs', name: 'tattoo-designs', public: true },
  ];

  const results = [];

  for (const bucket of buckets) {
    try {
      const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bucket),
      });
      const data = await response.json();
      results.push({ bucket: bucket.id, status: response.ok ? 'created' : data });
    } catch (err) {
      results.push({ bucket: bucket.id, status: 'error', error: err.message });
    }
  }

  res.json({ results });
});

// ========== 文件上传 API（服务端模式，绕过 RLS）==========

/**
 * POST /api/upload-image
 * 通过服务端上传图片到 Supabase Storage
 * 使用 service_role key 绕过 RLS 限制
 */
app.post('/api/upload-image', authenticateApiKey, rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }

  const { bucket = 'tattoo-images', fileName, fileData, contentType = 'image/png' } = req.body;

  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'fileName and fileData are required' });
  }

  try {
    // fileData 应该是 base64 编码的文件内容
    const buffer = Buffer.from(fileData, 'base64');

    const storagePath = `uploads/${Date.now()}-${fileName}`;

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[Upload] Supabase error:', error);
      return res.status(response.status).json(error);
    }

    // 获取公开 URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;

    res.json({
      success: true,
      publicUrl,
      storagePath,
    });
  } catch (err) {
    console.error('[Upload] Failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== API 路由 ==========

/**
 * POST /api/generate-image
 * 代理火山引擎即梦AI图像生成
 * 前端调用此接口，API Key 完全不暴露给客户端
 *
 * 优化项：
 * - 缓存：相同 prompt+model+size 直接返回缓存结果
 * - 超时：60 秒超时保护
 * - 重试：5xx 错误自动重试 2 次（指数退避）
 * - 队列：最多 2 个并发请求，防止崩溃
 * - Sentry：错误自动上报
 */
app.post('/api/generate-image', authenticateApiKey, rateLimit(RATE_LIMIT_GENERATE_MAX), async (req, res) => {
  const {
    prompt,
    model = 'doubao-seedream-4-0-250828',
    size = '1024x1024',
    n = 1,
    guidance_scale = 3.5,
    watermark = false,
    image_url,    // 图生图：参考图URL
    skip_cache = false, // 可选：跳过缓存
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const ARK_API_KEY = process.env.ARK_API_KEY || '';
  if (!ARK_API_KEY) {
    console.error('[Proxy] 缺少 ARK_API_KEY 环境变量');
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  // ---- 缓存检查 ----
  const cacheKey = getCacheKey(prompt, model, size, image_url);
  if (!skip_cache) {
    const cached = getCachedResult(cacheKey);
    if (cached) {
      console.log(`[Cache] 命中缓存: ${cacheKey.substring(0, 8)}...`);
      return res.json({ ...cached, _cached: true });
    }
  }

  try {
    // ---- 加入请求队列 ----
    const data = await addToQueue(async () => {
      // 构建请求体
      const requestBody = {
        model,
        prompt,
        n,
        size,
        guidance_scale,
        watermark,
        response_format: 'url',
      };

      // 图生图模式：附加参考图
      if (image_url) {
        requestBody.image_url = image_url;
      }

      // 使用带超时和重试的 fetch
      const response = await fetchWithRetry('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ARK_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(result));
      }

      return result;
    });

    // 写入缓存
    setCachedResult(cacheKey, data);
    console.log(`[Cache] 已缓存: ${cacheKey.substring(0, 8)}... (当前 ${imageCache.size}/${CACHE_MAX_SIZE})`);
    console.log(`[Queue] 队列状态: 活跃 ${activeRequests}/${MAX_CONCURRENT}, 等待 ${requestQueue.length}`);

    res.json(data);
  } catch (err) {
    console.error('[Proxy] 请求失败:', err);

    // Sentry 上报错误
    if (Sentry) {
      Sentry.captureException(err, {
        extra: { prompt, model, size, image_url },
      });
    }

    const status = err.name === 'AbortError' ? 504 : 500;
    const message = err.name === 'AbortError' ? 'AI API 请求超时，请稍后重试' : (err.message || 'Internal server error');
    res.status(status).json({ error: message });
  }
});


// ========== PayPal 支付配置 ==========
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' 或 'live'
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

console.log(`[PayPal] 配置已加载 (mode: ${PAYPAL_MODE}, clientId: ${PAYPAL_CLIENT_ID ? '已设置' : '未设置'})`);

/**
 * 获取 PayPal Access Token
 */
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('[PayPal] 获取 access token 失败:', data);
    throw new Error(data.error_description || 'Failed to get PayPal access token');
  }
  return data.access_token;
}

/**
 * 验证 PayPal Webhook 签名
 */
async function verifyPayPalWebhook(headers, body) {
  if (!PAYPAL_WEBHOOK_ID) {
    console.warn('[PayPal] WEBHOOK_ID 未配置，跳过签名验证');
    return true;
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    }),
  });

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}

// ========== PayPal API 端点 ==========

/**
 * GET /api/paypal/config
 * 返回 PayPal 客户端配置（client-id 等），供前端初始化 SDK
 */
app.get('/api/paypal/config', (req, res) => {
  res.json({
    clientId: PAYPAL_CLIENT_ID,
    mode: PAYPAL_MODE,
    currency: 'USD',
  });
});

/**
 * POST /api/paypal/create-order
 * 创建 PayPal 订单
 * Body: { userId, email, planType, planName, amount, currency }
 */
app.post('/api/paypal/create-order', rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const { userId, email, planType, planName, amount, currency = 'USD' } = req.body;

  if (!userId || !planType || !amount) {
    return res.status(400).json({ error: 'userId, planType, and amount are required' });
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return res.status(500).json({ error: 'PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.' });
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `${userId}_${planType}_${Date.now()}`,
          description: `InkAI.life - ${planName || planType}`,
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          custom_id: JSON.stringify({ userId, planType }),
        }],
        application_context: {
          brand_name: 'InkAI.life',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${req.protocol}://${req.get('host')}/payment/success`,
          cancel_url: `${req.protocol}://${req.get('host')}/payment/cancel`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[PayPal] 创建订单失败:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to create PayPal order' });
    }

    const approveLink = data.links?.find((link) => link.rel === 'approve');

    res.json({
      orderId: data.id,
      status: data.status,
      approveUrl: approveLink?.href || null,
    });
  } catch (err) {
    console.error('[PayPal] 创建订单异常:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/paypal/capture-order
 * 捕获 PayPal 支付
 * Body: { orderId, userId, planType }
 */
app.post('/api/paypal/capture-order', rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const { orderId, userId, planType } = req.body;

  if (!orderId || !userId || !planType) {
    return res.status(400).json({ error: 'orderId, userId, and planType are required' });
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return res.status(500).json({ error: 'PayPal is not configured' });
  }

  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error('[PayPal] 捕获支付失败:', captureData);
      return res.status(captureResponse.status).json({ error: captureData.message || 'Failed to capture payment' });
    }

    const captureStatus = captureData.status;
    if (captureStatus !== 'COMPLETED') {
      console.warn('[PayPal] 订单状态非 COMPLETED:', captureStatus);
      return res.status(400).json({ error: `Payment not completed. Status: ${captureStatus}` });
    }

    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const payerEmail = captureData.payer?.email_address || '';
    const payerName = captureData.payer?.name?.given_name || '';
    const transactionId = capture?.id || orderId;

    const now = new Date();
    let expiresAt = null;
    const planBillingMap = {
      starter: 'one_time',
      basic_monthly: 'monthly',
      basic_yearly: 'yearly',
      pro_monthly: 'monthly',
      pro_yearly: 'yearly',
      unlimited: 'monthly',
    };
    const billing = planBillingMap[planType] || 'monthly';
    if (billing === 'monthly') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (billing === 'yearly') {
      expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&status=eq.active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    }).catch(err => console.warn('[PayPal] 取消旧订阅失败:', err));

    const subResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt,
        payment_id: transactionId,
        payment_provider: 'paypal',
        auto_renew: billing === 'monthly' || billing === 'yearly',
      }),
    });

    const subData = await subResponse.json();
    if (!subResponse.ok) {
      console.error('[PayPal] 创建订阅记录失败:', subData);
    }

    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        current_plan: planType,
        subscription_status: 'active',
      }),
    }).catch(err => console.warn('[PayPal] 更新 profile 失败:', err));

    console.log(`[PayPal] 支付成功: userId=${userId}, plan=${planType}, orderId=${orderId}, transactionId=${transactionId}`);

    res.json({
      success: true,
      orderId: captureData.id,
      transactionId,
      status: captureStatus,
      planType,
      payerEmail,
      payerName,
      amount: capture?.amount?.value,
      currency: capture?.amount?.currency_code,
    });
  } catch (err) {
    console.error('[PayPal] 捕获支付异常:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/paypal/verify?orderId=xxx
 * 验证 PayPal 订单状态
 */
app.get('/api/paypal/verify', rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return res.status(500).json({ error: 'PayPal is not configured' });
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to verify order' });
    }

    const isCompleted = data.status === 'COMPLETED';
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    res.json({
      success: isCompleted,
      status: data.status,
      orderId: data.id,
      transactionId: capture?.id || null,
      amount: capture?.amount?.value || null,
      currency: capture?.amount?.currency_code || null,
    });
  } catch (err) {
    console.error('[PayPal] 验证订单异常:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/paypal/cancel-subscription
 * 取消订阅（将用户方案重置为 free）
 * Body: { userId }
 */
app.post('/api/paypal/cancel-subscription', rateLimit(RATE_LIMIT_MAX), async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&status=eq.active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        current_plan: 'free',
        subscription_status: 'cancelled',
      }),
    });

    console.log(`[PayPal] 订阅已取消: userId=${userId}`);
    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (err) {
    console.error('[PayPal] 取消订阅异常:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/paypal/webhook
 * PayPal Webhook 处理
 */
app.post('/api/paypal/webhook', async (req, res) => {
  const webhookEvent = req.body;

  const isValid = await verifyPayPalWebhook(req.headers, webhookEvent);
  if (!isValid) {
    console.warn('[PayPal] Webhook 签名验证失败');
    return res.status(401).json({ error: 'Webhook signature verification failed' });
  }

  console.log(`[PayPal] 收到 Webhook: ${webhookEvent.event_type}`);

  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_SERVICE_KEY) {
    console.error('[PayPal] Webhook 处理失败: 缺少 SUPABASE_SERVICE_KEY');
    return res.status(200).send('OK');
  }

  try {
    if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED' ||
        webhookEvent.event_type === 'CHECKOUT.ORDER.APPROVED') {

      const resource = webhookEvent.resource;
      const orderId = resource.id || resource.supplementary_purchase?.reference_id;
      const customId = resource.custom_id;

      let userId = null;
      let planType = null;

      if (customId) {
        try {
          const parsed = JSON.parse(customId);
          userId = parsed.userId;
          planType = parsed.planType;
        } catch (e) {
          console.warn('[PayPal] 无法解析 custom_id:', customId);
        }
      }

      if (userId && planType) {
        const capture = resource.purchase_units?.[0]?.payments?.captures?.[0];
        const transactionId = capture?.id || orderId;

        const now = new Date();
        let expiresAt = null;
        const planBillingMap = {
          starter: 'one_time',
          basic_monthly: 'monthly',
          basic_yearly: 'yearly',
          pro_monthly: 'monthly',
          pro_yearly: 'yearly',
          unlimited: 'monthly',
        };
        const billing = planBillingMap[planType] || 'monthly';
        if (billing === 'monthly') {
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (billing === 'yearly') {
          expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }

        await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&status=eq.active`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ status: 'cancelled' }),
        }).catch(err => console.warn('[PayPal] Webhook: 取消旧订阅失败:', err));

        await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id: userId,
            plan_type: planType,
            status: 'active',
            started_at: now.toISOString(),
            expires_at: expiresAt,
            payment_id: transactionId,
            payment_provider: 'paypal',
            auto_renew: billing === 'monthly' || billing === 'yearly',
          }),
        }).catch(err => console.warn('[PayPal] Webhook: 创建订阅失败:', err));

        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            current_plan: planType,
            subscription_status: 'active',
          }),
        }).catch(err => console.warn('[PayPal] Webhook: 更新 profile 失败:', err));

        console.log(`[PayPal] Webhook: 自动更新订阅成功: userId=${userId}, plan=${planType}`);
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[PayPal] Webhook 处理异常:', err);
    res.status(200).send('OK');
  }
});



// SPA fallback（无需鉴权）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`[Cache] AI 图片缓存已启用 (最大 ${CACHE_MAX_SIZE} 条, TTL ${CACHE_TTL / 3600000}h)`);
  console.log(`[Retry] API 重试已启用 (最多 ${MAX_RETRIES} 次, 超时 ${API_TIMEOUT / 1000}s)`);
  console.log(`[Queue] 请求队列已启用 (最大并发 ${MAX_CONCURRENT})`);
  console.log(`[Sentry] 错误监控: ${Sentry ? '已启用' : '未配置'}`);
  console.log(`[Auth] API 鉴权: ${process.env.API_KEY ? '已启用' : '未配置（开发模式，所有请求放行）'}`);
  console.log(`[RateLimit] 速率限制已启用 (全局 ${RATE_LIMIT_MAX}/min, generate-image ${RATE_LIMIT_GENERATE_MAX}/min)`);
  console.log('[PayPal] 支付系统: ' + (PAYPAL_CLIENT_ID ? '已配置' : '未配置（请设置环境变量）'));
});
