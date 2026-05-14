/**
 * Supabase client config
 * 简洁版本，带超时保护
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://zgolsxdwilktnxbzxfcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnb2xzeGR3aWxrdG54Ynp4ZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI5MDAsImV4cCI6MjA5Mzg2ODkwMH0.atU-vi-uwJKNegdmptDkvOyC4wPiK7ckNRwEJCDao8I';

// 超时保护的fetch
const fetchWithTimeout = async (url: string, options?: RequestInit, timeout = 8000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接');
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
    fetch: fetchWithTimeout as any,
  },
});

export const getSupabaseUrl = () => supabaseUrl;
export const getSupabaseAnonKey = () => supabaseAnonKey;
