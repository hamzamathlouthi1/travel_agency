import { Routes } from '@angular/router';
import { RoutePlaceholderComponent } from '../../core/layout/route-placeholder/route-placeholder.component';

// /admin/** — the entire boundary is guarded from app.routes.ts
// (authGuard + roleGuard(['ADMIN', 'SUPER_ADMIN'])); admins authenticate
// through the shared public /login screen, there is no separate admin login.
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Admin dashboard' },
  },
  {
    path: 'reservations',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Reservations' },
  },
  {
    path: 'customers',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Customers' },
  },
  {
    path: 'agencies',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'B2B agencies' },
  },
  {
    path: 'hotels',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Hotels' },
  },
  {
    path: 'voyages',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Voyages' },
  },
  {
    path: 'circuits',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Circuits' },
  },
  {
    path: 'departures',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Departures' },
  },
  {
    path: 'sales',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Sales' },
  },
  {
    path: 'purchases',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Purchases' },
  },
  {
    path: 'invoices',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Invoices' },
  },
  {
    path: 'cash',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Cash management' },
  },
  {
    path: 'credit',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Credit management' },
  },
  {
    path: 'rooming-lists',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Rooming lists' },
  },
  {
    path: 'reporting',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Reporting' },
  },
  {
    path: 'suppliers',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Suppliers' },
  },
  {
    path: 'integration-monitoring',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Integration monitoring' },
  },
  {
    path: 'users',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Users' },
  },
  {
    path: 'configuration',
    loadComponent: () => RoutePlaceholderComponent,
    data: { title: 'Configuration' },
  },
];
