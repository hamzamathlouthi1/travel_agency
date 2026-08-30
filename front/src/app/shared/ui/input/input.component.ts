import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { IdGeneratorService } from '../../utils/id-generator.service';

// Labeled text input. Two-way bound via [(value)] (a plain signal model —
// simplest fit for the search fields that use this today; wrap it with a
// ControlValueAccessor later if a feature needs formControlName directly).
@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <label [for]="id" class="text-caption">{{ label() }}</label>
      <input
        [id]="id"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-invalid]="!!error() || null"
        [attr.aria-describedby]="error() ? id + '-error' : null"
        [class.has-error]="!!error()"
        (input)="value.set($any($event.target).value)"
      />
      @if (error()) {
        <p [id]="id + '-error'" class="error" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    label {
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-muted);
    }

    input {
      font-family: var(--font-family-base);
      font-size: var(--font-size-md);
      color: var(--color-text-primary);
      background: var(--color-surface);
      border: var(--border-width-sm) solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      min-height: 44px;
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
    }

    input::placeholder {
      color: var(--color-ink-300);
    }

    input:focus-visible {
      outline: none;
      border-color: var(--color-ink-950);
      box-shadow: var(--shadow-focus);
    }

    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    input.has-error {
      border-color: var(--color-danger);
      border-width: var(--border-width-md);
    }

    .error {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--color-danger);
    }
  `,
})
export class InputComponent {
  readonly id = inject(IdGeneratorService).next('app-input');

  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly type = input<'text' | 'search' | 'email' | 'tel'>('text');
  readonly disabled = input(false);
  readonly error = input<string | null>(null);

  readonly value = model('');
}
