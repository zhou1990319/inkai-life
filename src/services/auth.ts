/**
 * 认证服务 - Auth Service
 * 处理用户登录、注册、密码重置等
 */
import { supabase } from '../supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  subscription_status?: string;
  current_plan?: string;
}

export interface SignUpResult {
  user: AuthUser | null;
  error: string | null;
  needsEmailConfirmation: boolean;
}

export interface SignInResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * 用户注册
 */
export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<SignUpResult> {
  try {
    // 1. 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError) {
      return { user: null, error: authError.message, needsEmailConfirmation: false };
    }

    if (!authData.user) {
      return { user: null, error: 'Registration failed', needsEmailConfirmation: false };
    }

    // 2. 创建用户 profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username,
      display_name: username,
      subscription_status: 'free',
      current_plan: 'free',
      trial_available: true,
      followers_count: 0,
      following_count: 0,
      is_artist: false,
      artist_verified: false,
    });

    if (profileError) {
      console.error('[Auth] Profile creation error:', profileError);
      // 不返回错误，因为用户已经创建成功
    }

    // 3. 创建默认订阅记录
    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: authData.user.id,
      plan_type: 'free',
      status: 'active',
    });

    if (subError) {
      console.error('[Auth] Subscription creation error:', subError);
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        username,
        subscription_status: 'free',
        current_plan: 'free',
      },
      error: null,
      needsEmailConfirmation: !authData.session, // 如果没有 session，说明需要邮箱验证
    };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Registration failed',
      needsEmailConfirmation: false,
    };
  }
}

/**
 * 用户登录
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Login failed' };
    }

    // 获取用户 profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        subscription_status: profile?.subscription_status,
        current_plan: profile?.current_plan,
      },
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Login failed',
    };
  }
}

/**
 * 用户登出
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Sign out failed' };
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      username: profile?.username,
      avatar_url: profile?.avatar_url,
      subscription_status: profile?.subscription_status,
      current_plan: profile?.current_plan,
    };
  } catch {
    return null;
  }
}

/**
 * 发送密码重置邮件
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message || null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to send reset email' };
  }
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error?.message || null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update password' };
  }
}

/**
 * OAuth 登录 (Google)
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message || null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Google sign in failed' };
  }
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });
}
