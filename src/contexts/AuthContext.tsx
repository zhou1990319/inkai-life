import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../supabase/client';
import type { Profile } from '../supabase/types';

interface AuthContextType {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载用户profile
  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data as Profile | null;
  }, []);

  // 刷新用户数据
  const refreshUser = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const profile = await loadProfile(currentSession.user.id);
      setUser(profile);
      setSession(currentSession);
    } else {
      setUser(null);
      setSession(null);
    }
  }, [loadProfile]);

  // 初始化：加载session（只运行一次，不依赖 loadProfile 引用）
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (initialSession?.user) {
          setSession(initialSession);
          const profile = await loadProfile(initialSession.user.id);
          if (mounted) setUser(profile);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // 超时保护：10秒后强制结束loading
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth init timeout, proceeding anyway');
        setLoading(false);
      }
    }, 10000);

    initAuth();

    // 监听auth变化（INITIAL_SESSION 事件跳过，避免重复加载）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'INITIAL_SESSION') return;
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user) {
        const profile = await loadProfile(newSession.user.id);
        if (mounted) setUser(profile);
      } else {
        setUser(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 登录
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // 注册（注册后立即登录，无需邮箱验证）
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // 先检查用户名是否已存在
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        return { error: { message: 'Username already taken' } };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (error) {
        return { error };
      }

      // 注册成功，自动登录
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // 登录失败也继续，因为用户已在Supabase创建
          console.warn('Auto sign-in after registration failed, proceeding anyway:', signInError.message);
        }

        // 创建profile（如果不存在）
        const profile = await loadProfile(data.user.id);
        if (!profile) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            username,
            display_name: username,
            email: data.user.email,
            subscription_status: 'free',
            current_plan: 'free',
            trial_available: true,
            followers_count: 0,
            following_count: 0,
            is_artist: false,
            artist_verified: false,
          });
          if (profileError) {
            console.warn('Profile creation failed:', profileError.message);
          }

          // 创建默认订阅记录
          await supabase.from('subscriptions').insert({
            user_id: data.user.id,
            plan_type: 'free',
            status: 'active',
            started_at: new Date().toISOString(),
            auto_renew: false,
          });
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error('SignUp error:', err);
      return { error: { message: err.message || 'Registration failed. Please try again.' } };
    }
  };

  // 登出
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 便捷hook：检查是否已登录
export function useAuthCheck() {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, isLoading: loading, user };
}
