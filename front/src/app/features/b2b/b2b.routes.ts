import { Routes } from '@angular/router';
import { RoutePlaceholderComponent } from '../../core/layout/route-placeholder/route-placeholder.component';
import { guestGuard } from '../../core/guards/guest.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

// /b2b/** — guards are applied per-route (not on the parent path) so the
// login screen itself stays reachable while every other route requires an
// authenticated B2B_PARTNER/AGENT session.
const B2B_AUTH_GUARDS = [authGuard, roleGuard(['B2B_PARTNER', 'AGENT'])];

export const B2B_ROUTES: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Professional sign in' },
  },
  {
    path: 'dashboard',
    canMatch: B2B_AUTH_GUARDS,
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'B2B dashboard' },
  },
  {
    path: 'search',
    canMatch: B2B_AUTH_GUARDS,
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'B2B search' },
  },
  {
    path: 'reservations',
    canMatch: B2B_AUTH_GUARDS,
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'B2B reservations' },
  },
  {
    path: 'credit',
    canMatch: B2B_AUTH_GUARDS,
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Agency credit' },
  },
  {
    path: 'statements',
    canMatch: B2B_AUTH_GUARDS,
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Statements & invoices' },
  },
  {
    path: 'profile',
    canMatch: B2B_AUTH_GUARDS,
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Agency profile' },
  },
];
