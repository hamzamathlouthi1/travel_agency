import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-checkout-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="skel-page" aria-hidden="true">
      <app-skeleton height="14px" width="30%" />
      <app-skeleton height="140px" />
      <app-skeleton height="16px" width="25%" />
      <app-skeleton height="100px" />
      <app-skeleton height="16px" width="20%" />
      <app-skeleton height="140px" />
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
export class CheckoutSkeletonComponent {}
