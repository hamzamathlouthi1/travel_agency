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

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

// Reactive-Forms-compatible <select> counterpart to TextFieldComponent —
// same label/error/CVA shape, native <select> semantics underneath.
@Component({
  selector: 'app-select-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <label [for]="id" class="text-caption"
        >{{ label() }}
        @if (required()) {
          <span class="req">*</span>
        }
      </label>
      <select
        [id]="id"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-invalid]="!!errorMessage() || null"
        [attr.aria-describedby]="errorMessage() ? id + '-error' : null"
        [class.has-error]="!!errorMessage()"
        (change)="onInput($any($event.target).value)"
        (blur)="onBlur()"
      >
        @if (placeholder()) {
          <option value="" disabled>{{ placeholder() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
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

    select {
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

    select:focus-visible {
      outline: none;
      border-color: var(--color-ink-950);
      box-shadow: var(--shadow-focus);
    }

    select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    select.has-error {
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
export class SelectFieldComponent implements ControlValueAccessor {
  private readonly idGenerator = inject(IdGeneratorService);
  readonly id = this.idGenerator.next('app-select-field');

  readonly label = input.required<string>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly placeholder = input('');
  readonly required = input(false, { transform: booleanAttribute });

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
