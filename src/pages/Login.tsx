import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      if (signInError.message?.includes('Invalid login credentials')) {
        setError(isZh ? '邮箱或密码错误，请重试�? : 'Incorrect email or password. Please try again.');
      } else if (signInError.message?.includes('Email not confirmed')) {
        setError(isZh ? '请先验证您的邮箱。请查看收件箱中的确认链接�? : 'Please verify your email first. Check your inbox for the confirmation link.');
      } else {
        setError(signInError.message || (isZh ? '登录失败，请重试�? : 'Sign in failed. Please try again.'));
      }
      setLoading(false);
    } else {
      // 登录成功，跳转到来源页面
      navigate(redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl p-8"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
              <span className="text-amber-600 font-bold text-lg">�?/span>
            </div>
            <span className="text-xl font-bold text-white">InkAI<span className="text-amber-600">.life</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.welcome_back')}</h1>
          <p className="text-gray-400">{t('auth.sign_in_to_continue')}</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-amber-600 text-sm font-medium mb-2">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
                placeholder={t('auth.enter_email') || 'Enter your email'}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-amber-600 text-sm font-medium mb-2">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
                placeholder={t('auth.enter_password') || 'Enter your password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {t('auth.sign_in')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-amber-600 hover:underline font-medium">
              {t('auth.sign_up_link')}
            </Link>
          </p>
        </div>

        {/* 登录后跳转提�?*/}
        {redirectTo !== '/' && (
          <p className="text-center mt-4 text-gray-400 text-xs">
            {isZh ? `登录后将跳转�?${redirectTo}` : `After signing in, you'll be redirected to ${redirectTo}`}
          </p>
        )}
      </motion.div>
    </div>
  );
}
