import { Order, DeliveryPartner, DispatchPingPayload } from '../types';

export interface RankedRiderCandidate {
  partner: DeliveryPartner;
  matchScore: number;
  distanceKm: number;
  activeLoad: number;
  rank: number;
  reason: string;
}

/**
 * Calculates priority ranking for all active delivery partners for an order
 */
export function rankRidersForOrder(
  order: Order,
  partners: DeliveryPartner[]
): RankedRiderCandidate[] {
  // Only evaluate online/available or on-duty verified partners
  const eligiblePartners = partners.filter(
    p => p.verificationStatus === 'Verified' && p.currentStatus !== 'Offline'
  );

  const scored = eligiblePartners.map(partner => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Distance Proximity (Max 40 points)
    const dist = partner.currentDistanceToHubKm ?? 1.5;
    if (dist <= 0.8) {
      score += 40;
      reasons.push(`Super close (${dist} km away)`);
    } else if (dist <= 2.0) {
      score += 30;
      reasons.push(`Nearby (${dist} km away)`);
    } else if (dist <= 4.0) {
      score += 15;
      reasons.push(`Moderate distance (${dist} km)`);
    } else {
      score += 5;
      reasons.push(`Far (${dist} km)`);
    }

    // 2. Active Load / Idle State (Max 30 points)
    const load = partner.activeLoadCount ?? partner.assignedOrdersCount ?? 0;
    if (load === 0) {
      score += 30;
      reasons.push('Currently idle (0 active orders)');
    } else if (load === 1) {
      score += 15;
      reasons.push('Delivering 1 order (Can batch)');
    } else {
      score += 0;
      reasons.push(`High load (${load} active orders)`);
    }

    // 3. Partner Rating (Max 20 points)
    const rating = partner.rating || 4.5;
    if (rating >= 4.9) {
      score += 20;
      reasons.push(`Top rated ⭐ ${rating}`);
    } else if (rating >= 4.7) {
      score += 15;
      reasons.push(`High rating ⭐ ${rating}`);
    } else {
      score += 10;
      reasons.push(`Rating ⭐ ${rating}`);
    }

    // 4. Zone Affinity (Max 10 points)
    const isSameZone = !partner.operatingZoneId || !order.deliveryZoneId || partner.operatingZoneId === order.deliveryZoneId;
    if (isSameZone) {
      score += 10;
      reasons.push('Zone Match');
    }

    return {
      partner,
      matchScore: Math.min(99, score),
      distanceKm: dist,
      activeLoad: load,
      rank: 1,
      reason: reasons.join(' • ')
    };
  });

  // Sort descending by match score, then ascending by distance
  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

/**
 * Creates an incoming dispatch ping payload for the top-matched rider
 */
export function createDispatchPing(
  order: Order,
  targetPartner: DeliveryPartner,
  rank: number = 1,
  matchScore: number = 96
): DispatchPingPayload {
  const distToStore = targetPartner.currentDistanceToHubKm ?? 0.6;
  const distCustomer = 2.4; // Average delivery radius
  const basePay = targetPartner.rateCard?.basePay || 35;
  const extraKm = Math.max(0, distCustomer - 2.0);
  const distancePay = Math.round(extraKm * (targetPartner.rateCard?.perKmRate || 10));
  const surgePay = 15; // standard peak / live order bonus
  const estimatedEarnings = basePay + distancePay + surgePay;

  return {
    orderId: order.id,
    order,
    candidatePartnerId: targetPartner.id,
    candidatePartnerName: targetPartner.name,
    distanceToStoreKm: distToStore,
    distanceStoreToCustomerKm: distCustomer,
    estimatedEarnings,
    expiresAt: Date.now() + 30 * 1000, // 30 seconds countdown
    priorityRank: rank,
    matchScore,
    status: 'pinging'
  };
}
