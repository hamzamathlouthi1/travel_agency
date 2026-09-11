import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';

// Mirrors the real page's shape — breadcrumb, summary card, lead traveller
// fieldset, additional travellers — so nothing shifts once the hotel loads.
@Component({
  selector: 'app-traveller-details-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="skel-page" aria-hidden="true">
      <app-skeleton height="14px" width="30%" />
      <app-skeleton height="120px" />
      <app-skeleton height="16px" width="25%" />
      <app-skeleton height="200px" />
      <app-skeleton height="200px" />
    </div>
  `,
  styles: `
    .skel-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
  `,
})
export class TravellerDetailsSkeletonComponent {}
