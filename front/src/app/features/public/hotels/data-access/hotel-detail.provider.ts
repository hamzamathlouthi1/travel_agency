import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { HotelDetail } from '../models/hotel-detail.model';

// HotelDetailStore depends on this token only. `getBySlug` resolves to
// `null` for a slug that genuinely doesn't exist (distinct from a thrown
// error, which means the fetch itself failed) — the store/page tell those
// two states apart. Swap the `useClass` in app.config.ts for a Spring
// Boot-backed implementation later; no component needs to change.
export interface HotelDetailProvider {
  getBySlug(slug: string): Observable<HotelDetail | null>;
}

export const HOTEL_DETAIL_PROVIDER = new InjectionToken<HotelDetailProvider>(
  'HOTEL_DETAIL_PROVIDER',
);
