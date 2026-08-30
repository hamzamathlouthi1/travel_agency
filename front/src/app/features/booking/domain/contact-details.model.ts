// The lead traveller is the only occupant who needs to be reachable —
// booking confirmation and any supplier follow-up go through this pair.
export interface ContactDetails {
  readonly email: string;
  readonly phone: string;
}
