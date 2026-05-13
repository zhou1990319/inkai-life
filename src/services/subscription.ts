/**
 * 会员订阅服务 - Subscription Service
 * 处理会员计划、订阅、生成次数限制等
 * 
 * 定价参考竞品：
 * - tattooai.net: Explorer $5(30次), Hobbyist $9/月(150次), Starter $29/月(500次), Pro $49/月(1000次), Unlimited $99/月
 * - tattoosai.com: 免费试用, 付费订阅
 * - BlackInk AI: 免费生成 + 付费解锁
 * - Midjourney: $10/月(200次), $30/月(15h快速), $60/月(30h快速)
 * - DALL-E: $20/月(ChatGPT Plus)
 * 
 * InkAI 定价策略：
 * - 以 USD 计价，面向海外市场
 * - 低价入门（一次性 $4.99）降低决策门槛
 * - 月订阅 $9.99 对标 tattooai.net Hobbyist
 * - 年订阅 $59/年 对标 tattooai.net Annual Basic（省 50%）
 * - Pro $29/月 对标 tattooai.net Starter（面向纹身师）
 * - 无限 $79/月 对标 tattooai.net Unlimited $99（更有竞争力）
 */
import { supabase } from '../supabase/client';

export type PlanType = 'free' | 'starter' | 'basic_monthly' | 'basic_yearly' | 'pro_monthly' | 'pro_yearly' | 'unlimited';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  is_early_bird: boolean;
  trial_ends_at: string | null;
  auto_renew: boolean;
}

export interface PlanDetails {
  name: string;
  nameEn: string;
  price: number;
  currency: string;
  billing: 'free' | 'one_time' | 'monthly' | 'yearly';
  credits: number; // -1 = 无限
  creditsLabel: string;
  features: string[];
  featuresZh: string[];
  highlight?: boolean; // 推荐标记
  badge?: string; // 角标
  watermark: boolean;
  resolution: string;
  priorityQueue: boolean;
  referenceImage: boolean;
  commercialUse: boolean;
}

// ========== 会员计划详情（USD 计价，面向海外市场）==========
export const PLANS: Record<PlanType, PlanDetails> = {
  // ---- 免费体验 ----
  free: {
    name: '免费体验',
    nameEn: 'Free',
    price: 0,
    currency: 'USD',
    billing: 'free',
    credits: 10,
    creditsLabel: '10 designs',
    features: [
      '10 free designs',
      '8 tattoo styles',
      'Standard resolution',
      'With watermark',
    ],
    featuresZh: [
      '10次免费设计',
      '8种纹身风格',
      '标准分辨率',
      '带水印',
    ],
    watermark: true,
    resolution: '512x512',
    priorityQueue: false,
    referenceImage: false,
    commercialUse: false,
  },

  // ---- 入门一次性（降低决策门槛，对标 tattooai.net Explorer $5）----
  starter: {
    name: '体验包',
    nameEn: 'Starter Pack',
    price: 4.99,
    currency: 'USD',
    billing: 'one_time',
    credits: 30,
    creditsLabel: '30 designs',
    features: [
      '30 designs (one-time)',
      'All tattoo styles',
      'HD resolution',
      'No watermark',
      'Reference image upload',
    ],
    featuresZh: [
      '30次设计（一次性）',
      '全部纹身风格',
      '高清分辨率',
      '无水印',
      '参考图上传',
    ],
    badge: 'Best for trying out',
    watermark: false,
    resolution: '1024x1024',
    priorityQueue: false,
    referenceImage: true,
    commercialUse: false,
  },

  // ---- 基础月付（对标 tattooai.net Hobbyist $9/月）----
  basic_monthly: {
    name: '基础会员',
    nameEn: 'Basic',
    price: 9.99,
    currency: 'USD',
    billing: 'monthly',
    credits: 150,
    creditsLabel: '150 designs/month',
    features: [
      '150 designs per month',
      'All tattoo styles',
      'HD resolution',
      'No watermark',
      'Reference image upload',
      'Priority queue',
      'Email support',
    ],
    featuresZh: [
      '每月150次设计',
      '全部纹身风格',
      '高清分辨率',
      '无水印',
      '参考图上传',
      '优先队列',
      '邮件支持',
    ],
    watermark: false,
    resolution: '1024x1024',
    priorityQueue: true,
    referenceImage: true,
    commercialUse: false,
  },

  // ---- 基础年付（对标 tattooai.net Annual $59/年，省 50%）----
  basic_yearly: {
    name: '基础年付',
    nameEn: 'Basic Annual',
    price: 59,
    currency: 'USD',
    billing: 'yearly',
    credits: 1800,
    creditsLabel: '1,800 designs/year',
    features: [
      '1,800 designs per year (150/mo)',
      'All tattoo styles',
      'HD resolution',
      'No watermark',
      'Reference image upload',
      'Priority queue',
      'Priority email support',
      'Best price guarantee',
    ],
    featuresZh: [
      '每年1800次设计（150/月）',
      '全部纹身风格',
      '高清分辨率',
      '无水印',
      '参考图上传',
      '优先队列',
      '优先邮件支持',
      '最优价格保证',
    ],
    highlight: true,
    badge: 'SAVE 50%',
    watermark: false,
    resolution: '1024x1024',
    priorityQueue: true,
    referenceImage: true,
    commercialUse: false,
  },

  // ---- Pro 月付（对标 tattooai.net Starter $29/月，面向纹身师）----
  pro_monthly: {
    name: '专业版',
    nameEn: 'Pro',
    price: 29,
    currency: 'USD',
    billing: 'monthly',
    credits: 500,
    creditsLabel: '500 designs/month',
    features: [
      '500 designs per month',
      'All tattoo styles',
      'Ultra HD resolution',
      'No watermark',
      'Reference image upload',
      'Fastest priority queue',
      'Studio profile',
      'Commercial use license',
      'Priority support',
    ],
    featuresZh: [
      '每月500次设计',
      '全部纹身风格',
      '超高清分辨率',
      '无水印',
      '参考图上传',
      '最快优先队列',
      '工作室资料',
      '商业使用授权',
      '优先支持',
    ],
    badge: 'For Artists',
    watermark: false,
    resolution: '2048x2048',
    priorityQueue: true,
    referenceImage: true,
    commercialUse: true,
  },

  // ---- Pro 年付（省 34%）----
  pro_yearly: {
    name: '专业版年付',
    nameEn: 'Pro Annual',
    price: 229,
    currency: 'USD',
    billing: 'yearly',
    credits: 6000,
    creditsLabel: '6,000 designs/year',
    features: [
      '6,000 designs per year (500/mo)',
      'All tattoo styles',
      'Ultra HD resolution',
      'No watermark',
      'Reference image upload',
      'Fastest priority queue',
      'Studio profile',
      'Commercial use license',
      'VIP support',
      'API access',
    ],
    featuresZh: [
      '每年6000次设计（500/月）',
      '全部纹身风格',
      '超高清分辨率',
      '无水印',
      '参考图上传',
      '最快优先队列',
      '工作室资料',
      '商业使用授权',
      'VIP支持',
      'API访问',
    ],
    badge: 'SAVE 34%',
    watermark: false,
    resolution: '2048x2048',
    priorityQueue: true,
    referenceImage: true,
    commercialUse: true,
  },

  // ---- 无限版（对标 tattooai.net Unlimited $99，更有竞争力）----
  unlimited: {
    name: '无限版',
    nameEn: 'Unlimited',
    price: 79,
    currency: 'USD',
    billing: 'monthly',
    credits: -1,
    creditsLabel: 'Unlimited',
    features: [
      'Unlimited designs',
      'All tattoo styles',
      'Maximum resolution',
      'No watermark',
      'Reference image upload',
      'Highest priority',
      'Premium studio profile',
      'Commercial use license',
      'VIP support',
      'API access',
      'Custom integration support',
    ],
    featuresZh: [
      '无限次设计',
      '全部纹身风格',
      '最大分辨率',
      '无水印',
      '参考图上传',
      '最高优先级',
      '高级工作室资料',
      '商业使用授权',
      'VIP支持',
      'API访问',
      '自定义集成支持',
    ],
    badge: 'BEST VALUE',
    watermark: false,
    resolution: '2048x2048',
    priorityQueue: true,
    referenceImage: true,
    commercialUse: true,
  },
};

// ========== 按类别分组展示 ==========
export const PLAN_CATEGORIES = {
  individual: {
    title: 'Individual',
    titleZh: '个人用户',
    plans: ['free', 'starter', 'basic_monthly', 'basic_yearly'] as PlanType[],
  },
  studio: {
    title: 'Studio',
    titleZh: '工作室/纹身师',
    plans: ['pro_monthly', 'pro_yearly', 'unlimited'] as PlanType[],
  },
};

/**
 * 获取用户当前订阅
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('[Subscription] Get error:', error);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * 检查用户是否可以生成图片
 */
export async function canGenerateImage(userId: string): Promise<{
  canGenerate: boolean;
  remaining: number;
  plan: PlanType;
  reason?: string;
}> {
  try {
    const subscription = await getUserSubscription(userId);
    const planType = subscription?.plan_type || 'free';
    const plan = PLANS[planType];

    // 无限版
    if (plan.credits === -1) {
      return { canGenerate: true, remaining: -1, plan: planType };
    }

    // 一次性体验包：检查总使用量
    if (plan.billing === 'one_time') {
      const { count, error } = await supabase
        .from('generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        return { canGenerate: false, remaining: 0, plan: planType, reason: 'Failed to check usage' };
      }

      const used = count || 0;
      const remaining = Math.max(0, plan.credits - used);

      return {
        canGenerate: remaining > 0,
        remaining,
        plan: planType,
        reason: remaining === 0 ? 'Starter pack used up. Upgrade for more designs!' : undefined,
      };
    }

    // 订阅制：检查本月使用量
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('generation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      return { canGenerate: false, remaining: 0, plan: planType, reason: 'Failed to check usage' };
    }

    const used = count || 0;
    const remaining = Math.max(0, plan.credits - used);

    return {
      canGenerate: remaining > 0,
      remaining,
      plan: planType,
      reason: remaining === 0 ? 'Monthly limit reached. Upgrade your plan!' : undefined,
    };
  } catch (err) {
    return {
      canGenerate: false,
      remaining: 0,
      plan: 'free',
      reason: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * 记录图片生成
 */
export async function logGeneration(
  userId: string,
  prompt: string,
  style: string,
  imageUrl: string,
  options: {
    resolution?: string;
    hasWatermark?: boolean;
    creditsUsed?: number;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('generation_logs').insert({
      user_id: userId,
      prompt,
      style,
      image_url: imageUrl,
      resolution: options.resolution || '1024x1024',
      has_watermark: options.hasWatermark ?? true,
      credits_used: options.creditsUsed ?? 1,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to log' };
  }
}

/**
 * 创建订阅（支付成功后调用）
 */
export async function createSubscription(
  userId: string,
  planType: PlanType,
  paymentId: string,
  paymentProvider: string,
  isEarlyBird: boolean = false
): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
  try {
    const now = new Date();
    let expiresAt: Date | null = null;
    const plan = PLANS[planType];

    // 计算过期时间
    if (plan.billing === 'monthly') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (plan.billing === 'yearly') {
      expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    // one_time 和 free 不设过期时间

    // 取消旧订阅
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // 创建新订阅
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt?.toISOString(),
        is_early_bird: isEarlyBird,
        payment_id: paymentId,
        payment_provider: paymentProvider,
        auto_renew: plan.billing === 'monthly' || plan.billing === 'yearly',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 更新用户 profile
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        current_plan: planType,
      })
      .eq('id', userId);

    return { success: true, subscription: data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create subscription' };
  }
}

/**
 * 检查并应用促销码
 */
export async function applyPromoCode(
  code: string
): Promise<{ valid: boolean; promotion?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid or expired promo code' };
    }

    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return { valid: false, error: 'Promo code has expired' };
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      return { valid: false, error: 'Promo code has reached maximum uses' };
    }

    return { valid: true, promotion: data };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Failed to validate' };
  }
}

/**
 * 获取用户生成历史
 */
export async function getGenerationHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: any[]; total: number }> {
  try {
    const { data, error, count } = await supabase
      .from('generation_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return { data: [], total: 0 };
    }

    return { data: data || [], total: count || 0 };
  } catch {
    return { data: [], total: 0 };
  }
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

/**
 * 获取月均价格（用于年付方案展示）
 */
export function getMonthlyEquivalent(yearlyPrice: number): string {
  const monthly = yearlyPrice / 12;
  return formatPrice(Math.round(monthly * 100) / 100);
}
