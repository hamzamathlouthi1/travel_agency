import { Routes } from '@angular/router';
import { RoutePlaceholderComponent } from '../../core/layout/route-placeholder/route-placeholder.component';
import { PublicLayoutComponent } from '../../core/layout/public-layout/public-layout.component';
import { guestGuard } from '../../core/guards/guest.guard';

// B2C public surface. Every route here must stay SSR/prerender-friendly and
// crawlable — see app.routes.server.ts for the render-mode assignment.
// Everything is nested under PublicLayoutComponent (header + footer shell).
const PUBLIC_CHILD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home-page.component').then((m) => m.HomePageComponent),
    data: { title: 'Home' },
  },
  {
    path: 'hotels',
    loadComponent: () =>
      import('./hotels/pages/hotel-results-page/hotel-results-page.component').then(
        (m) => m.HotelResultsPageComponent,
      ),
    data: { title: 'Hotel search' },
  },
  {
    path: 'hotels/:slug',
    loadComponent: () =>
      import('./hotels/pages/hotel-detail-page/hotel-detail-page.component').then(
        (m) => m.HotelDetailPageComponent,
      ),
    data: { title: 'Hotel details' },
  },
  {
    path: 'voyages',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Voyages' },
  },
  {
    path: 'voyages/:slug',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Voyage details' },
  },
  {
    path: 'circuits',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Circuits' },
  },
  {
    path: 'circuits/:slug',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Circuit details' },
  },
  {
    path: 'offers',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Offers' },
  },
  {
    path: 'ticket-request',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Ticket request' },
  },
  {
    path: 'terms',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Terms & conditions' },
  },
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () => import('./auth/login-page.component').then((m) => m.LoginPageComponent),
    data: { title: 'Sign in' },
  },
  {
    path: 'register',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./auth/register-page.component').then((m) => m.RegisterPageComponent),
    data: { title: 'Create account' },
  },
];

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: PUBLIC_CHILD_ROUTES,
  },
];
