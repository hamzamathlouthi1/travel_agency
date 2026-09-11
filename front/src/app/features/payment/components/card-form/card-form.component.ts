import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextFieldComponent } from '../../../../shared/ui/text-field/text-field.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CardDetails } from '../../domain/card-details.model';

const CARD_NUMBER_PATTERN = /^[\d ]{13,23}$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVV_PATTERN = /^\d{3,4}$/;

// Card field values live only in this component's own FormGroup — never
// passed up as a signal a store retains, never written to storage. `pay`
// emits a plain CardDetails object exactly once per submit; the form is
// reset (including the card fields) as soon as that emit happens, whether
// the charge goes on to succeed or fail, so a stale card number never
// lingers in memory longer than one attempt.
@Component({
  selector: 'app-card-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TextFieldComponent, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" aria-label="Card payment details">
      <app-text-field
        label="Cardholder name"
        required
        autocomplete="cc-name"
        formControlName="holderName"
      />
      <app-text-field
        label="Card number"
        required
        autocomplete="cc-number"
        placeholder="1234 5678 9012 3456"
        formControlName="number"
      />
      <div class="row">
        <app-text-field label="Expiry (MM/YY)" required autocomplete="cc-exp" placeholder="MM/YY" formControlName="expiry" />
        <app-text-field label="CVV" required autocomplete="cc-csc" placeholder="123" formControlName="cvv" />
      </div>

      <app-button type="submit" variant="primary" size="lg" fullWidth [disabled]="disabled()" [loading]="disabled()">
        {{ payLabel() }}
      </app-button>
    </form>
  `,
  styles: `
    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    @media (max-width: 479px) {
      .row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class CardFormComponent {
  readonly disabled = input(false);
  readonly payLabel = input('Pay now');

  readonly pay = output<CardDetails>();

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    holderName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    number: this.fb.control('', [Validators.required, Validators.pattern(CARD_NUMBER_PATTERN)]),
    expiry: this.fb.control('', [Validators.required, Validators.pattern(EXPIRY_PATTERN)]),
    cvv: this.fb.control('', [Validators.required, Validators.pattern(CVV_PATTERN)]),
  });

  protected onSubmit(): void {
    if (this.disabled() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.pay.emit(value);
    this.form.reset({ holderName: '', number: '', expiry: '', cvv: '' });
  }
}
