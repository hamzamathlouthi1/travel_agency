import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  HotelSearchProvider,
  HotelSearchRequest,
  HotelSearchResponse,
} from './hotel-search.provider';
import { HOTEL_FIXTURES, HotelFixture } from '../data/hotels.mock';
import { HotelOffer, HotelResult } from '../models/hotel-result.model';
import { HotelFilters } from '../models/hotel-filter.model';
import { HotelSortKey } from '../models/hotel-sort.model';

const SIMULATED_LATENCY_MS = 420;

function nightsBetween(checkInIso: string, checkOutIso: string): number {
  const ms = new Date(checkOutIso).getTime() - new Date(checkInIso).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function toOffer(fixture: HotelFixture, nights: number, adults: number, children: number): HotelOffer {
  const totalAmount = fixture.nightlyRate.amount * nights;
  return {
    id: `${fixture.id}-offer`,
    roomName: fixture.roomName,
    boardType: fixture.boardType,
    occupancy: { adults, children },
    cancellationPolicy: fixture.cancellationPolicy,
    totalPrice: { amount: totalAmount, currency: fixture.nightlyRate.currency },
    pricePerNight: fixture.nightlyRate,
    taxes: { included: fixture.taxesIncluded },
  };
}

function toResult(fixture: HotelFixture, nights: number, adults: number, children: number): HotelResult {
  return {
    id: fixture.id,
    slug: fixture.slug,
    name: fixture.name,
    destination: fixture.destination,
    area: fixture.area,
    distanceNote: fixture.distanceNote,
    starRating: fixture.starRating,
    guestRating: fixture.guestRating,
    guestRatingLabel: guestRatingLabel(fixture.guestRating),
    reviewCount: fixture.reviewCount,
    images: [{ id: `${fixture.id}-1`, alt: `${fixture.name}, ${fixture.area}, ${fixture.destination}` }],
    amenities: fixture.amenities,
    bestOffer: toOffer(fixture, nights, adults, children),
    availability: fixture.availability,
    badges: fixture.badges,
  };
}

function guestRatingLabel(score: number | null): string | null {
  if (score === null) return null;
  if (score >= 9) return 'Exceptional';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very good';
  if (score >= 6) return 'Good';
  return 'Fair';
}

function matchesFilters(fixture: HotelFixture, filters: HotelFilters, totalPrice: number): boolean {
  if (filters.minPrice !== null && totalPrice < filters.minPrice) return false;
  if (filters.maxPrice !== null && totalPrice > filters.maxPrice) return false;
  if (filters.stars.length && !filters.stars.includes(fixture.starRating)) return false;
  if (filters.minGuestRating !== null) {
    if (fixture.guestRating === null || fixture.guestRating < filters.minGuestRating) return false;
  }
  if (filters.boardTypes.length && !filters.boardTypes.includes(fixture.boardType)) return false;
  if (filters.freeCancellationOnly && fixture.cancellationPolicy.type !== 'FREE_CANCELLATION') {
    return false;
  }
  if (filters.amenities.length) {
    const fixtureAmenityIds = new Set(fixture.amenities.map((a) => a.id));
    if (!filters.amenities.every((id) => fixtureAmenityIds.has(id))) return false;
  }
  if (filters.areas.length) {
    const normalizedAreas = filters.areas.map((a) => a.toLowerCase());
    if (!normalizedAreas.includes(fixture.area.toLowerCase())) return false;
  }
  return true;
}

function compareBySort(a: HotelResult, b: HotelResult, sort: HotelSortKey): number {
  switch (sort) {
    case 'PRICE_LOW':
      return a.bestOffer.totalPrice.amount - b.bestOffer.totalPrice.amount;
    case 'PRICE_HIGH':
      return b.bestOffer.totalPrice.amount - a.bestOffer.totalPrice.amount;
    case 'GUEST_RATING':
      return (b.guestRating ?? 0) - (a.guestRating ?? 0);
    case 'STAR_RATING':
      return b.starRating - a.starRating;
    case 'BEST_VALUE':
      // Cheapest price per star — a simple, explainable proxy for "value".
      return (
        a.bestOffer.totalPrice.amount / a.starRating - b.bestOffer.totalPrice.amount / b.starRating
      );
    case 'RECOMMENDED':
    default:
      // Sponsored first, then guest rating, then review volume — deterministic
      // and explainable, never a black box.
      if (a.badges.includes('SPONSORED') !== b.badges.includes('SPONSORED')) {
        return a.badges.includes('SPONSORED') ? -1 : 1;
      }
      return (b.guestRating ?? 0) - (a.guestRating ?? 0) || b.reviewCount - a.reviewCount;
  }
}

@Injectable({ providedIn: 'root' })
export class MockHotelSearchProvider implements HotelSearchProvider {
  search(request: HotelSearchRequest): Observable<HotelSearchResponse> {
    const { query, filters, sort, page, pageSize } = request;
    const nights = nightsBetween(query.checkIn, query.checkOut);
    const destinationQuery = query.destination.trim().toLowerCase();

    const matching = HOTEL_FIXTURES.filter((fixture) => {
      if (destinationQuery && !fixture.destination.toLowerCase().includes(destinationQuery)) {
        return false;
      }
      const totalPrice = fixture.nightlyRate.amount * nights;
      return matchesFilters(fixture, filters, totalPrice);
    });

    const results = matching
      .map((fixture) => toResult(fixture, nights, query.adults, query.children))
      .sort((a, b) => compareBySort(a, b, sort));

    const totalResults = results.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const clampedPage = Math.min(Math.max(1, page), totalPages);
    const start = (clampedPage - 1) * pageSize;
    const pageResults = results.slice(start, start + pageSize);

    const response: HotelSearchResponse = {
      results: pageResults,
      totalResults,
      totalPages,
      partialAvailability: false,
    };

    return of(response).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
