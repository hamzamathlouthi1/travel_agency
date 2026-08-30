import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';

// Mirrors the real card's proportions so the loading state never causes
// layout shift when results arrive.
@Component({
  selector: 'app-hotel-result-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="card" aria-hidden="true">
      <app-skeleton class="image" height="100%" />
      <div class="body">
        <app-skeleton width="30%" height="10px" />
        <app-skeleton width="55%" height="18px" />
        <app-skeleton width="40%" height="12px" />
        <app-skeleton width="50%" height="12px" />
      </div>
      <div class="cta">
        <app-skeleton width="70%" height="22px" />
        <app-skeleton height="38px" />
      </div>
    </div>
  `,
  styles: `
    .card {
      display: flex;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface);
    }

    .image {
      width: 260px;
      flex-shrink: 0;
    }

    .body {
      flex: 1;
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .cta {
      width: 200px;
      flex-shrink: 0;
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-3);
    }
  `,
})
export class HotelResultSkeletonComponent {}
