/**
 * Supabase client config
 * 鐜鍙橀噺閫氳繃 webpack.DefinePlugin 鍦ㄦ瀯寤烘椂娉ㄥ叆
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function getSupabaseUrl(): string {
  // 浼樺厛浣跨敤娉ㄥ叆鐨勭幆澧冨彉閲忥紝fallback 鍒?MEOO 骞冲彴閰嶇疆
  return (typeof process !== 'undefined' && process.env?.SUPABASE_URL)
    ? process.env.SUPABASE_URL
    : ((window as any).MEOO_CONFIG?.meoo_app_access_url || location.origin) + '/sb-api';
}

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY)
    ? process.env.SUPABASE_ANON_KEY
    : 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc4MDkyMjE2LCJleHAiOjEzMjg4NzMyMjE2fQ.nnk2FV_oC2XSrrN8KJfcjmeYG50sDrPIiCiW-lHKIf4';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
