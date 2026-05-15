// Vercel Serverless Function: Supabase 代理
// 利用 Vercel 全球 CDN 加速 Supabase 访问
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = 'https://zgolsxdwilktnxbzxfcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnb2xzeGR3aWxrdG54Ynp4ZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI5MDAsImV4cCI6MjA5Mzg2ODkwMH0.atU-vi-uwJKNegdmptDkvOyC4wPiK7ckNRwEJCDao8I';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 头 — 允许所有来源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, Prefer');
  res.setHeader('Access-Control-Max-Age', '86400');

  // 处理 preflight OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path as string;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const targetUrl = `${SUPABASE_URL}/rest/v1/${path}`;

  try {
    const headers: Record<string, string> = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const authHeader = req.headers.authorization;
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method || '') ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    // 透传响应头
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', message: error.message });
  }
}
