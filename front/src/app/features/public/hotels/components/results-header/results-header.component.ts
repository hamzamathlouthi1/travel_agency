import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-results-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="title">Hotels in {{ destination() }}</h1>
    <p class="context">
      @if (totalResults() !== null) {
        {{ totalResults() }} {{ totalResults() === 1 ? 'stay' : 'stays' }} found
      } @else {
        Searching stays&hellip;
      }
      · {{ nights() }} night{{ nights() === 1 ? '' : 's' }} · {{ occupancyLabel() }}
    </p>
  `,
  styles: `
    .title {
      font-family: var(--font-family-display);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-3xl);
      color: var(--color-ink-950);
      margin: 0 0 4px;
    }

    .context {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin: 0;
    }
  `,
})
export class ResultsHeaderComponent {
  readonly destination = input('');
  readonly totalResults = input<number | null>(null);
  readonly nights = input(1);
  readonly occupancyLabel = input('');
}
