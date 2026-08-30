import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

export type EmptyResultsReason = 'FILTERED' | 'NO_AVAILABILITY';

// Two different empty states share this component but read differently:
// "your filters excluded everything" (recoverable in place) vs. "nothing
// was ever available for these dates" (needs a different search).
@Component({
  selector: 'app-empty-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="empty" role="status">
      @if (reason() === 'FILTERED') {
        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" fill="none" /><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.5" /></svg>
        <h2 class="title">No stays match your filters</h2>
        <p class="body">{{ resultsBeforeFilters() }} stays are available for these dates — try loosening a filter.</p>
        <app-button variant="primary" (click)="clearFilters.emit()">Clear filters</app-button>
      } @else {
        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.5" fill="none" /></svg>
        <h2 class="title">No available stays for these dates</h2>
        <p class="body">Try different dates, a nearby destination, or adjust travellers.</p>
        <app-button variant="primary" [navLink]="['/']">Change dates</app-button>
      }
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-3);
      padding: var(--space-12) var(--space-6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
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
export class EmptyResultsComponent {
  readonly reason = input<EmptyResultsReason>('FILTERED');
  readonly resultsBeforeFilters = input(0);
  readonly clearFilters = output<void>();
}
