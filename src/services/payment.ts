/**
 * Stripe Payment Service
 * Handles payment, subscription management, webhooks
 * 
 * NOTE: Stripe Price IDs are placeholders.
 * Replace with actual IDs from Stripe Dashboard after creating products.
 * 
 * Backend API endpoints needed:
 * - POST /api/create-checkout-session
 * - POST /api/create-portal-session
 * - GET  /api/verify-payment
 * - POST /api/cancel-subscription
 * - POST /api/webhook (Stripe webhook handler)
 */
import { PlanType, PLANS, formatPrice } from './subscription';

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

// Stripe Price IDs - PLACEHOLDERS, replace with actual IDs from Stripe Dashboard
const STRIPE_PRICES: Partial<Record<PlanType, string>> = {
  // free: '', // Free plan - no payment needed
  starter: 'price_starter_499',           // TODO: Replace
  basic_monthly: 'price_basic_monthly_999', // TODO: Replace
  basic_yearly: 'price_basic_yearly_59',    // TODO: Replace
  pro_monthly: 'price_pro_monthly_29',      // TODO: Replace
  pro_yearly: 'price_pro_yearly_229',       // TODO: Replace
  unlimited: 'price_unlimited_79',          // TODO: Replace
};

/**
 * Create Stripe Checkout Session
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

    const priceId = STRIPE_PRICES[planType];
    if (!priceId) {
      console.warn(`[Payment] No Stripe Price ID configured for plan: ${planType}`);
      return null;
    }

    // Use hash-compatible URLs for HashRouter
    const successUrl = `${window.location.origin}/#/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/#/payment/cancel`;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        planType,
        priceId,
        promoCode,
        successUrl,
        cancelUrl,
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
 * Create Stripe Customer Portal Session
 */
export async function createPortalSession(userId: string): Promise<string | null> {
  try {
    const returnUrl = `${window.location.origin}/#/settings`;

    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, returnUrl }),
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
 * Verify payment status
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
 * Cancel subscription
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
 * Calculate discount price
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