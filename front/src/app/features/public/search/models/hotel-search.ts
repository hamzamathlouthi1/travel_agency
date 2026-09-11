// Hotel suppliers commonly price by room occupancy, not a flat traveller
// count — a room's `children` always needs `childAges` alongside it, so the
// two are modeled together rather than as a bare number.
export interface Room {
  readonly adults: number;
  readonly children: number;
  readonly childAges: readonly (number | null)[];
}

export interface HotelSearchState {
  readonly destination: string;
  readonly checkIn: string | null; // ISO date (YYYY-MM-DD)
  readonly checkOut: string | null; // ISO date (YYYY-MM-DD)
  readonly rooms: readonly Room[];
}

export function createRoom(): Room {
  return { adults: 2, children: 0, childAges: [] };
}

export function createHotelSearchState(): HotelSearchState {
  return { destination: '', checkIn: null, checkOut: null, rooms: [createRoom()] };
}

export function totalTravellers(rooms: readonly Room[]): number {
  return rooms.reduce((sum, room) => sum + room.adults + room.children, 0);
}
