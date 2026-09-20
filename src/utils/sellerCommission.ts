import { Seller } from '../types';

/**
 * Calculates dynamic commission for a seller:
 * - Admin Store: Always 0%
 * - First 2 Months (60 days from joinedDate / createdAt): 0% Promotional Commission (100% Payout to Seller)
 * - After 2 Months: Automatically transitions to 10% standard platform commission
 */

export interface SellerCommissionInfo {
  rate: number; // 0 or 10
  isPromotionalZeroCommission: boolean;
  daysRemainingInPromo: number;
  promoExpiryDate?: string;
  promoEndsAt?: Date;
  joinedAt: Date;
  statusText: string;
}

export function getEffectiveSellerCommission(seller?: Partial<Seller> | null): SellerCommissionInfo {
  const now = new Date();

  // Admin store is always 0% commission
  if (seller?.isAdminStore || seller?.id === 's-admin' || (seller?.businessName && seller.businessName.includes('Bazli'))) {
    return {
      rate: 0,
      isPromotionalZeroCommission: false,
      daysRemainingInPromo: 0,
      joinedAt: now,
      statusText: 'Admin Direct Store (0% Platform Fee)'
    };
  }

  // Determine joined date
  let joinedAt = new Date();
  if (seller?.joinedDate) {
    const d = new Date(seller.joinedDate);
    if (!isNaN(d.getTime())) joinedAt = d;
  } else if (seller?.createdAt) {
    const d = new Date(seller.createdAt);
    if (!isNaN(d.getTime())) joinedAt = d;
  } else {
    // If no date exists, consider joined now for new sellers
    joinedAt = new Date();
  }

  // 2 months = ~60 days promotional window
  const promoDurationMs = 60 * 24 * 60 * 60 * 1000;
  const promoEndsAt = new Date(joinedAt.getTime() + promoDurationMs);
  const diffMs = promoEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (diffMs > 0) {
    // Within the 2-month 0% commission offer
    return {
      rate: 0,
      isPromotionalZeroCommission: true,
      daysRemainingInPromo: daysRemaining,
      promoEndsAt,
      promoExpiryDate: promoEndsAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      joinedAt,
      statusText: `0% Welcome Offer (${daysRemaining} days left • 100% Payout)`
    };
  }

  // After 2 months: Automatically switch to 10% platform commission
  const configuredRate = typeof seller?.commissionRate === 'number' ? seller.commissionRate : 10;
  return {
    rate: configuredRate,
    isPromotionalZeroCommission: false,
    daysRemainingInPromo: 0,
    promoEndsAt,
    promoExpiryDate: promoEndsAt.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    joinedAt,
    statusText: `Standard Platform Fee (${configuredRate}%)`
  };
}
