// The typed boundary between the /hotels URL and domain search state.
// Nothing else in the Hotels feature should read ActivatedRoute.queryParamMap
// directly — go through hotel-search-url.util.ts, which produces/consumes
// exactly this shape.
export interface HotelSearchQuery {
  readonly destination: string;
  readonly checkIn: string; // ISO date (YYYY-MM-DD)
  readonly checkOut: string; // ISO date (YYYY-MM-DD)
  readonly adults: number;
  readonly children: number;
  readonly rooms: number;
}

export function isSameQuery(a: HotelSearchQuery, b: HotelSearchQuery): boolean {
  return (
    a.destination === b.destination &&
    a.checkIn === b.checkIn &&
    a.checkOut === b.checkOut &&
    a.adults === b.adults &&
    a.children === b.children &&
    a.rooms === b.rooms
  );
}
