import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/http/interceptors/auth.interceptor';
import { errorInterceptor } from './core/http/interceptors/error.interceptor';
import { DESTINATION_PROVIDER } from './features/public/search/services/destination-provider';
import { MockDestinationProviderService } from './features/public/search/services/mock-destination-provider.service';
import { HOTEL_SEARCH_PROVIDER } from './features/public/hotels/data-access/hotel-search.provider';
import { MockHotelSearchProvider } from './features/public/hotels/data-access/mock-hotel-search.provider';
import { HOTEL_DETAIL_PROVIDER } from './features/public/hotels/data-access/hotel-detail.provider';
import { MockHotelDetailProvider } from './features/public/hotels/data-access/mock-hotel-detail.provider';
import { RATE_VERIFICATION_PROVIDER } from './features/public/hotels/data-access/rate-verification.provider';
import { MockRateVerificationProvider } from './features/public/hotels/data-access/mock-rate-verification.provider';
import { BOOKING_PROVIDER } from './features/booking/data-access/booking.provider';
import { MockBookingProvider } from './features/booking/data-access/mock-booking.provider';
import { PAYMENT_GATEWAY } from './features/payment/data-access/payment-gateway.provider';
import { MockPaymentGateway } from './features/payment/data-access/mock-payment-gateway.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    // Swap useClass for an HTTP-backed provider once the Spring Boot endpoint
    // exists — every search component depends on DESTINATION_PROVIDER only.
    { provide: DESTINATION_PROVIDER, useClass: MockDestinationProviderService },
    { provide: HOTEL_SEARCH_PROVIDER, useClass: MockHotelSearchProvider },
    { provide: HOTEL_DETAIL_PROVIDER, useClass: MockHotelDetailProvider },
    { provide: RATE_VERIFICATION_PROVIDER, useClass: MockRateVerificationProvider },
    { provide: BOOKING_PROVIDER, useClass: MockBookingProvider },
    { provide: PAYMENT_GATEWAY, useClass: MockPaymentGateway },
  ],
};
