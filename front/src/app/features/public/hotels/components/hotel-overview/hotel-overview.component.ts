import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-hotel-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2 class="title">Overview</h2>
      <p class="body">{{ description() }}</p>
      <div class="highlights">
        <div><span>✓</span><p><strong>Personally selected</strong><small>Reviewed by our travel team</small></p></div>
        <div><span>✓</span><p><strong>Instant confirmation</strong><small>Your booking is secured immediately</small></p></div>
        <div><span>✓</span><p><strong>Local assistance</strong><small>Support before and during your stay</small></p></div>
      </div>
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
    .highlights { display: grid; grid-template-columns: 1fr; gap: var(--space-3); margin-top: var(--space-5); }
    .highlights > div { display: flex; gap: 10px; padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-subtle); }
    .highlights span { color: var(--color-success); font-weight: 900; }.highlights p { display: grid; gap: 2px; margin: 0; }
    .highlights strong { font-size: var(--font-size-sm); }.highlights small { color: var(--color-text-muted); line-height: 1.4; }
    @media (min-width: 768px) { .highlights { grid-template-columns: repeat(3, 1fr); } }
  `,
})
export class HotelOverviewComponent {
  readonly description = input.required<string>();
}
