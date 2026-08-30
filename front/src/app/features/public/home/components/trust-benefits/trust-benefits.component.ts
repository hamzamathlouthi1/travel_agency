import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Benefit {
  readonly title: string;
  readonly description: string;
}

const BENEFITS: readonly Benefit[] = [
  {
    title: 'Curated, not crowdsourced',
    description: 'Every hotel and route is vetted before it’s listed — no unmanaged marketplace listings.',
  },
  {
    title: 'Secure, instant confirmation',
    description: 'Encrypted checkout with immediate booking confirmation, every time.',
  },
  {
    title: 'Human support, day or night',
    description: 'A real travel specialist is one call away, before and during your trip.',
  },
  {
    title: 'Trusted local partners',
    description: 'Direct relationships with hoteliers and operators in every destination we sell.',
  },
];

@Component({
  selector: 'app-trust-benefits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container benefits">
      @for (benefit of benefits; track benefit.title) {
        <div class="benefit">
          <div class="title">{{ benefit.title }}</div>
          <p class="description">{{ benefit.description }}</p>
        </div>
      }
    </section>
  `,
  styles: `
    .benefits {
      display: grid;
      grid-template-columns: 1fr;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-block: var(--space-12);
    }

    .benefit {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      border-block-end: 1px solid var(--color-border);
    }

    .title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .description {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    @media (min-width: 768px) {
      .benefits {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .benefits {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .benefit {
        border-block-end: none;
        border-inline-end: 1px solid var(--color-border);
      }
      .benefit:last-child {
        border-inline-end: none;
      }
    }
  `,
})
export class TrustBenefitsComponent {
  protected readonly benefits = BENEFITS;
}
