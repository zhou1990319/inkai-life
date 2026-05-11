/**
 * 测试压缩和上传流程
 * 运行: node test_upload.js
 */

// 模拟浏览器环境的 base64 编解码
const atob = (str) => Buffer.from(str, 'base64').toString('binary');
const btoa = (str) => Buffer.from(str, 'binary').toString('base64');

// 模拟 compressImage 函数
function compressImage(fileData, maxWidth, quality) {
  // 假设 fileData 是 base64
  const binaryString = atob(fileData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 模拟图片尺寸计算
  // 假设原始图片是 2000x2000
  let width = 2000;
  let height = 2000;
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  console.log(`原始: 2000x2000 -> 压缩后: ${width}x${height}`);

  // 模拟压缩后的 base64 (假设压缩到 800px 宽度，质量 0.8)
  // 实际大小会更小，这里只是估算
  const compressedRatio = (width / 2000) * quality;
  const compressedLength = Math.floor(fileData.length * compressedRatio);

  return fileData.substring(0, compressedLength);
}

// 测试小文件
console.log('\n=== 测试小文件 (50KB) ===');
const smallBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='.repeat(50);
console.log('原始大小:', smallBase64.length, 'bytes (base64)');
console.log('解码后:', smallBase64.length * 0.75, 'bytes');

const smallCompressed = compressImage(smallBase64, 800, 0.8);
console.log('压缩后:', smallCompressed.length, 'bytes');

// 测试大文件
console.log('\n=== 测试大文件 (5MB) ===');
const largeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='.repeat(5000);
console.log('原始大小:', largeBase64.length, 'bytes (base64)');
console.log('解码后:', largeBase64.length * 0.75 / 1024 / 1024, 'MB');

const largeCompressed = compressImage(largeBase64, 800, 0.8);
console.log('压缩后:', largeCompressed.length, 'bytes');

// 测试上传
async function testUpload(fileData, filename) {
  const https = require('https');

  const data = JSON.stringify({
    bucket: 'tattoo-images',
    fileName: filename,
    fileData: fileData,
    contentType: 'image/png'
  });

  const options = {
    hostname: 'inkai.life',
    port: 443,
    path: '/api/upload-image',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('\n=== 测试实际上传 ===');

  // 测试小文件上传
  console.log('\n1. 小文件上传...');
  const result1 = await testUpload(smallCompressed, 'test_small.png');
  console.log('状态:', result1.status);
  console.log('结果:', result1.body.success ? '成功!' : '失败: ' + result1.body.error);

  // 测试大文件上传
  console.log('\n2. 大文件上传...');
  const result2 = await testUpload(largeCompressed, 'test_large.png');
  console.log('状态:', result2.status);
  console.log('结果:', result2.body.success ? '成功!' : '失败: ' + result2.body.error);

  console.log('\n=== 测试完成 ===');
}

runTests().catch(console.error);
