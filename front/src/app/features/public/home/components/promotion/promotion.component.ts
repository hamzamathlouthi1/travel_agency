import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

// One restrained campaign band — deliberately not styled like a discount
// marketplace (no slashed prices, no countdown, no red banner).
@Component({
  selector: 'app-promotion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <section class="container">
      <div class="band">
        <div class="copy">
          <p class="text-eyebrow eyebrow">Let's go!</p>
          <p class="headline">Your Next Adventure Awaits!</p>
          <p class="subcopy">
            Members see next season's fares and room allotments before anyone else — no code
            needed.
          </p>
        </div>
        <app-button variant="cta" size="lg">Plan your trip →</app-button>
      </div>
    </section>
  `,
  styles: `
    .band {
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, rgba(6,56,94,.98), rgba(7,100,160,.65)), url('/images/home/tunisia-lagoon.jpg') center 57% / cover;
      border-radius: var(--radius-lg);
      padding: var(--space-8) var(--space-6);
      margin-block: var(--space-10) var(--space-16);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .eyebrow {
      color: #bce8ff;
    }

    .headline {
      font-family: var(--font-family-display);
      font-style: italic;
      font-size: var(--font-size-2xl);
      line-height: var(--line-height-tight);
      color: #fff;
      margin: var(--space-3) 0 var(--space-3);
      max-width: 32ch;
    }

    .subcopy {
      font-size: var(--font-size-sm);
      color: oklch(85% 0.01 250);
      line-height: var(--line-height-relaxed);
      margin: 0;
      max-width: 46ch;
    }

    @media (min-width: 1024px) {
      .band {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-10) var(--space-12);
      }
    }
  `,
})
export class PromotionComponent {}
