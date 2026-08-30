import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { HotelDetailProvider } from './hotel-detail.provider';
import { HotelDetail } from '../models/hotel-detail.model';
import { HOTEL_DETAILS_MOCK } from '../data/hotel-details.mock';

const SIMULATED_LATENCY_MS = 380;

@Injectable({ providedIn: 'root' })
export class MockHotelDetailProvider implements HotelDetailProvider {
  getBySlug(slug: string): Observable<HotelDetail | null> {
    const hotel = HOTEL_DETAILS_MOCK.find((h) => h.slug === slug) ?? null;
    return of(hotel).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
