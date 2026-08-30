import { firstValueFrom } from 'rxjs';
import { MockHotelSearchProvider } from './mock-hotel-search.provider';
import { HotelSearchRequest } from './hotel-search.provider';
import { createEmptyFilters } from '../models/hotel-filter.model';
import { HotelSearchQuery } from '../models/hotel-search-query.model';

function baseRequest(overrides: Partial<HotelSearchRequest> = {}): HotelSearchRequest {
  const query: HotelSearchQuery = {
    destination: 'Istanbul',
    checkIn: '2026-10-12',
    checkOut: '2026-10-18', // 6 nights
    adults: 2,
    children: 0,
    rooms: 1,
  };
  return {
    query,
    filters: createEmptyFilters(),
    sort: 'RECOMMENDED',
    page: 1,
    pageSize: 3,
    ...overrides,
  };
}

describe('MockHotelSearchProvider', () => {
  let provider: MockHotelSearchProvider;

  beforeEach(() => {
    provider = new MockHotelSearchProvider();
  });

  it('returns only hotels matching the destination', async () => {
    const response = await firstValueFrom(
      provider.search(baseRequest({ query: { ...baseRequest().query, destination: 'Nowhere' } })),
    );
    expect(response.totalResults).toBe(0);
    expect(response.results).toEqual([]);
  });

  it('paginates results according to pageSize', async () => {
    const page1 = await firstValueFrom(provider.search(baseRequest({ page: 1, pageSize: 3 })));
    const page2 = await firstValueFrom(provider.search(baseRequest({ page: 2, pageSize: 3 })));

    expect(page1.results.length).toBe(3);
    expect(page2.results.length).toBeGreaterThan(0);
    expect(page1.results.map((h) => h.id)).not.toEqual(page2.results.map((h) => h.id));
    expect(page1.totalResults).toBe(page2.totalResults);
  });

  it('filters by minimum star rating', async () => {
    const response = await firstValueFrom(
      provider.search(baseRequest({ filters: { ...createEmptyFilters(), stars: [5] }, pageSize: 20 })),
    );
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.every((h) => h.starRating === 5)).toBe(true);
  });

  it('filters to free-cancellation-only offers', async () => {
    const response = await firstValueFrom(
      provider.search(
        baseRequest({ filters: { ...createEmptyFilters(), freeCancellationOnly: true }, pageSize: 20 }),
      ),
    );
    expect(response.results.length).toBeGreaterThan(0);
    expect(
      response.results.every((h) => h.bestOffer.cancellationPolicy.type === 'FREE_CANCELLATION'),
    ).toBe(true);
  });

  it('computes the stay total as nightly rate × nights, not a flat number', async () => {
    const sixNights = await firstValueFrom(provider.search(baseRequest({ pageSize: 20 })));
    const oneNight = await firstValueFrom(
      provider.search(baseRequest({ pageSize: 20, query: { ...baseRequest().query, checkOut: '2026-10-13' } })),
    );

    const hotelId = sixNights.results[0].id;
    const sixNightPrice = sixNights.results.find((h) => h.id === hotelId)!.bestOffer.totalPrice.amount;
    const oneNightPrice = oneNight.results.find((h) => h.id === hotelId)!.bestOffer.totalPrice.amount;

    expect(sixNightPrice).toBe(oneNightPrice * 6);
  });

  it('sorts by price ascending when PRICE_LOW is requested', async () => {
    const response = await firstValueFrom(provider.search(baseRequest({ sort: 'PRICE_LOW', pageSize: 20 })));
    const prices = response.results.map((h) => h.bestOffer.totalPrice.amount);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by guest rating descending when GUEST_RATING is requested', async () => {
    const response = await firstValueFrom(
      provider.search(baseRequest({ sort: 'GUEST_RATING', pageSize: 20 })),
    );
    const ratings = response.results.map((h) => h.guestRating ?? 0);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  it('places a sponsored hotel first under RECOMMENDED', async () => {
    const response = await firstValueFrom(provider.search(baseRequest({ pageSize: 20 })));
    const sponsoredIndex = response.results.findIndex((h) => h.badges.includes('SPONSORED'));
    expect(sponsoredIndex).toBe(0);
  });
});
