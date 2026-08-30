export interface Destination {
  readonly id: string;
  readonly city: string;
  readonly country: string;
}

export function destinationLabel(destination: Destination): string {
  return `${destination.city}, ${destination.country}`;
}
