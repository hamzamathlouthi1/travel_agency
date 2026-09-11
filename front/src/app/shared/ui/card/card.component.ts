import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

// Generic surface container — hairline border, restrained radius, optional
// hover lift. Feature cards (hotel/voyage/circuit/destination) compose this
// rather than repeating the same border/radius/shadow declarations.
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card" [class.interactive]="interactive()"><ng-content /></div>`,
  styles: `
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition:
        box-shadow var(--transition-base),
        transform var(--transition-base);
    }

    .card.interactive:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    @media (prefers-reduced-motion: reduce) {
      .card {
        transition: none;
      }
      .card.interactive:hover {
        transform: none;
      }
    }
  `,
})
export class CardComponent {
  readonly interactive = input(false, { transform: booleanAttribute });
}
