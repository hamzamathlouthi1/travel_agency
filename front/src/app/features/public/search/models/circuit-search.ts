export interface CircuitSearchState {
  readonly region: string;
  readonly duration: string; // e.g. "7-14 days"
  readonly departureWindow: string; // e.g. "Oct - Dec 2026"
}

export function createCircuitSearchState(): CircuitSearchState {
  return { region: '', duration: '', departureWindow: '' };
}
