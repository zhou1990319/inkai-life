import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PaymentSuccess() {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟支付验证
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          {loading
            ? (isZh ? '验证支付中...' : 'Verifying payment...')
            : (isZh ? '支付成功！' : 'Payment Successful!')}
        </h1>
        <p className="text-stone-400 mb-8">
          {isZh
            ? '您的会员已激活，现在可以享受所有高级功能。'
            : 'Your membership is now active. Enjoy all premium features!'}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/ai-studio"
            className="bg-[#CFAF6E] text-stone-950 font-bold py-3 px-6 rounded-xl hover:bg-[#E0C47E] transition-colors flex items-center justify-center gap-2"
          >
            {isZh ? '开始创作' : 'Start Creating'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="text-stone-400 hover:text-white py-2 transition-colors"
          >
            {isZh ? '返回首页' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
