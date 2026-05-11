const express = require('express');
const path = require('path');

// Node 18+ 原生支持 fetch，无需额外安装
// Render 默认 Node 18+，本地开发也需 Node 18+

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON body
app.use(express.json({ limit: '10mb' }));

// 静态文件（生产环境）
app.use(express.static(path.join(__dirname, '../dist')));

// Health check
app.get('/health', (req, res) => res.send('OK'));

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
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n,
        size,
        guidance_scale,
        watermark,
        response_format: 'url',
      }),
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
