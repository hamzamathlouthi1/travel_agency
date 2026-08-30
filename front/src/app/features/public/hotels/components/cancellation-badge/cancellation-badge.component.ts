import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CancellationPolicy } from '../../models/hotel-result.model';
import { formatDate } from '../../../../../shared/utils/date.util';

// Always pairs an icon with text — cancellation status is never
// communicated by color alone.
@Component({
  selector: 'app-cancellation-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="badge" [class]="tone()">
      @switch (policy().type) {
        @case ('FREE_CANCELLATION') {
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" fill="none" /></svg>
          <span>Free cancellation until {{ freeUntilLabel() }}</span>
        }
        @case ('PARTIALLY_REFUNDABLE') {
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2" fill="none" /><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2.2" /></svg>
          <span>Partially refundable</span>
        }
        @case ('NON_REFUNDABLE') {
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" fill="none" /></svg>
          <span>Non-refundable</span>
        }
      }
    </div>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
    }

    .success {
      color: var(--color-success);
    }

    .warning {
      color: color-mix(in srgb, var(--color-warning) 55%, black);
    }

    .danger {
      color: var(--color-danger);
    }
  `,
})
export class CancellationBadgeComponent {
  readonly policy = input.required<CancellationPolicy>();
  readonly locale = input('en-US');

  protected readonly tone = computed(() => {
    switch (this.policy().type) {
      case 'FREE_CANCELLATION':
        return 'success';
      case 'PARTIALLY_REFUNDABLE':
        return 'warning';
      case 'NON_REFUNDABLE':
        return 'danger';
    }
  });

  protected readonly freeUntilLabel = computed(() => {
    const until = this.policy().freeUntil;
    return until ? formatDate(until, this.locale()) : '';
  });
}
