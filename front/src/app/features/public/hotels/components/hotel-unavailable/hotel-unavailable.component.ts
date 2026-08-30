import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

export type UnavailableReason = 'NOT_FOUND' | 'NO_AVAILABILITY';

// Two genuinely different situations that share this component: the hotel
// itself doesn't exist / isn't bookable at all (NOT_FOUND) vs. it exists
// but every rate is unavailable for the searched dates (NO_AVAILABILITY).
@Component({
  selector: 'app-hotel-unavailable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="unavailable" role="status">
      @if (reason() === 'NOT_FOUND') {
        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.5" fill="none" /></svg>
        <h2 class="title">This hotel isn't bookable right now</h2>
        <p class="body">Try another hotel for your dates.</p>
        <app-button variant="primary" [navLink]="['/hotels']">Back to results</app-button>
      } @else {
        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.3 4.5 6 4.5c2 0 3.6 1 4.9 2.9C12.4 5.4 14 4.5 16 4.5c3.7 0 5.5 3.5 4 7.2C18 16.4 12 21 12 21z" stroke="currentColor" stroke-width="1.5" fill="none" /></svg>
        <h2 class="title">No rooms left for these dates</h2>
        <p class="body">Change your dates or explore other hotels.</p>
        <div class="actions">
          <app-button variant="primary" [navLink]="['/hotels']">Change dates</app-button>
          <app-button variant="secondary" [navLink]="['/hotels']">Back to results</app-button>
        </div>
      }
    </div>
  `,
  styles: `
    .unavailable {
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
export class HotelUnavailableComponent {
  readonly reason = input<UnavailableReason>('NOT_FOUND');
}
