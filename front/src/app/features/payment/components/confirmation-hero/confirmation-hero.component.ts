import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Explicit confirmed state — icon + heading + reference, never color alone.
@Component({
  selector: 'app-confirmation-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" role="status">
      <div class="badge" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1 class="title">Booking confirmed</h1>
      <p class="reference">Booking reference <b>{{ reference() }}</b></p>
    </div>
  `,
  styles: `
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-2);
      padding-block: var(--space-6);
    }

    .badge {
      width: 56px;
      height: 56px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-inverse);
      background: var(--color-success);
    }

    .title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      margin: 0;
    }

    .reference {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  `,
})
export class ConfirmationHeroComponent {
  readonly reference = input.required<string>();
}
