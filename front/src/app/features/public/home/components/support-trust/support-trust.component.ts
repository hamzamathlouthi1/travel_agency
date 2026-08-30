import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Reassurance {
  readonly title: string;
  readonly description: string;
}

const REASSURANCES: readonly Reassurance[] = [
  { title: 'Free cancellation', description: 'On most rates, up to 48h before' },
  { title: '24/7 phone support', description: 'In English, French & Arabic' },
  { title: 'Price shown is price paid', description: 'Taxes & fees always included' },
];

@Component({
  selector: 'app-support-trust',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="band">
      <div class="container inner">
        <div class="heading">
          <h2 class="text-editorial-h2">Booking with us, made simple</h2>
          <p class="lede">Real support, clear policies, no surprises at checkout.</p>
        </div>
        @for (item of reassurances; track item.title) {
          <div class="item">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" class="check">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
            <div>
              <div class="item-title">{{ item.title }}</div>
              <div class="item-description">{{ item.description }}</div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .band {
      background: var(--color-surface-subtle);
      border-block: 1px solid var(--color-border);
    }

    .inner {
      padding-block: var(--space-10);
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);
      align-items: center;
    }

    .lede {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin: var(--space-2) 0 0;
      max-width: 32ch;
    }

    .item {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
    }

    .check {
      color: var(--color-success);
      flex-shrink: 0;
      margin-block-start: 2px;
    }

    .item-title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .item-description {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    @media (min-width: 1024px) {
      .inner {
        grid-template-columns: 1.1fr repeat(3, 1fr);
      }
    }
  `,
})
export class SupportTrustComponent {
  protected readonly reassurances = REASSURANCES;
}
