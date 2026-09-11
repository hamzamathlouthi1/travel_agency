import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';

// Mirrors the real page's structure — gallery, title, stay summary, room
// content — so nothing shifts once the hotel arrives.
@Component({
  selector: 'app-hotel-detail-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="skel-page" aria-hidden="true">
      <app-skeleton height="14px" width="20%" />
      <app-skeleton height="34px" width="45%" />
      <app-skeleton height="240px" />
      <app-skeleton height="60px" />
      <app-skeleton height="16px" width="25%" />
      <app-skeleton height="140px" />
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
export class HotelDetailSkeletonComponent {}
