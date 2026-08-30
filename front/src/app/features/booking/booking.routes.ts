import { Routes } from '@angular/router';
import { TransactionalLayoutComponent } from '../../core/layout/transactional-layout/transactional-layout.component';

// Guest checkout is allowed, so this boundary is intentionally unguarded;
// individual steps that require an account enforce that themselves.
export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    component: TransactionalLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/traveller-details-page/traveller-details-page.component').then(
            (m) => m.TravellerDetailsPageComponent,
          ),
        data: { title: 'Traveller details', step: 1 },
      },
    ],
  },
];
