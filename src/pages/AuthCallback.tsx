import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Auth Callback 页面
 * 处理邮箱验证、密码重置、OAuth 回调
 */
export default function AuthCallback() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase 会自动从 URL hash 中提取 access_token
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] Session error:', error);
          setStatus('error');
          setMessage(isZh ? '验证失败，请重试。' : 'Verification failed. Please try again.');
          return;
        }

        if (data.session) {
          // 成功获取 session（邮箱验证成功）
          setStatus('success');
          setMessage(isZh ? '验证成功！正在跳转...' : 'Verification successful! Redirecting...');
          
          // 2秒后跳转到首页
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          // 没有 session，可能是 token 过期
          setStatus('error');
          setMessage(isZh ? '验证链接已过期，请重新注册。' : 'Verification link expired. Please register again.');
        }
      } catch (err) {
        console.error('[AuthCallback] Callback error:', err);
        setStatus('error');
        setMessage(isZh ? '验证过程出错，请重试。' : 'Verification error. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate, isZh]);

  return (
    <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#18181F] border border-[#2A2A36] rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#CFAF6E]/20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#CFAF6E] border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {isZh ? '正在验证...' : 'Verifying...'}
            </h1>
            <p className="text-[#B0B0B8]">
              {isZh ? '请稍候，我们正在验证您的邮箱...' : 'Please wait while we verify your email...'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {isZh ? '验证成功！' : 'Verification Successful!'}
            </h1>
            <p className="text-[#B0B0B8]">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#9E2B25]/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#9E2B25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {isZh ? '验证失败' : 'Verification Failed'}
            </h1>
            <p className="text-[#B0B0B8] mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-[#9E2B25] text-white font-bold rounded-xl hover:bg-[#B8342D] transition-colors"
            >
              {isZh ? '返回登录' : 'Back to Sign In'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
