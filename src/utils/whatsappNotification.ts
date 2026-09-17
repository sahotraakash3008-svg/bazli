import { Order } from '../types';

export interface WhatsAppNotificationConfig {
  apiKey?: string;
  phoneNumberId?: string;
  templateName?: string;
  adminPhone?: string;
}

/**
 * Formats a comprehensive WhatsApp Bill / Order Invoice
 */
export function formatWhatsAppOrderInvoice(order: Order, liveTrackingUrl?: string): string {
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. *${item.productName}* (${item.quantity}x ${item.unitQuantity || '1 unit'}) - ₹${item.paidPrice * item.quantity}`)
    .join('\n');

  const savings = (order.bargainDiscount || 0) + (order.couponDiscount || 0);
  const savingsText = savings > 0 ? `\n🎉 *Total Savings:* ₹${savings}` : '';
  const trackingLink = liveTrackingUrl || `${window.location.origin}/#track=${order.id}`;

  return `🛍️ *BAZLI ORDER INVOICE & TRACKING*
━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* #${order.id}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
🏪 *Store/Restaurant:* ${order.sellerName}
━━━━━━━━━━━━━━━━━━━━
🛒 *ORDERED ITEMS:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━
💰 *Bill Summary:*
• Subtotal: ₹${order.subtotal}
• Delivery: ${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee}
• Platform Fee: ₹${order.platformFee ?? 9}${savingsText}
💳 *Total Amount:* *₹${order.finalAmount}* (${order.paymentMethod} - ${order.paymentStatus})

🔐 *Doorstep Delivery OTP:* *${order.deliveryOtp}*
*(Share this OTP with your delivery partner only at doorstep delivery)*

🛵 *Delivery Partner:* ${order.deliveryPartnerName || 'Assigned Express Rider'}
📍 *Delivery Address:* ${order.deliveryAddress.street}, ${order.deliveryAddress.city} (${order.deliveryAddress.pincode})

⚡ *Live GPS Tracking:*
${trackingLink}

Thank you for ordering with Bazli! 🚀
Need help? Reply directly to this WhatsApp number.`;
}

/**
 * Generates direct WhatsApp click-to-chat URL
 */
export function getWhatsAppShareUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
}

/**
 * Open WhatsApp with Order Bill
 */
export function openWhatsAppOrderInvoice(order: Order, customPhone?: string): void {
  const targetPhone = customPhone || order.customerPhone || '9871618126';
  const invoiceMessage = formatWhatsAppOrderInvoice(order);
  const url = getWhatsAppShareUrl(targetPhone, invoiceMessage);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Formats quick SMS notification text for OTP & Order dispatch
 */
export function formatOrderSmsText(order: Order): string {
  return `Bazli Order #${order.id} confirmed! Total: Rs.${order.finalAmount}. Your doorstep delivery OTP is ${order.deliveryOtp}. Rider: ${order.deliveryPartnerName || 'Bazli Rider'}. Track: ${window.location.origin}/#track=${order.id}`;
}
