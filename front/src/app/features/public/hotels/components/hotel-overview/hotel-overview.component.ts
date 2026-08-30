import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-hotel-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2 class="title">Overview</h2>
      <p class="body">{{ description() }}</p>
    </section>
  `,
  styles: `
    .title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
      margin: 0 0 var(--space-3);
    }

    .body {
      font-size: var(--font-size-sm);
      line-height: var(--line-height-relaxed);
      color: var(--color-text-secondary);
      margin: 0;
      max-width: 62ch;
    }
  `,
})
export class HotelOverviewComponent {
  readonly description = input.required<string>();
}
