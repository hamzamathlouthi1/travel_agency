import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { HotelResultsStore } from './hotel-results.store';
import { HOTEL_SEARCH_PROVIDER, HotelSearchRequest, HotelSearchResponse } from '../data-access/hotel-search.provider';
import { HotelResult } from '../models/hotel-result.model';

function fakeHotel(id: string): HotelResult {
  return {
    id,
    slug: id,
    name: `Hotel ${id}`,
    destination: 'Istanbul',
    area: 'Taksim',
    distanceNote: null,
    starRating: 4,
    guestRating: 8,
    guestRatingLabel: 'Excellent',
    reviewCount: 10,
    images: [],
    amenities: [],
    bestOffer: {
      id: `${id}-offer`,
      roomName: 'Standard',
      boardType: 'ROOM_ONLY',
      occupancy: { adults: 2, children: 0 },
      cancellationPolicy: { type: 'NON_REFUNDABLE' },
      totalPrice: { amount: 100, currency: 'TND' },
      pricePerNight: { amount: 100, currency: 'TND' },
      taxes: { included: true },
    },
    availability: null,
    badges: [],
  };
}

@Component({ selector: 'app-test-host', template: '', providers: [HotelResultsStore] })
class TestHostComponent {
  readonly store = inject(HotelResultsStore);
}

describe('HotelResultsStore', () => {
  let requests: HotelSearchRequest[];
  let subjects: Subject<HotelSearchResponse>[];
  // Convenience alias for tests that only ever issue one request before
  // asserting — the stale-request test below uses `subjects` directly to
  // control each request's resolution independently.
  let responses: Subject<HotelSearchResponse>;

  function fakeProvider() {
    requests = [];
    subjects = [];
    return {
      search(request: HotelSearchRequest): Observable<HotelSearchResponse> {
        requests.push(request);
        const subject = new Subject<HotelSearchResponse>();
        subjects.push(subject);
        responses = subject;
        return subject.asObservable();
      },
    };
  }

  async function setup(url: string, provider: unknown) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'hotels', component: TestHostComponent }]),
        { provide: HOTEL_SEARCH_PROVIDER, useValue: provider },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    const host = harness.routeDebugElement!.componentInstance as TestHostComponent;
    const appRef = TestBed.inject(ApplicationRef);
    // Signal writes from a navigation only mark the store's effect dirty;
    // flushing it needs an explicit CD tick. We use appRef.tick() rather
    // than fixture.whenStable() because whenStable() also waits for
    // PendingTasks to drain — and the fetch these tests are about to
    // trigger deliberately stays in-flight until the test resolves it.
    const flush = () => appRef.tick();
    return { harness, store: host.store, flush };
  }

  it('derives query/filters/sort/page from the current URL', async () => {
    const { store } = await setup(
      '/hotels?destination=Istanbul&checkIn=2026-10-12&checkOut=2026-10-18&adults=2&stars=4,5&sort=PRICE_LOW&page=2',
      fakeProvider(),
    );

    expect(store.query().destination).toBe('Istanbul');
    expect(store.query().checkIn).toBe('2026-10-12');
    expect(store.filters().stars).toEqual([4, 5]);
    expect(store.sort()).toBe('PRICE_LOW');
    expect(store.page()).toBe(2);
  });

  it('is in the loading state until the first response arrives, then holds results', async () => {
    const { store } = await setup('/hotels?destination=Istanbul', fakeProvider());

    expect(store.loading()).toBe(true);
    expect(store.results()).toBeNull();

    responses.next({ results: [fakeHotel('a')], totalResults: 1, totalPages: 1, partialAvailability: false });

    expect(store.loading()).toBe(false);
    expect(store.results()?.length).toBe(1);
    expect(store.isEmpty()).toBe(false);
  });

  it('reports isEmpty when a successful response has zero results', async () => {
    const { store } = await setup('/hotels?destination=Nowhere', fakeProvider());
    responses.next({ results: [], totalResults: 0, totalPages: 1, partialAvailability: false });
    expect(store.isEmpty()).toBe(true);
  });

  it('sets the error signal and clears loading when the provider fails', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'hotels', component: TestHostComponent }]),
        {
          provide: HOTEL_SEARCH_PROVIDER,
          useValue: { search: () => throwError(() => new Error('boom')) },
        },
      ],
    });
    const harness = await RouterTestingHarness.create('/hotels?destination=Istanbul');
    const host = harness.routeDebugElement!.componentInstance as TestHostComponent;

    expect(host.store.error()).toBe(true);
    expect(host.store.loading()).toBe(false);
  });

  it('setFilters navigates with page reset to 1 and re-fetches', async () => {
    const { store, flush } = await setup('/hotels?destination=Istanbul&page=3', fakeProvider());
    responses.next({ results: [fakeHotel('a')], totalResults: 1, totalPages: 3, partialAvailability: false });

    await store.setFilters({ ...store.filters(), stars: [5] });
    flush();

    expect(store.page()).toBe(1);
    expect(store.filters().stars).toEqual([5]);
    expect(requests.at(-1)?.filters.stars).toEqual([5]);
  });

  it('a stale in-flight request never overwrites a newer one', async () => {
    const { store, flush } = await setup('/hotels?destination=Istanbul', fakeProvider());
    const firstRequest = subjects[0];

    await store.setSort('PRICE_LOW');
    flush();
    const secondRequest = subjects[1];

    // Resolve the NEWER request first, then let the OLDER one resolve late.
    secondRequest.next({
      results: [fakeHotel('fresh')],
      totalResults: 1,
      totalPages: 1,
      partialAvailability: false,
    });
    firstRequest.next({
      results: [fakeHotel('stale')],
      totalResults: 1,
      totalPages: 1,
      partialAvailability: false,
    });

    expect(store.results()?.[0]?.id).toBe('fresh');
  });
});
