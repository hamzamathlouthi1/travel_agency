import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'tone-' + tone()"><ng-content /></span>`,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      font-family: var(--font-family-base);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-xs);
      border-radius: var(--radius-sm);
      padding: 0.2rem 0.5rem;
      line-height: 1.4;
    }

    .tone-neutral {
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
    }
    .tone-success {
      background: var(--color-success);
      color: var(--color-text-inverse);
    }
    .tone-warning {
      background: var(--color-amber-100);
      color: color-mix(in srgb, var(--color-amber-600) 70%, black);
    }
    .tone-danger {
      background: color-mix(in srgb, var(--color-danger) 12%, white);
      color: var(--color-danger);
    }
    .tone-info {
      background: var(--color-teal-100);
      color: var(--color-teal-600);
    }
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
}
