import { describe, expect, it } from 'vitest';
import { isPremiumActive, PREMIUM_PRICE_ID } from '@/features/planazo/subscription-access';

const now = new Date('2026-11-14T12:00:00Z');
const future = '2026-12-14T12:00:00Z';
const past = '2026-11-13T12:00:00Z';
const subscription = { price_id: PREMIUM_PRICE_ID, status: 'active', current_period_end: future };

describe('acceso Premium', () => {
  it('activa Premium con una suscripción activa y vigente', () => {
    expect(isPremiumActive(subscription, now)).toBe(true);
  });
  it('mantiene Premium durante un cobro pendiente de reintento', () => {
    expect(isPremiumActive({ ...subscription, status: 'past_due' }, now)).toBe(true);
  });
  it('mantiene Premium cancelado hasta terminar el periodo pagado', () => {
    expect(isPremiumActive({ ...subscription, status: 'canceled' }, now)).toBe(true);
    expect(isPremiumActive({ ...subscription, status: 'canceled', current_period_end: past }, now)).toBe(false);
  });
  it('no activa Premium por una suscripción incompleta ni por otro producto', () => {
    expect(isPremiumActive({ ...subscription, status: 'incomplete' }, now)).toBe(false);
    expect(isPremiumActive({ ...subscription, price_id: 'otro_producto' }, now)).toBe(false);
  });
});
