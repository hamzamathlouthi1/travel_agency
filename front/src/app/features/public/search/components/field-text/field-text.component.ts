import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { IdGeneratorService } from '../../../../../shared/utils/id-generator.service';

// Plain labeled text field styled to match the other search-bar fields
// (label above, value below) — used for the simpler voyage/circuit fields
// (departure city, region, duration...) that don't need a popover picker.
@Component({
  selector: 'app-field-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <label [for]="id" class="k">{{ label() }}</label>
      <input
        [id]="id"
        type="text"
        class="v"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="valueChange.emit($any($event.target).value)"
      />
    </div>
  `,
  styles: `
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: var(--space-3) var(--space-5);
      flex: 1;
      min-width: 0;
    }

    .k {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .v {
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      border: none;
      background: transparent;
      padding: 0;
      width: 100%;
    }

    .v::placeholder {
      color: var(--color-ink-300);
      font-weight: var(--font-weight-regular);
    }

    .v:focus-visible {
      outline: none;
    }

    .field:focus-within {
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }
  `,
})
export class FieldTextComponent {
  readonly id = inject(IdGeneratorService).next('app-field-text');
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly value = input('');
  readonly valueChange = output<string>();
}
