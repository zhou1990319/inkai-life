/**
 * Cloudflare Worker: Supabase API Proxy
 * 代理Supabase请求，利用Cloudflare全球CDN加速
 */

const SUPABASE_URL = 'https://zgolsxdwilktnxbzxfcw.supabase.co';
const SUPABASE_HEADERS = {
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnb2xzeGR3aWxrdG54Ynp4ZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI5MDAsImV4cCI6MjA5Mzg2ODkwMH0.atU-vi-uwJKNegdmptDkvOyC4wPiK7ckNRwEJCDao8I',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnb2xzeGR3aWxrdG54Ynp4ZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI5MDAsImV4cCI6MjA5Mzg2ODkwMH0.atU-vi-uwJKNegdmptDkvOyC4wPiK7ckNRwEJCDao8I'
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // 路径重写：/supabase-api/* -> /*
  const path = url.pathname.replace('/supabase-api', '');

  // 构建目标URL
  const targetUrl = `${SUPABASE_URL}${path}${url.search}`;

  // 复制原始请求的headers（处理认证）
  const headers = new Headers();
  const authHeader = request.headers.get('Authorization');
  const apikeyHeader = request.headers.get('apikey');

  if (authHeader) {
    headers.set('Authorization', authHeader);
    headers.set('apikey', apikeyHeader || SUPABASE_HEADERS.apikey);
  } else {
    headers.set('Authorization', SUPABASE_HEADERS.Authorization);
    headers.set('apikey', SUPABASE_HEADERS.apikey);
  }

  // 设置内容类型
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  try {
    // 发起请求到Supabase
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? request.clone().body : undefined,
    });

    // 复制响应
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    // Supabase连接失败时返回友好错误
    return new Response(JSON.stringify({
      error: 'Service temporarily unavailable',
      message: 'Please try again later'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// 处理OPTIONS预检请求
if (request.method === 'OPTIONS') {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    }
  });
}
