import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, Star, Package } from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { useLanguage } from '../contexts/LanguageContext';
import { PLANS, PLAN_CATEGORIES, formatPrice, getMonthlyEquivalent, type PlanType } from '../services/subscription';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PricingProps {
  user: Profile | null;
}

const PLAN_ICONS: Record<PlanType, typeof Star> = {
  free: Star,
  starter: Package,
  basic_monthly: Sparkles,
  basic_yearly: Zap,
  pro_monthly: Crown,
  pro_yearly: Crown,
  unlimited: Zap,
};

export default function Pricing({ user }: PricingProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const isZh = language === 'zh';

  useEffect(() => {
    if (user?.current_plan) {
      setCurrentPlan(user.current_plan);
    }
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    if (planId === 'free') {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            current_plan: 'free',
            subscription_status: 'active',
          })
          .eq('id', user.id);

        if (error) throw error;
        setCurrentPlan('free');
      } catch (error) {
        console.error('Free plan activation failed:', error);
        alert(isZh ? '激活失败，请重试' : 'Activation failed, please try again');
      } finally {
        setLoading(false);
      }
      return;
    }

    setShowPaymentModal(true);
  };

  const getPeriodLabel = (plan: PlanType): string => {
    const details = PLANS[plan];
    switch (details.billing) {
      case 'free': return isZh ? '永久免费' : 'Free Forever';
      case 'one_time': return isZh ? '一次性' : 'One-time';
      case 'monthly': return isZh ? '/月' : '/month';
      case 'yearly': return isZh ? '/年' : '/year';
      default: return '';
    }
  };

  const getDescription = (plan: PlanType): string => {
    const details = PLANS[plan];
    return isZh ? details.name : details.nameEn;
  };

  const getCTA = (plan: PlanType): string => {
    if (plan === 'free') return isZh ? '免费开始' : 'Start Free';
    return isZh ? '立即升级' : 'Upgrade Now';
  };

  const renderPlanCard = (planId: PlanType, index: number) => {
    const plan = PLANS[planId];
    const Icon = PLAN_ICONS[planId];
    const isCurrentPlan = currentPlan === planId || (planId === 'free' && !user);
    const isHighlight = plan.highlight || planId === 'basic_monthly';

    return (
      <motion.div
        key={planId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative rounded-3xl overflow-hidden backdrop-blur-sm ${
          isHighlight
            ? 'bg-gradient-to-b from-china-red-900/60 to-ink-black border-2 border-china-red-500 shadow-red-glow'
            : 'bg-white/5 border border-imperial-gold-500/30 hover:border-imperial-gold-500/50'
        }`}
      >
        {/* Badge */}
        {plan.badge && (
          <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold ${
            isHighlight
              ? 'bg-china-red-500 text-white shadow-lg'
              : 'bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 text-ink-black'
          }`}>
            {plan.badge}
          </div>
        )}

        <div className="p-8">
          {/* Plan Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isHighlight 
                ? 'bg-gradient-to-br from-china-red-500 to-china-red-700 shadow-lg' 
                : 'bg-gradient-to-br from-imperial-gold-500 to-imperial-gold-700'
            }`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-rice-paper">{isZh ? plan.name : plan.nameEn}</h3>
              <p className="text-rice-paper/50 text-sm">{getDescription(planId)}</p>
            </div>
          </div>

          {/* Price - 大字体价格显示 */}
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-imperial-gold-400 text-2xl font-bold">$</span>
              <span className={`text-5xl md:text-6xl font-display font-bold ${plan.price === 0 ? 'text-rice-paper/50' : 'text-rice-paper'}`}>
                {plan.price === 0 ? 'Free' : plan.price}
              </span>
              <span className="text-rice-paper/50 text-lg">{getPeriodLabel(planId)}</span>
            </div>
            {plan.billing === 'yearly' && (
              <p className="text-imperial-gold-400 text-sm mt-2">
                {isZh ? '≈ ' : '≈ '}{getMonthlyEquivalent(plan.price)}/mo
              </p>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => handleSubscribe(planId)}
            disabled={loading || isCurrentPlan}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all mb-8 ${
              isCurrentPlan
                ? 'bg-white/10 text-rice-paper/40 cursor-not-allowed'
                : isHighlight
                ? 'bg-gradient-to-r from-china-red-600 to-china-red-700 hover:from-china-red-500 hover:to-china-red-600 text-white shadow-red-glow'
                : 'bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 hover:from-imperial-gold-400 hover:to-imperial-gold-500 text-ink-black shadow-gold'
            }`}
          >
            {isCurrentPlan
              ? (isZh ? '当前方案' : 'Current Plan')
              : loading
                ? (isZh ? '加载中...' : 'Loading...')
                : getCTA(planId)
            }
          </button>

          {/* Features */}
          <div className="space-y-4">
            {(isZh ? plan.featuresZh : plan.features).map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isHighlight ? 'bg-china-red-500/20' : 'bg-imperial-gold-500/20'
                }`}>
                  <Check className={`w-3 h-3 ${isHighlight ? 'text-china-red-400' : 'text-imperial-gold-400'}`} />
                </div>
                <span className="text-rice-paper/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-black via-china-red-950/30 to-ink-black py-16 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
          <span className="bg-gradient-to-r from-imperial-gold-300 via-imperial-gold-500 to-imperial-gold-300 bg-clip-text text-transparent">
            {isZh ? 'InkAI 高级会员' : 'InkAI Premium Membership'}
          </span>
        </h1>
        <p className="text-rice-paper/60 text-xl max-w-2xl mx-auto">
          {isZh ? '选择最适合您的方案，用AI释放你的创意' : 'Choose the plan that works best for you. Unleash your creativity with AI'}
        </p>
        <div className="mt-8 inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-imperial-gold-500/20">
          <span className="text-imperial-gold-400 text-sm font-medium">
            {isZh ? '对比竞品' : 'vs Competitors'}
          </span>
          <span className="text-rice-paper/30">|</span>
          <span className="text-china-red-400 text-sm">
            {isZh ? '月付便宜20% | 年付省50%' : 'Monthly 20% cheaper | Yearly save 50%'}
          </span>
        </div>
      </motion.div>

      {/* Individual Plans */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-display font-bold text-rice-paper mb-8 flex items-center gap-3">
          <Star className="text-imperial-gold-400" size={24} />
          {isZh ? PLAN_CATEGORIES.individual.titleZh : PLAN_CATEGORIES.individual.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLAN_CATEGORIES.individual.plans.map((planId, i) => renderPlanCard(planId, i))}
        </div>
      </div>

      {/* Studio Plans */}
      <div className="max-w-7xl mx-auto mb-20">
        <h2 className="text-2xl font-display font-bold text-rice-paper mb-8 flex items-center gap-3">
          <Crown className="text-imperial-gold-400" size={24} />
          {isZh ? PLAN_CATEGORIES.studio.titleZh : PLAN_CATEGORIES.studio.title}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLAN_CATEGORIES.studio.plans.map((planId, i) => renderPlanCard(planId, i + 4))}
        </div>
      </div>

      {/* Payment Coming Soon Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-china-red-900/80 to-ink-black border border-imperial-gold-500/30 rounded-3xl p-10 max-w-md mx-4 shadow-gold-lg"
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-imperial-gold-500/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-imperial-gold-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-rice-paper mb-4">
                {isZh ? '支付功能即将上线' : 'Payment Coming Soon'}
              </h2>
              <p className="text-rice-paper/60 mb-8 leading-relaxed">
                {isZh
                  ? '我们正在集成 Stripe 支付系统，敬请期待！您可以通过联系客服完成购买。'
                  : 'We are integrating Stripe payment. Coming soon! Contact support to purchase.'
                }
              </p>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 hover:from-imperial-gold-400 hover:to-imperial-gold-500 text-ink-black transition-all"
              >
                {isZh ? '我知道了' : 'Got it'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-3xl mx-auto mt-24"
      >
        <h2 className="text-3xl font-display font-bold text-rice-paper text-center mb-10">
          {isZh ? '常见问题' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-4">
          {[
            {
              q: isZh ? '可以退款吗？' : 'Can I get a refund?',
              a: isZh
                ? '首次购买7天内可全额退款。联系客服处理。'
                : 'Full refund within 7 days for first-time purchases. Contact support to process.',
            },
            {
              q: isZh ? '如何取消自动续费？' : 'How do I cancel auto-renewal?',
              a: isZh
                ? '随时可在账户设置中取消。您的权益将持续到当前计费周期结束。'
                : 'Cancel anytime in account settings. Your benefits continue until the end of your billing period.',
            },
            {
              q: isZh ? '可以商业使用设计吗？' : 'Can I use designs commercially?',
              a: isZh
                ? 'Pro 及以上方案包含商业授权。'
                : 'Pro and above plans include commercial use license.',
            },
            {
              q: isZh ? '免费用户有限制吗？' : 'Are there limits for free users?',
              a: isZh
                ? '免费用户每天可生成10次，非常适合体验 AI 纹身设计。'
                : 'Free users get 10 generations per day - perfect for trying out AI tattoo designs.',
            },
            {
              q: isZh ? '支持哪些支付方式？' : 'What payment methods are supported?',
              a: isZh
                ? '支持信用卡、PayPal、Apple Pay、Google Pay。'
                : 'Credit card, PayPal, Apple Pay, and Google Pay are supported.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-imperial-gold-500/20 hover:border-imperial-gold-500/40 transition-colors">
              <h3 className="text-rice-paper font-bold text-lg mb-2">{faq.q}</h3>
              <p className="text-rice-paper/60 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer Note */}
      <div className="text-center mt-16 text-rice-paper/40 text-sm">
        <p>{isZh
          ? '所有价格以美元计价。支持 PayPal / 信用卡 / Apple Pay / Google Pay'
          : 'All prices in USD. PayPal / Credit Card / Apple Pay / Google Pay accepted'
        }</p>
        <p className="mt-3">
          {isZh ? '有疑问？' : 'Questions?'} {' '}
          <a href="#/privacy" className="text-imperial-gold-400 hover:underline">
            {isZh ? '阅读我们的隐私政策' : 'Read our Privacy Policy'}
          </a>
        </p>
      </div>
    </div>
  );
}
