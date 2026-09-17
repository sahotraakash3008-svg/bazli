import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  isConfigured: boolean;
}

/**
 * Safely retrieve Razorpay live credentials from server environment variables
 */
export function getRazorpayCredentials(): RazorpayCredentials {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_LIVE_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_LIVE_KEY_SECRET || '').trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

  const isConfigured = Boolean(keyId && keySecret);

  return {
    keyId,
    keySecret,
    webhookSecret,
    isConfigured
  };
}

/**
 * Lazy initialization of Razorpay SDK instance
 */
export function getRazorpayClient(): Razorpay {
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured) {
    throw new Error('RAZORPAY_NOT_CONFIGURED: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment variables.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

/**
 * Create a Razorpay Order on the Razorpay production API
 * @param amountInPaise Final order amount in Indian Paise (e.g. 15000 for ₹150)
 * @param receipt Unique internal Bazli order identifier
 * @param notes Contextual metadata passed to Razorpay
 */
export async function createRazorpayOrderOnServer(
  amountInPaise: number,
  receipt: string,
  notes: Record<string, string | number> = {}
) {
  const client = getRazorpayClient();

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt.slice(0, 40), // Razorpay receipt max 40 chars
    notes,
    payment_capture: 1 as const // Auto capture payment upon authentication
  };

  const razorpayOrder = await client.orders.create(options);
  return razorpayOrder;
}

/**
 * Securely verify the Razorpay Payment Signature after client checkout
 * Formula: HMAC-SHA256(`${razorpay_order_id}|${razorpay_payment_id}`, key_secret)
 */
export function verifyRazorpayPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const { keySecret, isConfigured } = getRazorpayCredentials();
  if (!isConfigured || !keySecret) {
    return false;
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  try {
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const receivedBuf = Buffer.from(razorpaySignature);

    if (expectedBuf.length !== receivedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch (err) {
    console.error('Payment signature verification error:', err);
    return false;
  }
}

/**
 * Securely verify incoming Razorpay Webhook signature against raw request body
 * Formula: HMAC-SHA256(raw_request_body, webhook_secret)
 */
export function verifyRazorpayWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string
): boolean {
  const { webhookSecret } = getRazorpayCredentials();

  if (!webhookSecret) {
    console.warn('Webhook signature check failed: RAZORPAY_WEBHOOK_SECRET is not configured in server environment.');
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const receivedBuf = Buffer.from(signatureHeader.trim());

    if (expectedBuf.length !== receivedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch (err) {
    console.error('Webhook signature verification error:', err);
    return false;
  }
}
