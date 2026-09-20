import { Order } from '../types';

export interface RestaurantLoyaltyProgress {
  sellerId: string;
  restaurantName: string;
  qualifyingOrderCount: number; // Total count of orders >= ₹200 for this restaurant
  currentCycleStamps: number; // 0 to 7
  cycleNumber: number; // Cycle count (1, 2, 3...)
  isRewardUnlocked: boolean; // True when exactly 7 stamps completed (8th order is FREE)
  freeFeastMaxAmount: number; // ₹499
  ordersNeeded: number; // Orders remaining until 7
  qualifyingOrders: Order[];
}

/**
 * Calculates restaurant-specific loyalty progress:
 * Rule: 7 orders of ₹200+ from the SAME restaurant -> 8th order gets ₹499 FREE.
 * As soon as cycle completes (8th order used / cycle renews), circle resets to 0/7.
 */
export function getRestaurantLoyaltyProgress(
  orders: Order[],
  sellerId: string,
  restaurantName?: string
): RestaurantLoyaltyProgress {
  const matchingOrders = orders.filter(o => {
    const isMatchingSeller =
      (sellerId && o.sellerId === sellerId) ||
      (restaurantName && o.sellerName?.toLowerCase() === restaurantName.toLowerCase());
    
    const isQualifyingAmount = (o.finalAmount >= 200 || o.subtotal >= 200);
    const isValidStatus = o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded';

    return isMatchingSeller && isQualifyingAmount && isValidStatus;
  });

  const totalCount = matchingOrders.length;
  const cycleLength = 8; // 7 qualifying orders + 1 free order
  const cycleNumber = Math.floor(totalCount / cycleLength) + 1;
  const positionInCycle = totalCount % cycleLength; // 0 to 7

  // If positionInCycle is 7, user has completed 7 orders! Next (8th) is FREE!
  const isRewardUnlocked = positionInCycle === 7;
  const currentCycleStamps = positionInCycle; // 0, 1, 2, 3, 4, 5, 6, 7
  const ordersNeeded = Math.max(0, 7 - currentCycleStamps);

  return {
    sellerId,
    restaurantName: restaurantName || 'Restaurant',
    qualifyingOrderCount: totalCount,
    currentCycleStamps,
    cycleNumber,
    isRewardUnlocked,
    freeFeastMaxAmount: 499,
    ordersNeeded,
    qualifyingOrders: matchingOrders
  };
}
