import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLE_AREA_MAP } from './core/auth/models/role.model';

// Top-level route boundaries. Each maps 1:1 to a portal from the
// architecture brief (public / account / b2b / admin) plus the cross-portal
// transactional flow (booking / checkout / payment). Every boundary is
// lazy-loaded — nothing here pulls in another portal's code.
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: 'booking',
    loadChildren: () => import('./features/booking/booking.routes').then((m) => m.BOOKING_ROUTES),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
  },
  {
    path: 'payment',
    loadChildren: () => import('./features/payment/payment.routes').then((m) => m.PAYMENT_ROUTES),
  },
  {
    path: 'account',
    canMatch: [authGuard, roleGuard(ROLE_AREA_MAP.account)],
    loadChildren: () => import('./features/account/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'b2b',
    // Guards are declared per-route inside b2b.routes.ts so /b2b/login stays reachable.
    loadChildren: () => import('./features/b2b/b2b.routes').then((m) => m.B2B_ROUTES),
  },
  {
    path: 'admin',
    canMatch: [authGuard, roleGuard(ROLE_AREA_MAP.admin)],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
