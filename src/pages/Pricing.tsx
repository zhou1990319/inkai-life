// Pricing.tsx 修复版本 - 添加多语言支持
// 关键修改：将所有硬编码英文替换为 t() 翻译函数

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Crown, Zap, Star } from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { useLanguage } from '../contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PricingProps {
  user: Profile | null;
}

export default function Pricing({ user }: PricingProps) {
  const { t, language } = useLanguage(); // 获取当前语言
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [showEarlyBird, setShowEarlyBird] = useState(true);

  // 根据语言获取计划配置
  const getPlans = () => {
    const isZh = language === 'zh';
    
    return [
      {
        id: 'free',
        name: isZh ? '入门版' : 'Inker',
        icon: Star,
        color: 'from-stone-800 to-stone-900',
        price: 0,
        period: isZh ? '永久免费' : 'Free Forever',
        description: isZh ? '开始使用AI纹身设计' : 'Get started with AI tattoo designs',
        features: [
          { text: isZh ? '每天10次AI生成' : '10 AI generations per day', included: true },
          { text: isZh ? '1024px标准高清下载' : '1024px standard HD download', included: true },
          { text: isZh ? '20个基础中式模板' : '20 basic Chinese-style templates', included: true },
          { text: isZh ? '轻度水印' : 'Light watermark', included: true, note: isZh ? "适合给纹身师参考" : "Perfect for artist reference" },
          { text: isZh ? '有限展示广告' : 'Limited display ads', included: true },
          { text: isZh ? '云端存储30个设计' : 'Cloud storage for 30 designs', included: true },
          { text: isZh ? '龙凤墨韵风格' : 'Dragon Phoenix ink style', included: false },
          { text: isZh ? '无水印下载' : 'No watermark downloads', included: false },
          { text: isZh ? '商业授权' : 'Commercial license', included: false },
          { text: isZh ? '无限生成' : 'Unlimited generations', included: false },
        ],
        cta: isZh ? '免费开始' : 'Start Free',
        popular: false,
      },
      {
        id: 'monthly',
        name: isZh ? '锦鲤月卡' : 'Koi Monthly',
        icon: Sparkles,
        color: 'from-amber-600 to-amber-700',
        price: 9.99,  // 更新为新定价
        period: isZh ? '/月' : '/month',
        description: isZh ? '适合认真的纹身爱好者' : 'For serious tattoo enthusiasts',
        features: [
          { text: isZh ? '每月150次AI生成' : '150 AI generations per month', included: true },
          { text: isZh ? '2048px超高清下载' : '2048px ultra HD download', included: true },
          { text: isZh ? '50个专属中式模板' : '50 exclusive Chinese-style templates', included: true },
          { text: isZh ? '完全无水印' : 'Fully watermark-free', included: true },
          { text: isZh ? '基础墨韵风格解锁' : 'Basic ink style unlock', included: true },
          { text: isZh ? '云端存储200个设计' : 'Cloud storage for 200 designs', included: true },
          { text: isZh ? '优先生成队列' : 'Priority generation queue', included: true },
          { text: isZh ? '无广告体验' : 'Ad-free experience', included: true },
          { text: isZh ? '商业授权' : 'Commercial license', included: false },
          { text: isZh ? '无限生成' : 'Unlimited generations', included: false },
        ],
        cta: isZh ? '立即升级' : 'Upgrade Now',
        popular: true,
        badge: isZh ? '最受欢迎' : 'Most Popular',
      },
      {
        id: 'yearly',
        name: isZh ? '龙王年卡' : 'Dragon King',
        icon: Zap,
        color: 'from-amber-500 to-orange-600',
        price: 59,  // 更新为新定价
        period: isZh ? '/年' : '/year',
        description: isZh ? '纹身爱好者的最佳选择' : 'Best value for tattoo lovers',
        yearlyPrice: '$59/year',
        monthlyEquivalent: isZh ? '≈ ¥4.92/月 (省50%)' : '≈ $4.92/month (Save 50%)',
        features: [
          { text: isZh ? '每年1800次AI生成 (150/月)' : '1,800 AI generations per year (150/mo)', included: true },
          { text: isZh ? '2048px超高清下载' : '2048px ultra HD download', included: true },
          { text: isZh ? '全部120个中式模板' : 'All 120 Chinese-style templates', included: true },
          { text: isZh ? '龙凤/麒麟/朱雀/青龙风格' : 'Dragon Phoenix / Unicorn / Vermilion / Azure styles', included: true },
          { text: isZh ? '完全无水印' : 'Fully watermark-free', included: true },
          { text: isZh ? '个人商业授权' : 'Personal commercial license', included: true },
          { text: isZh ? '闪电般快速生成' : 'Lightning fast generation', included: true },
          { text: isZh ? '无限云端存储' : 'Unlimited cloud storage', included: true },
          { text: isZh ? '无广告体验' : 'Ad-free experience', included: true },
          { text: isZh ? '优先客服支持' : 'Priority customer support', included: true },
        ],
        cta: isZh ? '早鸟价购买' : 'Early Bird Price',
        popular: false,
        badge: isZh ? '最佳性价比' : 'Best Value',
        earlyBird: {
          price: 59,
          originalPrice: 118,
          label: isZh ? '早鸟特惠' : 'Early Bird Deal',
          remaining: 1000,
        },
      },
      {
        id: 'lifetime',
        name: isZh ? '传奇终身版' : 'Legend VIP',
        icon: Crown,
        color: 'from-yellow-400 to-amber-500',
        price: 599,  // 更新为新定价
        period: isZh ? '终身' : 'Lifetime',
        description: isZh ? '为硬核纹身收藏家打造' : 'For hardcore tattoo collectors',
        features: [
          { text: isZh ? '终身无限AI生成' : 'Lifetime unlimited AI generations', included: true },
          { text: isZh ? '2048px + PNG透明背景' : '2048px + PNG transparent background', included: true },
          { text: isZh ? '全部模板 + 未来新增免费' : 'All templates + future additions FREE', included: true },
          { text: isZh ? '自定义专属风格' : 'Custom exclusive style', included: true },
          { text: isZh ? '完整商业授权' : 'Full commercial license', included: true },
          { text: isZh ? '纹身工作室商业授权' : 'Tattoo studio commercial license', included: true },
          { text: isZh ? 'VIP最快生成速度' : 'VIP fastest generation speed', included: true },
          { text: isZh ? '无限存储 + 作品集展示' : 'Unlimited storage + portfolio showcase', included: true },
          { text: isZh ? 'VIP专属徽章' : 'VIP exclusive badge', included: true },
          { text: isZh ? '赠送好友1年订阅' : 'Gift 1-year subscription to a friend', included: true },
        ],
        cta: isZh ? '锁定终身价' : 'Lock Lifetime Price',
        popular: false,
        badge: isZh ? '终身最佳' : 'Lifetime Best',
        earlyBird: {
          price: 399,  // 早鸟价
          originalPrice: 599,
          label: isZh ? '早鸟限时' : 'Early Bird Limited',
          remaining: 200,
        },
      },
    ];
  };

  const plans = getPlans();

  useEffect(() => {
    if (user?.current_plan) {
      setCurrentPlan(user.current_plan);
    }
  }, [user]);

  const handleSubscribe = async (planId: string, isEarlyBird: boolean = false) => {
    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    setLoading(true);

    try {
      const planType = planId === 'free' ? 'free' : planId;
      const expiresAt = planId === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : planId === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          current_plan: planType,
          subscription_status: 'active',
        })
        .eq('id', user.id);

      if (error) throw error;

      if (planId !== 'free') {
        await supabase.from('subscriptions').insert({
          user_id: user.id,
          plan_type: planType,
          status: 'active',
          expires_at: expiresAt,
          is_early_bird: isEarlyBird,
          auto_renew: true,
        });
      }

      setCurrentPlan(planType);
      alert(isEarlyBird 
        ? (language === 'zh' ? '早鸟购买成功！' : 'Early bird purchase successful!')
        : (language === 'zh' ? '订阅成功！' : 'Subscription successful!')
      );
    } catch (error) {
      console.error('Subscription failed:', error);
      alert(language === 'zh' ? '订阅失败，请重试' : 'Subscription failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const isZh = language === 'zh';

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 py-12 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            {isZh ? 'InkAI 高级会员' : 'InkAI Premium Membership'}
          </span>
        </h1>
        <p className="text-stone-400 text-lg max-w-2xl mx-auto">
          {isZh ? '选择最适合您的方案' : 'Choose the plan that works best for you'}
        </p>

        {/* Comparison Note */}
        <div className="mt-6 inline-flex items-center gap-2 bg-stone-900/50 rounded-full px-4 py-2">
          <span className="text-amber-400 text-sm font-medium">
            {isZh ? '与竞品对比' : 'vs Competitors'}
          </span>
          <span className="text-stone-500 text-sm">|</span>
          <span className="text-green-400 text-sm">
            {isZh ? '月付便宜20% | 年付便宜50%' : 'Monthly 20% cheaper | Yearly 50% cheaper'}
          </span>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id || (plan.id === 'free' && !user);
          const showPrice = plan.id === 'yearly' && showEarlyBird && plan.earlyBird
            ? plan.earlyBird.price
            : plan.price;
          const originalPrice = plan.earlyBird?.price && showEarlyBird
            ? plan.earlyBird.originalPrice
            : null;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden ${
                plan.popular
                  ? 'bg-stone-900/80 border-2 border-amber-600/50'
                  : 'bg-stone-900/50 border border-stone-700/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                  plan.id === 'monthly'
                    ? 'bg-amber-600 text-stone-950'
                    : plan.id === 'yearly'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Early Bird Banner */}
              {plan.earlyBird && showEarlyBird && (
                <div className="bg-amber-600/20 border-b border-amber-600/30 px-4 py-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-medium">
                      🎉 {plan.earlyBird.label}
                    </span>
                    <span className="text-stone-400">
                      {plan.earlyBird.remaining} {isZh ? '个名额剩余' : 'spots left'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-stone-400 text-sm">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-stone-500">$</span>
                    <span className={`text-4xl font-bold ${plan.price === 0 ? 'text-stone-400' : 'text-white'}`}>
                      {showPrice}
                    </span>
                    <span className="text-stone-500">{plan.period}</span>
                  </div>
                  {originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-stone-600 line-through text-sm">${originalPrice}</span>
                      <span className="bg-amber-600/20 text-amber-400 text-xs px-2 py-0.5 rounded">
                        {isZh ? '省' : 'Save'} ${originalPrice - showPrice}
                      </span>
                    </div>
                  )}
                  {plan.monthlyEquivalent && (
                    <p className="text-stone-500 text-sm mt-1">{plan.monthlyEquivalent}</p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(
                    plan.id,
                    plan.earlyBird && showEarlyBird
                  )}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-3 rounded-xl font-bold transition-all mb-6 ${
                    isCurrentPlan
                      ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 shadow-lg shadow-amber-600/25'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600'
                  }`}
                >
                  {isCurrentPlan 
                    ? (isZh ? '当前方案' : 'Current Plan')
                    : loading 
                      ? (isZh ? '加载中...' : 'Loading...')
                      : plan.cta
                  }
                </button>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-stone-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className={feature.included ? 'text-stone-300' : 'text-stone-600'}>
                          {feature.text}
                        </span>
                        {feature.note && (
                          <p className="text-stone-600 text-xs mt-0.5">{feature.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-3xl mx-auto mt-20"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-8">
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
              q: isZh ? '早鸟名额用完了怎么办？' : 'What if early bird spots run out?',
              a: isZh
                ? '名额满后价格将恢复原价。立即抢购！'
                : 'Prices return to regular rates once spots are filled. Grab yours now!',
            },
            {
              q: isZh ? '可以商业使用设计吗？' : 'Can I use designs commercially?',
              a: isZh
                ? '年付及以上方案包含个人商业授权。终身VIP包含完整商业权利（包括纹身工作室使用）。'
                : 'Yearly+ plans include personal commercial license. Lifetime VIP includes full commercial rights (including tattoo studio use).',
            },
            {
              q: isZh ? '免费用户有限制吗？' : 'Are there limits for free users?',
              a: isZh
                ? '免费用户每天可生成10次 - 非常适合体验中式纹身设计。'
                : 'Free users get 10 generations per day - perfect for trying out Chinese-style tattoo designs.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-stone-900/50 rounded-xl p-5 border border-stone-700/50">
              <h3 className="text-white font-medium mb-2">{faq.q}</h3>
              <p className="text-stone-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer Note */}
      <div className="text-center mt-12 text-stone-500 text-sm">
        <p>{isZh 
          ? '所有价格以美元计价。支持 PayPal / 信用卡 / Apple Pay / Google Pay'
          : 'All prices in USD. PayPal / Credit Card / Apple Pay / Google Pay accepted'
        }</p>
        <p className="mt-2">
          {isZh ? '有疑问？' : 'Questions?'} {' '}
          <a href="#/privacy" className="text-amber-400 hover:underline">
            {isZh ? '阅读我们的隐私政策' : 'Read our Privacy Policy'}
          </a>
        </p>
      </div>
    </div>
  );
}
