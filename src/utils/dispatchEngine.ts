export function rankRidersForOrder(order: any, riders: any[]) {
  return riders;
}

export function createDispatchPing(orderId: string, riderId: string) {
  return { orderId, riderId, timestamp: Date.now() };
}
