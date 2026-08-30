import { firstValueFrom } from 'rxjs';
import { MockHotelDetailProvider } from './mock-hotel-detail.provider';

describe('MockHotelDetailProvider', () => {
  let provider: MockHotelDetailProvider;

  beforeEach(() => {
    provider = new MockHotelDetailProvider();
  });

  it('resolves a known slug with full room/rate data', async () => {
    const hotel = await firstValueFrom(provider.getBySlug('meridian-bosphorus-hotel'));

    expect(hotel).not.toBeNull();
    expect(hotel!.name).toBe('Meridian Bosphorus Hotel');
    expect(hotel!.rooms.length).toBeGreaterThan(1);

    const deluxe = hotel!.rooms.find((r) => r.id === 'deluxe-bosphorus');
    expect(deluxe).toBeDefined();
    expect(deluxe!.ratePlans.length).toBeGreaterThanOrEqual(2);

    // The core domain rule: a room's rate plans must differ in terms, not
    // just be duplicates with different IDs.
    const [rateA, rateB] = deluxe!.ratePlans;
    expect(rateA.cancellationPolicy.type).not.toBe(rateB.cancellationPolicy.type);
    expect(rateA.totalPrice.amount).not.toBe(rateB.totalPrice.amount);
  });

  it('resolves null for a slug that does not exist', async () => {
    const hotel = await firstValueFrom(provider.getBySlug('does-not-exist'));
    expect(hotel).toBeNull();
  });

  it('every generated hotel result has at least one room with at least one rate plan', async () => {
    for (const slug of ['galata-house-istanbul', 'sultanahmet-grand', 'karakoy-urban-stay']) {
      const hotel = await firstValueFrom(provider.getBySlug(slug));
      expect(hotel).not.toBeNull();
      expect(hotel!.rooms.length).toBeGreaterThan(0);
      expect(hotel!.rooms[0].ratePlans.length).toBeGreaterThan(0);
    }
  });
});
