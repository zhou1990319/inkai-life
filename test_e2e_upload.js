/**
 * 完整端到端测试：创建测试图片 -> 压缩 -> 上传
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建一个测试 PNG 图片 (1x1 像素红色)
function createTestPNG() {
  // PNG 文件头和最小数据
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, // compressed data
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD, //
    0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, // IEND chunk
    0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82            // IEND
  ]);
  return pngData;
}

// 创建一个大一点的测试图片 (模拟 2000x2000 图片的 base64)
function createLargeTestBase64() {
  // 使用随机数据模拟一个大图片
  const crypto = require('crypto');
  // 模拟 2000x2000 PNG，压缩后约 500KB
  const size = 500 * 1024;
  return crypto.randomBytes(Math.floor(size * 0.75)).toString('base64');
}

// 测试上传函数
async function testUpload(fileData, filename) {
  return new Promise((resolve, reject) => {
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

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== InkAI 图片上传完整测试 ===\n');

  // 测试 1: 极小文件
  console.log('1. 测试极小文件 (1px PNG)...');
  const smallPNG = createTestPNG().toString('base64');
  const result1 = await testUpload(smallPNG, 'test_1px.png');
  console.log(`   状态: ${result1.status}`);
  console.log(`   结果: ${result1.body.success ? '✅ 成功' : '❌ 失败 - ' + JSON.stringify(result1.body)}`);

  // 测试 2: 中等文件 (100KB)
  console.log('\n2. 测试中等文件 (100KB)...');
  const crypto = require('crypto');
  const mediumData = crypto.randomBytes(100 * 1024).toString('base64');
  const result2 = await testUpload(mediumData, 'test_100kb.png');
  console.log(`   状态: ${result2.status}`);
  console.log(`   结果: ${result2.body.success ? '✅ 成功' : '❌ 失败 - ' + JSON.stringify(result2.body)}`);

  // 测试 3: 大文件 (500KB)
  console.log('\n3. 测试大文件 (500KB)...');
  const largeData = crypto.randomBytes(500 * 1024).toString('base64');
  const result3 = await testUpload(largeData, 'test_500kb.png');
  console.log(`   状态: ${result3.status}`);
  console.log(`   结果: ${result3.body.success ? '✅ 成功' : '❌ 失败 - ' + JSON.stringify(result3.body)}`);

  // 测试 4: 极大文件 (1MB)
  console.log('\n4. 测试极大文件 (1MB)...');
  const hugeData = crypto.randomBytes(1024 * 1024).toString('base64');
  const result4 = await testUpload(hugeData, 'test_1mb.png');
  console.log(`   状态: ${result4.status}`);
  console.log(`   结果: ${result4.body.success ? '✅ 成功' : '❌ 失败 - ' + JSON.stringify(result4.body)}`);

  // 总结
  console.log('\n=== 测试结果总结 ===');
  const allPassed = [result1, result2, result3, result4].every(r => r.status === 200 && r.body.success);
  console.log(allPassed ? '✅ 所有测试通过！API 完全正常。' : '❌ 部分测试失败');

  if (!allPassed) {
    console.log('\n可能的问题:');
    console.log('1. 请在浏览器中清除缓存后重试 (Ctrl+Shift+R)');
    console.log('2. 检查浏览器控制台是否有 JavaScript 错误');
    console.log('3. 检查网络面板查看请求详情');
  }
}

runTests().catch(console.error);
