import {
  ChangeDetectionStrategy,
  Component,
  Optional,
  Self,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { IdGeneratorService } from '../../utils/id-generator.service';

export type TextFieldType = 'text' | 'email' | 'tel' | 'date' | 'password';

// Reactive-Forms-compatible text input (label + error), the ControlValueAccessor
// counterpart to shared/ui/input (which is signal-model-only and used by the
// search bar — not a fit for validated forms). Bind with formControlName;
// error text derives from the bound control's own validators once touched
// or edited, so callers never hand-wire error strings for the standard set
// (required/email/pattern/minlength/maxlength).
@Component({
  selector: 'app-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <label [for]="id" class="text-caption"
        >{{ label() }}
        @if (required()) {
          <span class="req">*</span>
        }
      </label>
      <input
        [id]="id"
        [type]="type()"
        [placeholder]="placeholder()"
        [attr.autocomplete]="autocomplete()"
        [attr.max]="max()"
        [attr.min]="min()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-invalid]="!!errorMessage() || null"
        [attr.aria-describedby]="errorMessage() ? id + '-error' : null"
        [class.has-error]="!!errorMessage()"
        (input)="onInput($any($event.target).value)"
        (blur)="onBlur()"
      />
      @if (errorMessage()) {
        <p [id]="id + '-error'" class="error" role="alert">{{ errorMessage() }}</p>
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

    .req {
      color: var(--color-danger);
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
      width: 100%;
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
export class TextFieldComponent implements ControlValueAccessor {
  private readonly idGenerator = inject(IdGeneratorService);
  readonly id = this.idGenerator.next('app-text-field');

  readonly label = input.required<string>();
  readonly type = input<TextFieldType>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly max = input<string | null>(null);
  readonly min = input<string | null>(null);

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  private readonly touchedOrDirty = signal(false);

  private onChangeFn: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(@Optional() @Self() private readonly ngControl: NgControl | null) {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  protected readonly errorMessage = computed(() => {
    const control = this.ngControl?.control;
    if (!control?.errors || !this.touchedOrDirty()) return null;
    if (control.errors['required']) return `${this.label()} is required.`;
    if (control.errors['email']) return 'Enter a valid email address.';
    if (control.errors['pattern']) return `Enter a valid ${this.label().toLowerCase()}.`;
    if (control.errors['minlength']) return `${this.label()} is too short.`;
    if (control.errors['maxlength']) return `${this.label()} is too long.`;
    return 'This field is invalid.';
  });

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(value: string): void {
    this.value.set(value);
    this.touchedOrDirty.set(true);
    this.onChangeFn(value);
  }

  protected onBlur(): void {
    this.touchedOrDirty.set(true);
    this.onTouchedFn();
  }
}
