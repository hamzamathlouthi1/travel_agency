import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TravellerDetailsStore } from '../../state/traveller-details.store';
import { TravellerDetailsSkeletonComponent } from '../../components/traveller-details-skeleton/traveller-details-skeleton.component';
import { TravellerDetailsErrorComponent } from '../../components/traveller-details-error/traveller-details-error.component';
import { InvalidSelectionComponent } from '../../components/invalid-selection/invalid-selection.component';
import { TripSummaryCardComponent } from '../../components/trip-summary-card/trip-summary-card.component';
import { TextFieldComponent } from '../../../../shared/ui/text-field/text-field.component';
import { SelectFieldComponent, SelectOption } from '../../../../shared/ui/select-field/select-field.component';
import { TextareaFieldComponent } from '../../../../shared/ui/textarea-field/textarea-field.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TRAVELLER_TITLE_LABEL, Traveller, TravellerTitle, TravellerType } from '../../domain/traveller.model';
import { BookingRequest } from '../../domain/booking-request.model';

const TITLE_OPTIONS: readonly SelectOption[] = Object.entries(TRAVELLER_TITLE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const PHONE_PATTERN = /^[+0-9 ()-]{6,20}$/;

type TravellerFormGroup = FormGroup<{
  type: FormControl<TravellerType>;
  title: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  dateOfBirth: FormControl<string>;
}>;

// Orchestrates only: reads TravellerDetailsStore for the hotel/room/rate to
// display and the selection to submit against, owns the traveller-details
// form itself (no existing Reactive Forms convention to extend — see
// text-field/select-field/textarea-field), and hands the typed payload to
// the store on submit. All fetch/submit business logic lives in the store.
@Component({
  selector: 'app-traveller-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TravellerDetailsStore],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TravellerDetailsSkeletonComponent,
    TravellerDetailsErrorComponent,
    InvalidSelectionComponent,
    TripSummaryCardComponent,
    TextFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    ButtonComponent,
  ],
  template: `
    <div class="container page">
      @if (store.fetchError()) {
        <app-traveller-details-error (retry)="store.retry()" />
      } @else if (store.loading()) {
        <app-traveller-details-skeleton />
      } @else if (store.invalidSelection()) {
        <app-invalid-selection reason="MALFORMED" />
      } @else if (store.staleSelection()) {
        <app-invalid-selection reason="STALE" />
      } @else {
        @let hotel = store.hotel()!;
        @let room = store.selectedRoom()!;
        @let rate = store.selectedRate()!;
        @let selection = store.selection()!;

        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Home</a> / <a routerLink="/hotels">Hotels</a> /
          <span aria-current="page">Traveller details</span>
        </nav>

        <h1 class="heading">Who's travelling?</h1>

        <div class="layout">
          <form class="main" [formGroup]="form" (ngSubmit)="onSubmit()">
            <fieldset class="section" formGroupName="lead">
              <legend class="section-title">Lead traveller</legend>
              <p class="section-hint">Contact details for booking confirmation and updates.</p>
              <div class="grid grid-title-name">
                <app-select-field label="Title" [options]="titleOptions" required formControlName="title" />
                <app-text-field label="First name" required autocomplete="given-name" formControlName="firstName" />
                <app-text-field label="Last name" required autocomplete="family-name" formControlName="lastName" />
              </div>
              <div class="grid grid-contact">
                <app-text-field
                  label="Email"
                  type="email"
                  required
                  autocomplete="email"
                  formControlName="email"
                />
                <app-text-field label="Phone" type="tel" required autocomplete="tel" formControlName="phone" />
              </div>
            </fieldset>

            @if (travellersArray.length > 0) {
              <fieldset class="section" formArrayName="travellers">
                <legend class="section-title">Other travellers</legend>
                @for (group of travellersArray.controls; track $index) {
                  @let isChild = group.get('type')!.value === 'CHILD';
                  <div class="traveller-row" [formGroupName]="$index">
                    <div class="traveller-row-label">
                      {{ isChild ? 'Child' : 'Adult' }} {{ $index + 2 }}
                    </div>
                    <div class="grid" [class.grid-title-name]="!isChild" [class.grid-child]="isChild">
                      @if (!isChild) {
                        <app-select-field label="Title" [options]="titleOptions" required formControlName="title" />
                      }
                      <app-text-field label="First name" required formControlName="firstName" />
                      <app-text-field label="Last name" required formControlName="lastName" />
                      @if (isChild) {
                        <app-text-field
                          label="Date of birth"
                          type="date"
                          required
                          [max]="selection.checkIn"
                          formControlName="dateOfBirth"
                        />
                      }
                    </div>
                  </div>
                }
              </fieldset>
            }

            <fieldset class="section">
              <legend class="section-title">Special requests</legend>
              <p class="section-hint">Optional — the property will try to accommodate but can't guarantee it.</p>
              <app-textarea-field
                label="Anything we should pass along?"
                placeholder="e.g. late check-in, high floor, adjoining rooms"
                [maxLength]="500"
                formControlName="specialRequests"
              />
            </fieldset>

            <label class="terms">
              <input type="checkbox" formControlName="termsAccepted" />
              <span
                >I agree to the
                <a routerLink="/terms">terms &amp; conditions</a> and the property's cancellation policy.</span
              >
            </label>
            @if (showTermsError()) {
              <p class="error" role="alert">You must accept the terms to continue.</p>
            }

            @if (store.submitError()) {
              <p class="error submit-error" role="alert">
                We couldn't confirm your booking. Please try again.
              </p>
            }

            <div class="submit-row">
              <app-button type="submit" variant="primary" size="lg" [loading]="store.submitting()">
                Continue to review
              </app-button>
            </div>
          </form>

          <app-trip-summary-card
            [hotel]="hotel"
            [room]="room"
            [rate]="rate"
            [checkIn]="selection.checkIn"
            [checkOut]="selection.checkOut"
            [occupancyLabel]="occupancyLabel()"
          />
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      padding-block: var(--space-5) var(--space-16);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .breadcrumb {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .breadcrumb a {
      color: var(--color-text-muted);
    }

    .heading {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      margin: 0;
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .main {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
      min-width: 0;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin: 0;
    }

    .section-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-extrabold);
      padding: 0;
    }

    .section-hint {
      margin: calc(var(--space-2) * -1) 0 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .traveller-row {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding-block-start: var(--space-4);
      border-block-start: 1px solid var(--color-surface-subtle);
    }

    .traveller-row:first-of-type {
      padding-block-start: 0;
      border-block-start: none;
    }

    .traveller-row-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-muted);
    }

    .terms {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .terms input {
      margin-block-start: 3px;
    }

    .error {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--color-danger);
    }

    .submit-error {
      font-size: var(--font-size-sm);
    }

    .submit-row {
      display: flex;
    }

    @media (min-width: 640px) {
      .grid-title-name {
        grid-template-columns: 120px 1fr 1fr;
      }

      .grid-contact {
        grid-template-columns: 1fr 1fr;
      }

      .grid-child {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    @media (min-width: 1024px) {
      .layout {
        grid-template-columns: 1fr 360px;
      }
    }
  `,
})
export class TravellerDetailsPageComponent {
  protected readonly store = inject(TravellerDetailsStore);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly titleOptions = TITLE_OPTIONS;

  protected readonly form = this.fb.group({
    lead: this.fb.group({
      title: this.fb.control<string>('', [Validators.required]),
      firstName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
      lastName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      phone: this.fb.control('', [Validators.required, Validators.pattern(PHONE_PATTERN)]),
    }),
    travellers: this.fb.array<TravellerFormGroup>([]),
    specialRequests: this.fb.control('', [Validators.maxLength(500)]),
    termsAccepted: this.fb.control(false, [Validators.requiredTrue]),
  });

  protected get travellersArray(): FormArray<TravellerFormGroup> {
    return this.form.controls.travellers;
  }

  protected readonly occupancyLabel = computed(() => {
    const selection = this.store.selection();
    if (!selection) return '';
    const adultsLabel = `${selection.adults} adult${selection.adults === 1 ? '' : 's'}`;
    return selection.children > 0
      ? `${adultsLabel}, ${selection.children} child${selection.children === 1 ? '' : 'ren'}`
      : adultsLabel;
  });

  protected showTermsError(): boolean {
    const control = this.form.controls.termsAccepted;
    return control.invalid && (control.touched || control.dirty);
  }

  private readonly syncTravellerSlots = effect(() => {
    const slots = this.store.additionalTravellerSlots();
    untracked(() => {
      if (this.travellersArray.length === slots.length) return;
      this.travellersArray.clear();
      for (const type of slots) {
        this.travellersArray.push(this.buildTravellerGroup(type));
      }
    });
  });

  private readonly updateSeo = effect(() => {
    const hotel = this.store.hotel();
    if (!hotel) return;
    this.title.setTitle(`Traveller details — ${hotel.name} — Meridian Travel`);
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  });

  private buildTravellerGroup(type: TravellerType): TravellerFormGroup {
    return this.fb.group({
      type: this.fb.control<TravellerType>(type),
      title: this.fb.control('', type === 'ADULT' ? [Validators.required] : []),
      firstName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
      lastName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
      dateOfBirth: this.fb.control('', type === 'CHILD' ? [Validators.required] : []),
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const leadTraveller: Traveller = {
      type: 'ADULT',
      title: value.lead.title as TravellerTitle,
      firstName: value.lead.firstName,
      lastName: value.lead.lastName,
      dateOfBirth: null,
    };

    const additionalTravellers: Traveller[] = value.travellers.map((t) => ({
      type: t.type,
      title: t.type === 'ADULT' ? (t.title as TravellerTitle) : null,
      firstName: t.firstName,
      lastName: t.lastName,
      dateOfBirth: t.type === 'CHILD' ? t.dateOfBirth : null,
    }));

    const payload: Omit<BookingRequest, 'selection'> = {
      leadTraveller,
      contact: { email: value.lead.email, phone: value.lead.phone },
      additionalTravellers,
      specialRequests: value.specialRequests.trim() || null,
    };

    this.store.submit(payload);
  }
}
