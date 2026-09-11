import { Money } from '../../../../shared/types/money.model';

export interface FeaturedDestination {
  readonly id: string;
  readonly city: string;
  readonly tagline: string;
  readonly imageUrl: string;
}

export interface FeaturedHotel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly city: string;
  readonly starRating: number;
  readonly reviewScore: number;
  readonly fromPricePerNight: Money;
  readonly imageUrl: string;
}

export interface FeaturedVoyage {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly departureCity: string;
  readonly durationDays: number;
  readonly fromPrice: Money;
  readonly imageUrl: string;
}

export interface FeaturedCircuit {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly route: string;
  readonly durationDays: number;
  readonly stops: number;
  readonly fromPrice: Money;
  readonly imageUrl: string;
}

export interface InspirationStory {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly excerpt: string | null;
  readonly imageUrl: string;
}
