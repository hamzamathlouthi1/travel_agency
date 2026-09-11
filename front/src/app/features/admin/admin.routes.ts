import { Routes } from '@angular/router';
import { RoutePlaceholderComponent } from '../../core/layout/route-placeholder/route-placeholder.component';

const adminPlaceholder = (title: string) => ({
  loadComponent: () => import('./pages/admin-section-placeholder.component').then((m) => m.AdminSectionPlaceholderComponent),
  data: { title },
});

export const ADMIN_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
  children: [
    { path: '', pathMatch: 'full', loadComponent: () => import('./pages/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
    { path: 'users', loadComponent: () => import('./pages/admin-users.component').then((m) => m.AdminUsersComponent) },
    { path: 'customers', redirectTo: 'users' },
    { path: 'reservations', ...adminPlaceholder('Reservations') },
    { path: 'agencies', ...adminPlaceholder('B2B agencies') },
    { path: 'hotels', ...adminPlaceholder('Hotels') },
    { path: 'voyages', ...adminPlaceholder('Voyages') },
    { path: 'circuits', ...adminPlaceholder('Circuits') },
    { path: 'departures', ...adminPlaceholder('Departures') },
    { path: 'sales', ...adminPlaceholder('Sales') },
    { path: 'purchases', ...adminPlaceholder('Purchases') },
    { path: 'invoices', ...adminPlaceholder('Invoices') },
    { path: 'cash', ...adminPlaceholder('Cash management') },
    { path: 'credit', ...adminPlaceholder('Credit management') },
    { path: 'rooming-lists', ...adminPlaceholder('Rooming lists') },
    { path: 'reporting', ...adminPlaceholder('Reporting') },
    { path: 'suppliers', ...adminPlaceholder('Suppliers') },
    { path: 'integration-monitoring', ...adminPlaceholder('Integration monitoring') },
    { path: 'configuration', ...adminPlaceholder('Configuration') },
  ],
}];

// /admin/** — the entire boundary is guarded from app.routes.ts
// (authGuard + roleGuard(['ADMIN', 'SUPER_ADMIN'])); admins authenticate
// through the shared public /login screen, there is no separate admin login.
const LEGACY_ADMIN_ROUTES: Routes = [
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
