/**
 * Supabase client config
 * 优先使用Cloudflare Worker代理加速全球访问
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://zgolsxdwilktnxbzxfcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnb2xzeGR3aWxrdG54Ynp4ZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI5MDAsImV4cCI6MjA5Mzg2ODkwMH0.atU-vi-uwJKNegdmptDkvOyC4wPiK7ckNRwEJCDao8I';

// Worker代理地址（相对路径，自动适配当前域名）
const workerProxyUrl = '/supabase-api';

// 自定义fetch，优先走Worker代理，带超时保护
const customFetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : (input as URL).href;

  // 判断是否应该走代理（排除rest/v1/auth相关路径）
  const shouldProxy = !url.includes('/auth/') && !url.includes('/storage/');

  let targetUrl = url;
  if (shouldProxy) {
    // 替换原始Supabase URL为Worker代理
    targetUrl = url.replace(supabaseUrl, workerProxyUrl);
  }

  // 超时控制：10秒
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout (10s)')), 10000);
  });

  const fetchPromise = fetch(targetUrl, {
    ...init,
    // 保留原始headers
    headers: {
      ...init?.headers,
      // Supabase需要的认证头
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  });

  return Promise.race([fetchPromise, timeoutPromise]);
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: customFetch,
  },
});

// 导出 getter 函数
export const getSupabaseUrl = () => supabaseUrl;
export const getSupabaseAnonKey = () => supabaseAnonKey;
