/**
 * Supabase client config
 * Supabase 配置直接内联，避免 webpack DefinePlugin 注入失败
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://zgolsxdwilktnxbzxfcw.supabase.co';

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnb2xzeGR3aWxrdG54Ynp4ZmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI5MDAsImV4cCI6MjA5Mzg2ODkwMH0.atU-vi-uwJKNegdmptDkvOyC4wPiK7ckNRwEJCDao8I';

if (!supabaseAnonKey) {
  console.error('[Supabase] 缺少 SUPABASE_ANON_KEY！');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 导出 getter 函数，供其他模块使用
export const getSupabaseUrl = () => supabaseUrl;
export const getSupabaseAnonKey = () => supabaseAnonKey;
