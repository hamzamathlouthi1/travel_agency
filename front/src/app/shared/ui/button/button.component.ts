import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '../spinner/spinner.component';

export type ButtonVariant = 'primary' | 'cta' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

// The one button primitive for the whole app — every feature composes this
// rather than styling its own <button>/<a>. Pass `navLink` for a
// navigation action and it renders a real <a routerLink>, preserving
// open-in-new-tab, Ctrl/Cmd-click, and the browser context menu — a
// <button> intercepting a click can never do that. Omit it for an in-page
// action and it renders a native <button>. Variants/sizes are the only
// other levers; see shared/ui/icon-button for the square icon-only case.
@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent, RouterLink],
  template: `
    @if (navLink() !== null) {
      <a [routerLink]="navLink()" [class]="classes()" [attr.aria-disabled]="disabled() || null">
        <ng-content />
      </a>
    } @else {
      <button
        [type]="type()"
        [disabled]="disabled() || loading()"
        [class]="classes()"
        [attr.aria-busy]="loading() || null"
      >
        @if (loading()) {
          <app-spinner size="sm" [inverse]="variant() === 'primary' || variant() === 'cta'" />
        }
        <ng-content />
      </button>
    }
  `,
  styles: `
    :host {
      display: contents;
    }

    button,
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-family: var(--font-family-base);
      font-weight: var(--font-weight-bold);
      border-radius: var(--radius-md);
      border: 1.5px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      text-decoration: none;
      transition:
        background var(--transition-fast),
        color var(--transition-fast),
        border-color var(--transition-fast),
        box-shadow var(--transition-fast),
        opacity var(--transition-fast);
    }

    button:focus-visible,
    a:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    button:disabled,
    a[aria-disabled='true'] {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* sizes */
    .size-sm {
      font-size: var(--font-size-sm);
      padding: var(--space-2) var(--space-3);
      min-height: 36px;
    }
    .size-md {
      font-size: var(--font-size-sm);
      padding: var(--space-3) var(--space-5);
      min-height: 44px;
    }
    .size-lg {
      font-size: var(--font-size-md);
      padding: var(--space-4) var(--space-6);
      min-height: 52px;
    }

    /* variants */
    .variant-primary {
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
    }
    .variant-primary:not(:disabled):hover {
      background: var(--color-ink-900);
    }

    .variant-cta {
      background: var(--color-amber-600);
      color: var(--color-ink-950);
    }
    .variant-cta:not(:disabled):hover {
      background: var(--color-amber-500);
    }

    .variant-secondary {
      background: var(--color-surface);
      color: var(--color-ink-950);
      border-color: var(--color-ink-950);
    }
    .variant-secondary:not(:disabled):hover {
      background: var(--color-surface-subtle);
    }

    .variant-ghost {
      background: transparent;
      color: var(--color-ink-900);
    }
    .variant-ghost:not(:disabled):hover {
      background: var(--color-surface-subtle);
    }

    .variant-destructive {
      background: var(--color-surface);
      color: var(--color-danger);
      border-color: var(--color-danger);
    }
    .variant-destructive:not(:disabled):hover {
      background: var(--color-danger);
      color: var(--color-text-inverse);
    }

    .full-width {
      width: 100%;
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly navLink = input<string | readonly unknown[] | null>(null);

  protected readonly classes = computed(() =>
    [
      `variant-${this.variant()}`,
      `size-${this.size()}`,
      this.fullWidth() ? 'full-width' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
