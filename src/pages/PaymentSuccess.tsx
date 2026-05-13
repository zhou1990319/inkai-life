import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PLANS, type PlanType } from '../services/subscription';
import { verifyPayPalPayment } from '../services/payment';

export default function PaymentSuccess() {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [planInfo, setPlanInfo] = useState<{ name: string; price: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const planParam = params.get('plan') as PlanType | null;

    if (orderId) {
      verifyPayPalPayment(orderId).then(result => {
        if (result.success && planParam && PLANS[planParam]) {
          const plan = PLANS[planParam];
          setPlanInfo({
            name: isZh ? plan.name : plan.nameEn,
            price: `${plan.price}`,
          });
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (planParam && PLANS[planParam]) {
      const plan = PLANS[planParam];
      setPlanInfo({
        name: isZh ? plan.name : plan.nameEn,
        price: `${plan.price}`,
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [location.search, isZh]);

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
        <p className="text-stone-400 mb-6">
          {isZh
            ? '您的会员已激活，现在可以享受所有高级功能。'
            : 'Your membership is now active. Enjoy all premium features!'}
        </p>

        {/* Payment Details */}
        {!loading && planInfo && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[#CFAF6E]/20">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-[#CFAF6E]" />
              <span className="text-white/60 text-sm font-medium">
                {isZh ? '支付详情' : 'Payment Details'}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/40 text-sm">{isZh ? '方案' : 'Plan'}</span>
                <span className="text-white font-medium">{planInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-sm">{isZh ? '金额' : 'Amount'}</span>
                <span className="text-[#CFAF6E] font-bold">{planInfo.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-sm">{isZh ? '支付方式' : 'Payment Method'}</span>
                <span className="text-white">PayPal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-sm">{isZh ? '状态' : 'Status'}</span>
                <span className="text-green-400 font-medium">{isZh ? '已完成' : 'Completed'}</span>
              </div>
            </div>
          </div>
        )}

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