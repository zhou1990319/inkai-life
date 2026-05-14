import { useState } from '\''react'\'';
import { Link, useNavigate, useSearchParams } from '\''react-router-dom'\'';
import { motion } from '\''framer-motion'\'';
import { User, Mail, Lock, Sparkles, Eye, EyeOff, Check, X } from '\''lucide-react'\'';
import { useAuth } from '\''../contexts/AuthContext'\'';
import { useLanguage } from '\''../contexts/LanguageContext'\'';

export default function Register() {
  const { t, language } = useLanguage();
  const isZh = language === '\''zh'\'';
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('\''redirect'\'') || '\''/'\'';

  const [username, setUsername] = useState('\'''\'');
  const [email, setEmail] = useState('\'''\'');
  const [password, setPassword] = useState('\'''\'');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('\'''\'');

  const passwordChecks = [
    { test: password.length >= 8, label: isZh ? '\''8+ 个字符'\'' : '\''8+ characters'\'' },
    { test: /[A-Z]/.test(password), label: isZh ? '\''大写字母'\'' : '\''Uppercase letter'\'' },
    { test: /[a-z]/.test(password), label: isZh ? '\''小写字母'\'' : '\''Lowercase letter'\'' },
    { test: /[0-9]/.test(password), label: isZh ? '\''数字'\'' : '\''Number'\'' },
  ];
  const strengthScore = passwordChecks.filter(c => c.test).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('\'''\'');

    if (username.length < 3) {
      setError(isZh ? '\''用户名至少需要 3 个字符'\'' : '\''Username must be at least 3 characters'\'');
      setLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(isZh ? '\''用户名只能包含字母、数字和下划线'\'' : '\''Username can only contain letters, numbers, and underscores'\'');
      setLoading(false);
      return;
    }
    if (strengthScore < 3) {
      setError(isZh ? '\''密码太弱，请包含大写字母、小写字母和数字'\'' : '\''Password is too weak. Please include uppercase, lowercase, and numbers.'\'');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp(email, password, username);
      if (signUpError) throw signUpError;
      navigate(redirectTo);
    } catch (err: any) {
      if (err.message?.includes('\''already registered'\'')) {
        setError(isZh ? '\''该邮箱已注册，请直接登录'\'' : '\''This email is already registered. Try signing in.'\'');
      } else {
        setError(err.message || (isZh ? '\''注册失败，请重试'\'' : '\''Registration failed. Please try again.'\''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
              <span className="text-black font-bold text-lg">墨</span>
            </div>
            <span className="text-xl font-bold text-black">InkAI<span className="text-gray-600">.life</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-black mb-2">{t('\''auth.create_account'\'')}</h1>
          <p className="text-gray-500">{t('\''auth.join_community'\'')}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">{t('\''auth.username'\'')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
                placeholder={t('\''auth.choose_username'\'') || '\''Choose a username'\''} required minLength={3} pattern="[a-zA-Z0-9_]+" />
            </div>
            <p className="text-gray-500 text-xs mt-1">{isZh ? "仅支持字母、数字和下划线" : "Letters, numbers, and underscores only"}</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">{t('\''auth.email'\'')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
                placeholder={t('\''auth.enter_email'\'') || '\''Enter your email'\''} required />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">{t('\''auth.password'\'')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPassword ? '\''text'\'' : '\''password'\''} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
                placeholder={t('\''auth.create_password'\'') || '\''Create a password'\''} required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${strengthScore >= level ? strengthScore <= 2 ? '\''bg-black'\'' : strengthScore === 3 ? '\''bg-gray-600'\'' : '\''bg-green-500'\'' : '\''bg-gray-200'\''}`} />
                  ))}
                </div>
                <div className="space-y-1">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {check.test ? <Check className="w-3 h-3 text-green-600" /> : <X className="w-3 h-3 text-gray-400" />}
                      <span className={check.test ? '\''text-green-600'\'' : '\''text-gray-500'\''}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-gray-500 text-xs text-center">
            {isZh ? '\''注册即表示您同意我们的'\'' : '\''By signing up, you agree to our'\''}{'\'' '\''}
            <Link to="/terms" className="text-black hover:underline font-medium">{isZh ? '\''服务条款'\'' : '\''Terms'\''}</Link>
            {'\'' '\''}{isZh ? '\''和'\'' : '\''and'\''}{'\'' '\''}
            <Link to="/privacy" className="text-black hover:underline font-medium">{isZh ? '\''隐私政策'\'' : '\''Privacy Policy'\''}</Link>
          </p>

          <button type="submit" disabled={loading || strengthScore < 3}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-5 h-5" />{t('\''auth.create_account'\'')}</>}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          {t('\''auth.has_account'\'')}{'\'' '\''}
          <Link to="/login" className="text-black hover:underline font-medium">{t('\''auth.sign_in_link'\'')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
