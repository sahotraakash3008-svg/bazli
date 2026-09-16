import { Order } from '../types';

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function checkRazorpayConfig(): Promise<{ isConfigured: boolean; keyId: string | null }> {
  try {
    const res = await fetch('/api/payments/razorpay/config');
    if (!res.ok) return { isConfigured: false, keyId: null };
    return await res.json();
  } catch (err) {
    console.warn('Failed to check Razorpay config:', err);
    return { isConfigured: false, keyId: null };
  }
}

export interface CreateOrderPayload {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: Array<{
    productId: string;
    quantity: number;
    bargainedPrice?: number;
    bargainSessionId?: string;
  }>;
  couponCode?: string;
  deliveryZoneId?: string;
  deliveryAddress: any;
  deliveryTip?: number;
  deliveryInstructions?: string[];
  cookingInstructions?: string;
  specialInstructions?: string;
}

export async function createRazorpayOrderOnServer(payload: CreateOrderPayload) {
  const res = await fetch('/api/payments/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function verifyRazorpayPaymentOnServer(verificationPayload: {
  bazliOrderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await fetch('/api/payments/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verificationPayload)
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
