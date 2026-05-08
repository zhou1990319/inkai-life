// server.js - 完整后端：数据库 + AI + 支付 + 登录
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('你的STRIPE_KEY');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 数据库模型
const User = mongoose.model('User', {
  username: String,
  password: String,
  email: String,
  vip: Boolean,
  generateCount: Number,
  createTime: Date
});

const Order = mongoose.model('Order', {
  userId: String,
  amount: Number,
  payment: String,
  time: Date
});

// 注册
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({
    username, password: hashed, email,
    vip: false, generateCount: 0, createTime: new Date()
  });
  await user.save();
  res.send({ ok: 1 });
});

// 登录
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.send({ ok: 0 });
  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.send({ ok: 0 });
  const token = jwt.sign({ id: user._id }, 'SECRET');
  res.send({ ok: 1, token, user });
});

// AI 生成（真实高清接口）
app.post('/api/generate', async (req, res) => {
  const { prompt, style } = req.body;
  const resp = await axios.post('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
    inputs: `${prompt} ${style} tattoo design, white background, high detail`
  }, {
    headers: { Authorization: 'Bearer YOUR_HF_TOKEN' },
    responseType: 'arraybuffer'
  });
  const img = 'data:image/png;base64,' + Buffer.from(resp.data).toString('base64');
  res.send({ img });
});

// Stripe 支付
app.post('/api/pay', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: {
      currency: 'usd', product_data: { name: 'VIP会员' }, unit_amount: 990
    }, quantity: 1 }],
    mode: 'payment',
    success_url: 'https://inkai.life/success',
    cancel_url: 'https://inkai.life/cancel'
  });
  res.send({ url: session.url });
});

// 管理员后台
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// 启动
mongoose.connect('mongodb+srv://你的MongoDB连接串');
app.listen(3000, () => console.log('服务器启动'));
