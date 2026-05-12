import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PaymentCancel() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  return (
    <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          {isZh ? '支付已取消' : 'Payment Cancelled'}
        </h1>
        <p className="text-stone-400 mb-8">
          {isZh
            ? '您的订单已取消，费用不会扣除。随时可以重新购买。'
            : 'Your order has been cancelled. No charges were made. You can purchase anytime.'}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/pricing"
            className="bg-[#CFAF6E] text-stone-950 font-bold py-3 px-6 rounded-xl hover:bg-[#E0C47E] transition-colors"
          >
            {isZh ? '重新选择方案' : 'Choose a Plan'}
          </Link>
          <Link
            to="/"
            className="text-stone-400 hover:text-white py-2 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {isZh ? '返回首页' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
