/**
 * Stripe 支付服务 - Payment Service
 * 处理支付、订阅管理、Webhook 等
 */
import { PlanType, PLANS } from './subscription';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

// Stripe 价格 ID（需要在 Stripe Dashboard 创建）
const STRIPE_PRICES: Record<PlanType, string> = {
  free: '', // 免费版无需支付
  monthly: 'price_monthly_29', // 替换为实际的 Stripe Price ID
  yearly: 'price_yearly_199',
  lifetime: 'price_lifetime_599',
};

/**
 * 创建 Stripe Checkout Session
 * 前端调用此函数，后端代理到 Stripe API
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  planType: PlanType,
  promoCode?: string
): Promise<CheckoutSession | null> {
  try {
    const plan = PLANS[planType];
    
    if (planType === 'free') {
      throw new Error('Free plan does not require payment');
    }

    // 调用后端 API 创建 Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        planType,
        priceId: STRIPE_PRICES[planType],
        promoCode,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return {
      id: data.sessionId,
      url: data.url,
    };
  } catch (err) {
    console.error('[Payment] Create checkout error:', err);
    return null;
  }
}

/**
 * 创建 Stripe Customer Portal Session
 * 用于用户管理订阅（取消、更新支付方式等）
 */
export async function createPortalSession(userId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        returnUrl: `${window.location.origin}/profile`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const data = await response.json();
    return data.url;
  } catch (err) {
    console.error('[Payment] Create portal error:', err);
    return null;
  }
}

/**
 * 验证支付状态
 */
export async function verifyPayment(sessionId: string): Promise<PaymentResult> {
  try {
    const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return {
      success: data.success,
      sessionId: data.sessionId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Payment verification failed',
    };
  }
}

/**
 * 取消订阅
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Cancellation failed',
    };
  }
}

/**
 * 计算折扣价格
 */
export function calculateDiscount(
  originalPrice: number,
  promotion: { discount_type: string; discount_value: number }
): number {
  if (promotion.discount_type === 'percentage') {
    return originalPrice * (1 - promotion.discount_value / 100);
  } else if (promotion.discount_type === 'fixed') {
    return Math.max(0, originalPrice - promotion.discount_value);
  }
  return originalPrice;
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number, currency: string = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}
