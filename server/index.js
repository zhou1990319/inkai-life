const express = require('express');
const path = require('path');
const crypto = require('crypto');

// Node 18+ 原生支持 fetch，无需额外安装
// Render 默认 Node 18+，本地开发也需 Node 18+

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON body，增大到50mb以支持大文件上传
app.use(express.json({ limit: '50mb' }));

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

// ========== 统计接口 ==========
app.get('/api/stats', (req, res) => {
  res.json({
    cache: {
      size: imageCache.size,
      maxSize: CACHE_MAX_SIZE,
      ttl: CACHE_TTL / 1000 + 's',
    },
    queue: {
      pending: requestQueue.length,
      active: activeRequests,
      maxConcurrent: MAX_CONCURRENT,
    },
    sentry: {
      enabled: !!Sentry,
    },
  });
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

// ========== Supabase Storage Buckets 管理 ==========

/**
 * 获取所有 buckets
 */
app.get('/api/buckets', async (req, res) => {
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }

  try {
    const response = await fetch('https://zgolsxdwilktnxbzxfcw.supabase.co/storage/v1/bucket', {
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
app.post('/api/buckets', async (req, res) => {
  const { id, name, public: isPublic = true } = req.body;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_KEY' });
  }
  
  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  try {
    const response = await fetch('https://zgolsxdwilktnxbzxfcw.supabase.co/storage/v1/bucket', {
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
app.post('/api/init-buckets', async (req, res) => {
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
      const response = await fetch('https://zgolsxdwilktnxbzxfcw.supabase.co/storage/v1/bucket', {
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
app.post('/api/upload-image', async (req, res) => {
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
      `https://zgolsxdwilktnxbzxfcw.supabase.co/storage/v1/object/${bucket}/${storagePath}`,
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
    const publicUrl = `https://zgolsxdwilktnxbzxfcw.supabase.co/storage/v1/object/public/${bucket}/${storagePath}`;

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
app.post('/api/generate-image', async (req, res) => {
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

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`[Cache] AI 图片缓存已启用 (最大 ${CACHE_MAX_SIZE} 条, TTL ${CACHE_TTL / 3600000}h)`);
  console.log(`[Retry] API 重试已启用 (最多 ${MAX_RETRIES} 次, 超时 ${API_TIMEOUT / 1000}s)`);
  console.log(`[Queue] 请求队列已启用 (最大并发 ${MAX_CONCURRENT})`);
  console.log(`[Sentry] 错误监控: ${Sentry ? '已启用' : '未配置'}`);
});
