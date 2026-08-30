import { Routes } from '@angular/router';
import { RoutePlaceholderComponent } from '../../core/layout/route-placeholder/route-placeholder.component';

// /account/** — mounted behind authGuard + roleGuard(['CUSTOMER']) in app.routes.ts.
export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'My account' },
  },
  {
    path: 'reservations',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'My reservations' },
  },
];
