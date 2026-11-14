export const PREMIUM_PRICE_ID = 'planazo_premium_monthly';

export type SubscriptionAccess = {
  price_id: string;
  status: string;
  current_period_end: string | null;
};

export function isPremiumActive(subscription: SubscriptionAccess | null | undefined, now = new Date()): boolean {
  if (!subscription || subscription.price_id !== PREMIUM_PRICE_ID) return false;
  const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
  const withinPaidPeriod = !periodEnd || periodEnd.getTime() > now.getTime();
  if (['active', 'trialing', 'past_due'].includes(subscription.status)) return withinPaidPeriod;
  return subscription.status === 'canceled' && !!periodEnd && withinPaidPeriod;
}
