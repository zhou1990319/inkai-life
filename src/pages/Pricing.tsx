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
    name: 'Inker',
    icon: Star,
    color: 'from-gray-600 to-gray-700',
    price: 0,
    period: 'Free Forever',
    description: 'Get started with AI tattoo designs',
    features: [
      { text: '10 AI generations per day', included: true },
      { text: '1024px standard HD download', included: true },
      { text: '20 basic Chinese-style templates', included: true },
      { text: 'Light watermark', included: true, note: "Perfect for artist reference" },
      { text: 'Limited display ads', included: true },
      { text: 'Cloud storage for 30 designs', included: true },
      { text: 'Dragon Phoenix ink style', included: false },
      { text: 'No watermark downloads', included: false },
      { text: 'Commercial license', included: false },
      { text: 'Unlimited generations', included: false },
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Koi Monthly',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    price: 7.99,
    period: '/month',
    description: 'For serious tattoo enthusiasts',
    features: [
      { text: '100 AI generations per month', included: true },
      { text: '2048px ultra HD download', included: true },
      { text: '50 exclusive Chinese-style templates', included: true },
      { text: 'Fully watermark-free', included: true },
      { text: 'Basic ink style unlock', included: true },
      { text: 'Cloud storage for 200 designs', included: true },
      { text: 'Priority generation queue', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Commercial license', included: false },
      { text: 'Unlimited generations', included: false },
    ],
    cta: 'Upgrade Now',
    popular: true,
    badge: 'Most Popular',
  },
  {
    id: 'yearly',
    name: 'Dragon King',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    price: 29.9,
    period: '/year',
    description: 'Best value for tattoo lovers',
    yearlyPrice: '$29.9/year',
    monthlyEquivalent: '≈ $2.49/month',
    features: [
      { text: 'Unlimited AI generations', included: true },
      { text: '4096px + PNG transparent background', included: true },
      { text: 'All 120 Chinese-style templates', included: true },
      { text: 'Dragon Phoenix / Unicorn / Vermilion / Azure styles', included: true },
      { text: 'Fully watermark-free', included: true },
      { text: 'Personal commercial license', included: true },
      { text: 'Lightning fast generation', included: true },
      { text: 'Unlimited cloud storage', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Priority customer support', included: true },
    ],
    cta: 'Early Bird Price',
    popular: false,
    badge: 'Best Value',
    earlyBird: {
      price: 19.9,
      originalPrice: 29.9,
      label: 'Early Bird Deal',
      remaining: 1000,
    },
  },
  {
    id: 'lifetime',
    name: 'Legend VIP',
    icon: Crown,
    color: 'from-yellow-400 to-amber-500',
    price: 99,
    period: 'Lifetime',
    description: 'For hardcore tattoo collectors',
    features: [
      { text: 'Lifetime unlimited AI generations', included: true },
      { text: '4096px + RAW source files', included: true },
      { text: 'All templates + future additions FREE', included: true },
      { text: 'Custom exclusive style', included: true },
      { text: 'Full commercial license', included: true },
      { text: 'Tattoo studio commercial license', included: true },
      { text: 'VIP fastest generation speed', included: true },
      { text: 'Unlimited storage + portfolio showcase', included: true },
      { text: 'VIP exclusive badge', included: true },
      { text: 'Gift 1-year subscription to a friend', included: true },
    ],
    cta: 'Lock Lifetime Price',
    popular: false,
    badge: 'Lifetime Best',
    earlyBird: {
      price: 59.9,
      originalPrice: 99,
      label: 'Early Bird Limited',
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
      alert(isEarlyBird ? 'Early bird purchase successful!' : 'Subscription successful!');
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Subscription failed, please try again');
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
            InkAI Premium Membership
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Chinese-style AI tattoo generator. Choose your perfect plan
        </p>

        {/* Comparison Note */}
        <div className="mt-6 inline-flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2">
          <span className="text-amber-400 text-sm font-medium">vs Competitors</span>
          <span className="text-gray-400 text-sm">|</span>
          <span className="text-green-400 text-sm">Monthly 20% cheaper | Yearly 50% cheaper</span>
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
                      {plan.earlyBird.remaining} spots left
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
                        Save ${originalPrice - showPrice}
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
                  {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : plan.cta}
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
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Can I get a refund?',
              a: 'Full refund within 7 days for first-time purchases. Contact support to process.',
            },
            {
              q: 'How do I cancel auto-renewal?',
              a: 'Cancel anytime in account settings. Your benefits continue until the end of your billing period.',
            },
            {
              q: 'What if early bird spots run out?',
              a: 'Prices return to regular rates once spots are filled. Grab yours now!',
            },
            {
              q: 'Can I use designs commercially?',
              a: 'Yearly+ plans include personal commercial license. Lifetime VIP includes full commercial rights (including tattoo studio use).',
            },
            {
              q: 'Are there limits for free users?',
              a: 'Free users get 10 generations per day - perfect for trying out Chinese-style tattoo designs.',
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
        <p>All prices in USD. PayPal / Credit Card / Apple Pay / Google Pay accepted</p>
        <p className="mt-2">Questions? Read our <a href="#/privacy" className="text-amber-400 hover:underline">Privacy Policy</a></p>
      </div>
    </div>
  );
}
