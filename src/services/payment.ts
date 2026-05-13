/**
 * PayPal Payment Service
 * Handles PayPal payment creation, capture, verification, and subscription management
 *
 * Backend API endpoints:
 * - GET  /api/paypal/config
 * - POST /api/paypal/create-order
 * - POST /api/paypal/capture-order
 * - GET  /api/paypal/verify
 * - POST /api/paypal/cancel-subscription
 * - POST /api/paypal/webhook
 */
import { PlanType, PLANS, formatPrice } from './subscription';

// ========== PayPal Configuration ==========

export interface PayPalConfig {
  clientId: string;
  mode: string;
  currency: string;
}

let cachedConfig: PayPalConfig | null = null;

/**
 * 获取 PayPal 配置（从后端 API）
 */
export async function getPayPalConfig(): Promise<PayPalConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const response = await fetch('/api/paypal/config');
    if (!response.ok) {
      throw new Error('Failed to get PayPal config');
    }
    cachedConfig = await response.json();
    return cachedConfig!;
  } catch (err) {
    console.error('[PayPal] Failed to get config:', err);
    return { clientId: '', mode: 'sandbox', currency: 'USD' };
  }
}

/**
 * 动态加载 PayPal JS SDK
 */
export async function loadPayPalSDK(config: PayPalConfig): Promise<void> {
  if (!config.clientId) {
    throw new Error('PayPal Client ID is not configured');
  }

  // 检查是否已加载
  if ((window as any).paypal) {
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${config.clientId}&currency=${config.currency}&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(script);
  });
}

// ========== PayPal Payment Functions ==========

/**
 * 创建 PayPal 订单
 */
export async function createPayPalOrder(
  userId: string,
  email: string,
  planType: PlanType,
  amount: number,
  currency: string = 'USD'
): Promise<{ orderId: string } | null> {
  try {
    const plan = PLANS[planType];

    if (planType === 'free') {
      throw new Error('Free plan does not require payment');
    }

    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        planType,
        planName: plan.nameEn,
        amount,
        currency,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create PayPal order');
    }

    const data = await response.json();
    return { orderId: data.orderId };
  } catch (err) {
    console.error('[PayPal] Create order error:', err);
    return null;
  }
}

/**
 * 捕获 PayPal 支付
 */
export async function capturePayPalOrder(
  orderId: string,
  userId: string,
  planType: PlanType
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        userId,
        planType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to capture PayPal payment');
    }

    const data = await response.json();
    return { success: data.success };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Payment capture failed',
    };
  }
}

/**
 * 验证 PayPal 支付状态
 */
export async function verifyPayPalPayment(
  orderId: string
): Promise<{ success: boolean; status?: string }> {
  try {
    const response = await fetch(`/api/paypal/verify?orderId=${orderId}`);

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return {
      success: data.success,
      status: data.status,
    };
  } catch (err) {
    return {
      success: false,
      status: undefined,
    };
  }
}

/**
 * 取消 PayPal 订阅
 */
export async function cancelPayPalSubscription(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/paypal/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
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

// Re-export formatPrice from subscription.ts for convenience
export { formatPrice };