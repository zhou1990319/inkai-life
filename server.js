const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('InkAI Backend Online');
});

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  res.json({
    img1: `https://picsum.photos/seed/${prompt}1/600/600`,
    img2: `https://picsum.photos/seed/${prompt}2/600/600`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
