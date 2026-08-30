export type TravellerTitle = 'MR' | 'MRS' | 'MS';

export const TRAVELLER_TITLE_LABEL: Record<TravellerTitle, string> = {
  MR: 'Mr',
  MRS: 'Mrs',
  MS: 'Ms',
};

export type TravellerType = 'ADULT' | 'CHILD';

// A single occupant on the reservation. The lead traveller (see
// contact-details.model.ts) is always the first ADULT; every other slot is
// derived from the room/rate occupancy carried in the URL selection (see
// booking-selection.model.ts) — never re-entered by the traveller.
export interface Traveller {
  readonly type: TravellerType;
  readonly title: TravellerTitle | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string | null;
}
