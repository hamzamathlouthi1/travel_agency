import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  readonly apiBaseUrl: string;
  readonly userServiceUrl: string;
  readonly defaultLocale: string;
  readonly defaultCurrency: string;
  readonly production: boolean;
}

// Injected rather than imported directly by features, so tests and future
// per-portal overrides (B2B vs. public) can supply a different value.
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});
