/**
 * Supabase client config
 * 直接使用注入的环境变量（Render 构建时替换）
 *  fallback：直连 Supabase 项目
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = (
  typeof process !== 'undefined' && process.env?.SUPABASE_URL
) ? process.env.SUPABASE_URL : 'https://zgolsxdwilktnxbzxfcw.supabase.co';

const supabaseAnonKey = (
  typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY
) ? process.env.SUPABASE_ANON_KEY : '';

if (!supabaseAnonKey) {
  console.error(
    '[Supabase] 缺少 SUPABASE_ANON_KEY！' +
    '请在 Render Dashboard → Environment 中设置，或提供正确的 anon key。'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
