import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

// Shared shell for "this fetch failed, retry" states. Introduced once a
// third near-identical copy (traveller-details-error, checkout-error,
// payment-error, on top of hotel-detail-error) made the duplication
// concrete rather than theoretical — each feature keeps its own copy text
// and any extra action, projected via content.
@Component({
  selector: 'app-retry-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="error" role="alert">
      <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none" />
        <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.6" />
      </svg>
      <h2 class="title">{{ title() }}</h2>
      <p class="body">{{ body() }}</p>
      <div class="actions">
        <app-button variant="destructive" (click)="retry.emit()">Retry</app-button>
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-3);
      padding: var(--space-16) var(--space-6);
      color: var(--color-danger);
    }

    .title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-extrabold);
      color: var(--color-text-primary);
      margin: var(--space-2) 0 0;
    }

    .body {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin: 0;
    }

    .actions {
      display: flex;
      gap: var(--space-3);
      margin-block-start: var(--space-2);
    }
  `,
})
export class RetryPanelComponent {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly retry = output<void>();
}
