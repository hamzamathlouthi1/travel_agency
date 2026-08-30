import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="skeleton" [style.width]="width()" [style.height]="height()" role="presentation"></span>`,
  styles: `
    .skeleton {
      display: block;
      border-radius: var(--radius-sm);
      background: linear-gradient(
        90deg,
        var(--color-paper-100) 25%,
        var(--color-paper-0) 37%,
        var(--color-paper-100) 63%
      );
      background-size: 400% 100%;
      animation: shimmer 1.4s ease infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
        background: var(--color-paper-100);
      }
    }

    @keyframes shimmer {
      0% {
        background-position: 100% 0;
      }
      100% {
        background-position: 0 0;
      }
    }
  `,
})
export class SkeletonComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
}
