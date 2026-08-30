import { Routes } from '@angular/router';
import { TransactionalLayoutComponent } from '../../core/layout/transactional-layout/transactional-layout.component';

// Angular only ever talks to our backend's payment endpoint, never directly
// to the payment gateway. See data-access/payment-gateway.provider.ts.
export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    component: TransactionalLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/payment-page/payment-page.component').then((m) => m.PaymentPageComponent),
        data: { title: 'Payment', step: 3 },
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import('./pages/confirmation-page/confirmation-page.component').then((m) => m.ConfirmationPageComponent),
        data: { title: 'Booking confirmation', step: 4 },
      },
    ],
  },
];
