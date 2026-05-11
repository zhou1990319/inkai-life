const fs = require('fs');

// 创建一个1MB的测试图片（模拟压缩后的base64）
const size = 1 * 1024 * 1024; // 1MB
const testBase64 = Buffer.alloc(size, 'A').toString('base64');

console.log('测试数据大小:', testBase64.length, '字符');
console.log('解码后大小:', Buffer.from(testBase64, 'base64').length, '字节');

async function testUpload() {
  const response = await fetch('http://localhost:3000/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bucket: 'tattoo-images',
      fileName: 'test.png',
      fileData: testBase64,
      contentType: 'image/png',
    }),
  });
  
  console.log('状态码:', response.status);
  const data = await response.json();
  console.log('响应:', JSON.stringify(data, null, 2));
}

testUpload().catch(console.error);
