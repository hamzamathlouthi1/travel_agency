import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="spinner" [class.sm]="size() === 'sm'" [class.inverse]="inverse()"></span>`,
  styles: `
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--color-ink-950) 25%, transparent);
      border-top-color: var(--color-ink-950);
      animation: spin 700ms linear infinite;
    }

    .spinner.sm {
      width: 14px;
      height: 14px;
    }

    .spinner.inverse {
      border-color: rgba(255, 255, 255, 0.35);
      border-top-color: #fff;
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation-duration: 1400ms;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class SpinnerComponent {
  readonly size = input<'sm' | 'md'>('md');
  readonly inverse = input(false);
}
