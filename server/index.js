const express = require('express');
const path = require('path');

// Node 18+ 原生支持 fetch，无需额外安装
// Render 默认 Node 18+，本地开发也需 Node 18+

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON body，增大到50mb以支持大文件上传
app.use(express.json({ limit: '50mb' }));

// 静态文件（生产环境）
app.use(express.static(path.join(__dirname, '../dist')));

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
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const ARK_API_KEY = process.env.ARK_API_KEY || '';
  if (!ARK_API_KEY) {
    console.error('[Proxy] 缺少 ARK_API_KEY 环境变量');
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  try {
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

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Proxy] 火山引擎 API 错误:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('[Proxy] 请求失败:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
