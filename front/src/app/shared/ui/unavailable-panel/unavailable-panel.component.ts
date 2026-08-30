import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Shared shell for "this link/selection isn't valid, here's what to do
// instead" states. Introduced once a third near-identical copy
// (booking-unavailable, payment-unavailable, on top of
// booking/invalid-selection) made the duplication concrete — each feature
// keeps its own reason-to-copy mapping and projects its own action button(s).
// Deliberately separate from HotelUnavailableComponent (hotels/components),
// whose NOT_FOUND/NO_AVAILABILITY states use different icons and a genuine
// two-button layout rather than this single-icon/single-message shape.
@Component({
  selector: 'app-unavailable-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap" role="alert">
      <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none" />
        <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.6" />
      </svg>
      <h2 class="title">{{ title() }}</h2>
      <p class="body">{{ body() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    .wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-3);
      padding: var(--space-16) var(--space-6);
      color: var(--color-text-muted);
    }

    .title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-extrabold);
      color: var(--color-text-primary);
      margin: var(--space-2) 0 0;
    }

    .body {
      font-size: var(--font-size-sm);
      max-width: 40ch;
      margin: 0;
    }
  `,
})
export class UnavailablePanelComponent {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
}
