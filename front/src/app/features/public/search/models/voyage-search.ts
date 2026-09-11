export interface VoyageSearchState {
  readonly departureCity: string;
  readonly destination: string;
  readonly travelPeriod: string; // e.g. "October 2026" — coarse month-level period
  readonly travellers: number;
}

export function createVoyageSearchState(): VoyageSearchState {
  return { departureCity: '', destination: '', travelPeriod: '', travellers: 2 };
}
