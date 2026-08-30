import { Money } from '../../../../shared/types/money.model';

export interface FeaturedDestination {
  readonly id: string;
  readonly city: string;
  readonly tagline: string;
}

export interface FeaturedHotel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly city: string;
  readonly starRating: number;
  readonly reviewScore: number;
  readonly fromPricePerNight: Money;
}

export interface FeaturedVoyage {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly departureCity: string;
  readonly durationDays: number;
  readonly fromPrice: Money;
}

export interface FeaturedCircuit {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly route: string;
  readonly durationDays: number;
  readonly stops: number;
  readonly fromPrice: Money;
}

export interface InspirationStory {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly excerpt: string | null;
}
