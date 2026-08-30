import { ChangeDetectionStrategy, Component, Optional, Self, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { IdGeneratorService } from '../../utils/id-generator.service';

// Reactive-Forms-compatible <textarea> counterpart to TextFieldComponent —
// used for free-text notes (e.g. special requests) where a single-line
// input isn't enough.
@Component({
  selector: 'app-textarea-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <label [for]="id" class="text-caption">{{ label() }}</label>
      <textarea
        [id]="id"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [attr.maxlength]="maxLength()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-invalid]="!!errorMessage() || null"
        [attr.aria-describedby]="errorMessage() ? id + '-error' : null"
        [class.has-error]="!!errorMessage()"
        (input)="onInput($any($event.target).value)"
        (blur)="onBlur()"
      ></textarea>
      @if (maxLength()) {
        <p class="hint">{{ value().length }}/{{ maxLength() }}</p>
      }
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

    textarea {
      font-family: var(--font-family-base);
      font-size: var(--font-size-md);
      color: var(--color-text-primary);
      background: var(--color-surface);
      border: var(--border-width-sm) solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      width: 100%;
      resize: vertical;
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
    }

    textarea::placeholder {
      color: var(--color-ink-300);
    }

    textarea:focus-visible {
      outline: none;
      border-color: var(--color-ink-950);
      box-shadow: var(--shadow-focus);
    }

    textarea:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    textarea.has-error {
      border-color: var(--color-danger);
      border-width: var(--border-width-md);
    }

    .hint {
      margin: 0;
      align-self: flex-end;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .error {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--color-danger);
    }
  `,
})
export class TextareaFieldComponent implements ControlValueAccessor {
  private readonly idGenerator = inject(IdGeneratorService);
  readonly id = this.idGenerator.next('app-textarea-field');

  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly maxLength = input<number | null>(null);

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
