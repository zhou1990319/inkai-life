import { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { useLanguage } from '../contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PricingProps {
  user: Profile | null;
}

const PLANS = [
  {
    id: 'free',
    name: '免费版',
    nameEn: 'Free',
    price: 0,
    period: '永久免费',
    periodEn: 'Free Forever',
    features: [
      '每日 10 次 AI 生成',
      '基础风格模板',
      '社区浏览',
      '个人作品集',
    ],
    featuresEn: [
      '10 AI generations per day',
      'Basic style templates',
      'Community browsing',
      'Personal portfolio',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: '专业版',
    nameEn: 'Pro',
    price: 9.9,
    period: '/月',
    periodEn: '/month',
    features: [
      '无限 AI 生成',
      '全部风格模板',
      '高清导出',
      '优先客服支持',
      '商业使用授权',
    ],
    featuresEn: [
      'Unlimited AI generations',
      'All style templates',
      'HD export',
      'Priority support',
      'Commercial license',
    ],
    highlighted: true,
  },
  {
    id: 'studio',
    name: '工作室版',
    nameEn: 'Studio',
    price: 29.9,
    period: '/月',
    periodEn: '/month',
    features: [
      '包含专业版全部功能',
      '多用户账号 (5人)',
      'API 接口访问',
      '自定义品牌',
      '专属客户经理',
    ],
    featuresEn: [
      'All Pro features included',
      'Multi-user accounts (5)',
      'API access',
      'Custom branding',
      'Dedicated account manager',
    ],
    highlighted: false,
  },
];

export default function Pricing({ user }: PricingProps) {
  const { language } = useLanguage();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(false);
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

    // 其他方案跳转到支付
    alert(isZh ? '支付功能即将上线' : 'Payment coming soon');
  };

  return (
    <div className="min-h-screen bg-white py-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-6xl font-semibold text-black mb-6">
            {isZh ? '选择适合你的方案' : 'Choose Your Plan'}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {isZh 
              ? '从免费版开始，随时升级以解锁更多功能' 
              : 'Start with Free, upgrade anytime to unlock more features'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative p-10 border transition-all ${
                  plan.highlighted
                    ? 'border-black shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Highlighted Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black text-white text-sm font-medium">
                    {isZh ? '推荐' : 'Recommended'}
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-black mb-2">
                    {isZh ? plan.name : plan.nameEn}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {isZh ? plan.period : plan.periodEn}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-10">
                  <span className="text-5xl font-semibold text-black">
                    {plan.price === 0 ? (isZh ? '免费' : 'Free') : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">
                      {isZh ? plan.period : plan.periodEn}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-4 font-medium mb-10 transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-black text-white hover:shadow-[0_0_0_2px_#D4AF37]'
                      : 'border border-black text-black hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
                >
                  {isCurrentPlan
                    ? (isZh ? '当前方案' : 'Current Plan')
                    : loading
                    ? (isZh ? '加载中...' : 'Loading...')
                    : plan.price === 0
                    ? (isZh ? '免费开始' : 'Start Free')
                    : (isZh ? '立即升级' : 'Upgrade Now')}
                </button>

                {/* Features */}
                <ul className="space-y-4">
                  {(isZh ? plan.features : plan.featuresEn).map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-black text-center mb-16">
            {isZh ? '常见问题' : 'Frequently Asked Questions'}
          </h2>
          
          <div className="space-y-8">
            {[
              {
                q: isZh ? '可以随时取消订阅吗？' : 'Can I cancel anytime?',
                a: isZh 
                  ? '是的，您可以随时在账户设置中取消订阅。取消后，您仍可使用已付费期间的全部功能。'
                  : 'Yes, you can cancel anytime in your account settings. You will continue to have access until the end of your billing period.',
              },
              {
                q: isZh ? '免费版有什么限制？' : 'What are the limits of the Free plan?',
                a: isZh
                  ? '免费版每天可使用 10 次 AI 生成，适合体验和个人使用。如需更多功能，可升级到专业版。'
                  : 'Free plan includes 10 AI generations per day, perfect for trying out and personal use. Upgrade to Pro for unlimited access.',
              },
              {
                q: isZh ? '支持哪些支付方式？' : 'What payment methods are supported?',
                a: isZh
                  ? '我们支持信用卡、借记卡和 PayPal 支付。所有支付均通过安全加密通道处理。'
                  : 'We accept credit cards, debit cards, and PayPal. All payments are processed through secure encrypted channels.',
              },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="text-lg font-medium text-black mb-2">{faq.q}</h3>
                <p className="text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-gray-600">
              {isZh 
                ? '还有疑问？联系我们的客服团队' 
                : 'Still have questions? Contact our support team'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
