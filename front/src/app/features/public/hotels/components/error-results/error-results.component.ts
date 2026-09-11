import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

// Calm, user-oriented failure — never exposes a technical/backend error
// code or message.
@Component({
  selector: 'app-error-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="error" role="alert">
      <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none" /><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.6" /></svg>
      <h2 class="title">We couldn't load stays right now</h2>
      <p class="body">Something went wrong on our side. Your search is still saved.</p>
      <app-button variant="destructive" (click)="retry.emit()">Retry</app-button>
    </div>
  `,
  styles: `
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-3);
      padding: var(--space-12) var(--space-6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
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
      max-width: 40ch;
    }
  `,
})
export class ErrorResultsComponent {
  readonly retry = output<void>();
}
