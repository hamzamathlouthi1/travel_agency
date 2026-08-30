import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { APP_CONFIG } from '../../config/app-config';

// Attaches the bearer token to requests aimed at our own API. Never forward
// this token to a third-party origin (suppliers, payment gateway) — those
// are only ever reached through our backend.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const { apiBaseUrl, userServiceUrl } = inject(APP_CONFIG);
  const token = auth.getAccessToken();
  const isOwnBackend = req.url.startsWith(apiBaseUrl) || req.url.startsWith(userServiceUrl);

  if (!token || !isOwnBackend) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
