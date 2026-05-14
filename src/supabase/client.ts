/**
 * Supabase client config
 * 带 Vercel 代理支持，解决海外服务器访问超时问题
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://zgolsxdwilktnxbzxfcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnb2xzeGR3aWxrdG54Ynp4ZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI5MDAsImV4cCI6MjA5Mzg2ODkwMH0.atU-vi-uwJKNegdmptDkvOyC4wPiK7ckNRwEJCDao8I';

// 检测是否在 Vercel 环境
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const PROXY_URL = isVercel ? '/api/supabase-proxy' : supabaseUrl;

// 智能代理fetch
const smartFetch = async (url: string, options?: RequestInit, timeout = 15000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // 如果是 Supabase 请求且在 Vercel 环境，使用代理
    let targetUrl = url;
    if (isVercel && url.includes('supabase.co')) {
      // 提取路径
      const path = url.replace(supabaseUrl, '').replace(/^\//, '');
      targetUrl = `${PROXY_URL}?path=${encodeURIComponent(path)}`;
    }

    const response = await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Network timeout, please try again');
    }
    throw error;
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: smartFetch as any,
  },
});

export const getSupabaseUrl = () => supabaseUrl;
export const getSupabaseAnonKey = () => supabaseAnonKey;
