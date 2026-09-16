/**
 * Mobile Haptics Utility using the Vibration API
 * Provides tactile feedback for key mobile interactions:
 * - Adding to cart
 * - Bargaining offer submission & deal acceptance
 * - Order placement success
 * - Selection, errors, and coupon activations
 */

export type HapticPatternType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'addToCart'
  | 'bargainSubmit'
  | 'bargainSuccess'
  | 'orderSuccess'
  | 'couponApplied'
  | 'success'
  | 'error'
  | 'warning';

const PATTERNS: Record<HapticPatternType, number | number[]> = {
  // Subtle click for taps & selectors
  selection: 10,
  // Crisp short pulse when adding items to cart
  light: 15,
  addToCart: 22,
  // Medium feedback for button presses
  medium: 35,
  bargainSubmit: 40,
  // Heavy pulse for impactful actions
  heavy: 60,
  // Rewarding rhythmic vibration for successful bargaining accept
  bargainSuccess: [35, 45, 65, 45, 90],
  // Celebratory crescendo vibration for completed checkout & order placement
  orderSuccess: [50, 40, 80, 40, 140, 50, 200],
  // Success ping for coupons, wishlist, or pass activation
  couponApplied: [30, 40, 60],
  success: [25, 40, 50],
  // Sharp double buzz for validation errors
  error: [50, 75, 50, 75],
  warning: [40, 60, 40]
};

export const triggerHaptic = (type: HapticPatternType = 'light'): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check if browser / device supports the Vibration API
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
    return false;
  }

  try {
    const pattern = PATTERNS[type] || 20;
    return navigator.vibrate(pattern);
  } catch (err) {
    // Fail silently in restricted iframe or permission-denied environments
    return false;
  }
};

export const hapticAddToCart = () => triggerHaptic('addToCart');
export const hapticBargainSubmit = () => triggerHaptic('bargainSubmit');
export const hapticBargainSuccess = () => triggerHaptic('bargainSuccess');
export const hapticOrderSuccess = () => triggerHaptic('orderSuccess');
export const hapticCouponApplied = () => triggerHaptic('couponApplied');
export const hapticSelection = () => triggerHaptic('selection');
export const hapticError = () => triggerHaptic('error');
