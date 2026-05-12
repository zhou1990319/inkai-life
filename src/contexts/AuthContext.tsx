import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../supabase/client';
import type { Profile } from '../supabase/types';

interface AuthContextType {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any; needsConfirmation?: boolean }>;
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

  // 初始化：加载session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          setSession(initialSession);
          const profile = await loadProfile(initialSession.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 监听auth变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth event:', event);
      setSession(newSession);
      
      if (newSession?.user) {
        const profile = await loadProfile(newSession.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // 登录
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // 注册
  const signUp = async (email: string, password: string, username: string) => {
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

    // 如果注册成功且有用户，额外创建profile（以防触发器失败）
    if (data.user && !error) {
      const profile = await loadProfile(data.user.id);
      if (!profile) {
        // 手动创建profile（包含完整字段）
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
          console.error('Profile creation error:', profileError);
        }

        // 创建默认订阅记录
        const { error: subError } = await supabase.from('subscriptions').insert({
          user_id: data.user.id,
          plan_type: 'free',
          status: 'active',
          started_at: new Date().toISOString(),
          auto_renew: false,
        });
        if (subError) {
          console.error('Subscription creation error:', subError);
        }
      }
    }

    return { 
      error, 
      needsConfirmation: data?.user && !data.session 
    };
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
