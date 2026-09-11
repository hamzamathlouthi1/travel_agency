import { ChangeDetectionStrategy, Component } from '@angular/core';

const BENEFITS = [
  { icon: '◇', title: 'Best Price Guarantee', description: 'We ensure you get the best deals, always.' },
  { icon: '◉', title: '24/7 Customer Support', description: 'We are here to help you anytime, anywhere.' },
  { icon: '♢', title: 'Secure Bookings', description: 'Your data and payments are 100% safe with us.' },
  { icon: '✺', title: 'Handpicked Experiences', description: 'Curated tours and hotels for unforgettable trips.' },
] as const;

@Component({
  selector: 'app-trust-benefits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container benefits">
      @for (benefit of benefits; track benefit.title) {
        <div class="benefit"><span class="icon">{{ benefit.icon }}</span><div><div class="title">{{ benefit.title }}</div><p>{{ benefit.description }}</p></div></div>
      }
    </section>
  `,
  styles: `
    .benefits { display: grid; grid-template-columns: 1fr; margin-block: 105px 12px; }
    .benefit { padding: 20px; display: flex; align-items: flex-start; gap: 13px; }
    .icon { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; border-radius: 50%; background: #e7f5ff; color: #0873d1; font-size: 20px; transition: transform .25s; }
    .benefit:hover .icon { transform: translateY(-4px) rotate(6deg); }
    .title { color: #123853; font-size: 12px; font-weight: 800; }
    p { margin: 5px 0 0; color: #718698; font-size: 10px; line-height: 1.55; }
    @media (min-width: 600px) { .benefits { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .benefits { grid-template-columns: repeat(4, 1fr); } }
  `,
})
export class TrustBenefitsComponent { protected readonly benefits = BENEFITS; }
