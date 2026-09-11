import { Routes } from '@angular/router';
import { TransactionalLayoutComponent } from '../../core/layout/transactional-layout/transactional-layout.component';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: TransactionalLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/booking-review-page/booking-review-page.component').then(
            (m) => m.BookingReviewPageComponent,
          ),
        data: { title: 'Review your booking', step: 2 },
      },
    ],
  },
];
