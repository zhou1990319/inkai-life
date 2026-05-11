import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Crown, Zap, Star } from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PricingProps {
  user: Profile | null;
}

const plans = [
  {
    id: 'free',
    name: '墨客',
    icon: Star,
    color: 'from-gray-600 to-gray-700',
    price: 0,
    period: '永久免费',
    description: '初次体验国风纹身',
    features: [
      { text: '每日 10 次 AI 生成', included: true },
      { text: '1024px 标准高清下载', included: true },
      { text: '20 款基础国风模板', included: true },
      { text: '轻度水印', included: true, note: '不影响纹身师参考' },
      { text: '少量展示广告', included: true },
      { text: '云端存储 30 幅作品', included: true },
      { text: '龙凤水墨风格', included: false },
      { text: '无水印高清下载', included: false },
      { text: '商用授权', included: false },
      { text: '无限生成', included: false },
    ],
    cta: '免费开始',
    popular: false,
  },
  {
    id: 'monthly',
    name: '锦鲤月卡',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    price: 7.99,
    period: '/月',
    description: '认真考虑纹身设计',
    features: [
      { text: '每月 100 次 AI 生成', included: true },
      { text: '2048px 超高清下载', included: true },
      { text: '50 款国风专属模板', included: true },
      { text: '完全无水印', included: true },
      { text: '基础水墨风格解锁', included: true },
      { text: '云端存储 200 幅作品', included: true },
      { text: '优先出图队列', included: true },
      { text: '无广告干扰', included: true },
      { text: '商用授权', included: false },
      { text: '无限生成', included: false },
    ],
    cta: '立即升级',
    popular: true,
    badge: '人气之选',
  },
  {
    id: 'yearly',
    name: '王者年卡',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    price: 29.9,
    period: '/年',
    description: '纹身爱好者首选',
    yearlyPrice: '$29.9/年',
    monthlyEquivalent: '≈ $2.49/月',
    features: [
      { text: '无限次 AI 生成', included: true },
      { text: '4096px + PNG透明背景', included: true },
      { text: '全库 120 款国风模板', included: true },
      { text: '龙凤/麒麟/朱雀/青龙风格', included: true },
      { text: '完全无水印', included: true },
      { text: '个人商用授权', included: true },
      { text: '极速出图队列', included: true },
      { text: '无限云存储', included: true },
      { text: '无广告干扰', included: true },
      { text: '专属客服支持', included: true },
    ],
    cta: '限时早鸟价',
    popular: false,
    badge: '最划算',
    earlyBird: {
      price: 19.9,
      originalPrice: 29.9,
      label: '早鸟特惠价',
      remaining: 1000,
    },
  },
  {
    id: 'lifetime',
    name: '传奇VIP',
    icon: Crown,
    color: 'from-yellow-400 to-amber-500',
    price: 99,
    period: '一次性',
    description: '深度纹身爱好者',
    features: [
      { text: '终身无限次 AI 生成', included: true },
      { text: '4096px + RAW 原图文件', included: true },
      { text: '全库模板 + 未来新增免费', included: true },
      { text: '定制专属风格', included: true },
      { text: '完整商用授权', included: true },
      { text: '纹身店商用授权', included: true },
      { text: 'VIP 顶级出图速度', included: true },
      { text: '无限云存储 + 作品集展示', included: true },
      { text: 'VIP 专属标识', included: true },
      { text: '可转赠 1 年年卡给好友', included: true },
    ],
    cta: '锁定终身价',
    popular: false,
    badge: '终身最佳',
    earlyBird: {
      price: 59.9,
      originalPrice: 99,
      label: '早鸟限量价',
      remaining: 200,
    },
  },
];

export default function Pricing({ user }: PricingProps) {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [showEarlyBird, setShowEarlyBird] = useState(true);

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

    // TODO: 接入 PayPal/Stripe 支付
    // 目前演示：直接更新用户订阅状态
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

      // 如果是付费订阅，创建订阅记录
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
      alert(isEarlyBird ? '早鸟价购买成功！' : '订阅成功！');
    } catch (error) {
      console.error('订阅失败:', error);
      alert('订阅失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            墨纹AI会员体系
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          国风纹身，一触即生。选择最适合你的创作方案
        </p>

        {/* Comparison Note */}
        <div className="mt-6 inline-flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2">
          <span className="text-amber-400 text-sm font-medium">对比海外竞品</span>
          <span className="text-gray-400 text-sm">|</span>
          <span className="text-green-400 text-sm">月卡便宜 20% | 年卡便宜 50%</span>
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
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-amber-500/50'
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                  plan.id === 'monthly'
                    ? 'bg-amber-500 text-black'
                    : plan.id === 'yearly'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Early Bird Banner */}
              {plan.earlyBird && showEarlyBird && (
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 px-4 py-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-400 font-medium">
                      🎉 {plan.earlyBird.label}
                    </span>
                    <span className="text-gray-400">
                      剩余 {plan.earlyBird.remaining} 名
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
                    <p className="text-gray-500 text-sm">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-500">$</span>
                    <span className={`text-4xl font-bold ${plan.price === 0 ? 'text-gray-400' : 'text-white'}`}>
                      {showPrice}
                    </span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 line-through text-sm">${originalPrice}</span>
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded">
                        省 ${originalPrice - showPrice}
                      </span>
                    </div>
                  )}
                  {plan.monthlyEquivalent && (
                    <p className="text-gray-500 text-sm mt-1">{plan.monthlyEquivalent}</p>
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
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/25'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-gray-600'
                  }`}
                >
                  {isCurrentPlan ? '当前方案' : loading ? '处理中...' : plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                          {feature.text}
                        </span>
                        {feature.note && (
                          <p className="text-gray-600 text-xs mt-0.5">{feature.note}</p>
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
        <h2 className="text-2xl font-bold text-white text-center mb-8">常见问题</h2>
        <div className="space-y-4">
          {[
            {
              q: '付费会员可以退款吗？',
              a: '购买后7天内可申请全额退款（限首次购买），请联系客服处理。',
            },
            {
              q: '如何取消自动续费？',
              a: '可以在账户设置中随时取消，取消后当前会员期权益保留至到期。',
            },
            {
              q: '年卡早鸟价名额用完了怎么办？',
              a: '早鸟名额用完后将恢复原价，建议尽快购买锁定优惠。',
            },
            {
              q: '生成的纹身图案可以商用吗？',
              a: '年卡及以上会员包含个人商用授权，终身VIP包含完整商用授权（含纹身店商用）。',
            },
            {
              q: '免费用户有体验限制吗？',
              a: '免费用户每日可生成10次，足以体验国风纹身创作的乐趣。',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-white font-medium mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer Note */}
      <div className="text-center mt-12 text-gray-500 text-sm">
        <p>所有价格均为美元，支持 PayPal / 信用卡 / 支付宝 / 微信支付</p>
        <p className="mt-2">安全问题？查看我们的 <a href="#/privacy" className="text-amber-400 hover:underline">隐私政策</a></p>
      </div>
    </div>
  );
}
