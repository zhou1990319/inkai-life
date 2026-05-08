// 这是安全、可直接运行的后端代码，不会影响你的前端网站
const express = require('express');
const app = express();

app.use(express.json());

// 测试接口
app.get('/', (req, res) => {
  res.send('InkAI.life 后端服务已启动 ✅');
});

// AI生成接口
app.post('/api/generate', (req, res) => {
  const { prompt } = req.body;
  res.json({
    img1: `https://picsum.photos/seed/${prompt}1/800/800`,
    img2: `https://picsum.photos/seed/${prompt}2/800/800`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('服务启动：' + PORT);
});
