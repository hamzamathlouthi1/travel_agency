import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Civilite } from '../../../core/auth/models/auth.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SelectFieldComponent, SelectOption } from '../../../shared/ui/select-field/select-field.component';
import { TextFieldComponent } from '../../../shared/ui/text-field/text-field.component';
import { Subscription, interval } from 'rxjs';
import { COUNTRY_DIAL_CODES } from './country-dial-codes';

const CIVILITE_OPTIONS: readonly SelectOption[] = [
  { value: 'MR', label: 'Mr' },
  { value: 'MME', label: 'Mrs' },
  { value: 'MLLE', label: 'Miss' },
];

const COUNTRY_CODE_OPTIONS: readonly SelectOption[] = COUNTRY_DIAL_CODES.map((country) => ({
  value: country.dialCode,
  label: `${country.name} (${country.dialCode})`,
}));

// Local number only: digits, 6-14 of them. Spaces and other characters are
// stripped as the user types (see the mobileNumber valueChanges subscription
// below), so this pattern mainly guards against paste events.
const MOBILE_NUMBER_PATTERN = /^[0-9]{6,14}$/;
const CODE_PATTERN = /^[0-9]{6}$/;

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TextFieldComponent, SelectFieldComponent, ButtonComponent],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <aside class="visual-panel" aria-label="A Mediterranean coast at sunset">
          <div class="visual-copy">
            <span class="visual-kicker">Meridian Travel</span>
            <blockquote>More places. More stories. One account.</blockquote>
            <p>Save your favourites and keep every journey within easy reach.</p>
          </div>
        </aside>
        <div class="card">
          <div class="form-wrap">
        <p class="eyebrow">Create account</p>
        <h1>Register</h1>
        <p class="intro">Join Meridian and turn your travel ideas into real adventures.</p>

        @if (!verificationId()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <app-select-field label="Title" [options]="civiliteOptions" required formControlName="civilite" />
          <div class="two-columns">
            <app-text-field label="First name" required autocomplete="given-name" formControlName="prenom" />
            <app-text-field label="Last name" required autocomplete="family-name" formControlName="nom" />
          </div>
          <app-text-field label="Email" type="email" required autocomplete="email" formControlName="email" />
          <div class="phone-row">
            <app-select-field
              class="phone-country"
              label="Country"
              [options]="countryCodeOptions"
              required
              formControlName="countryCode"
            />
            <app-text-field
              class="phone-number"
              label="Mobile number"
              type="tel"
              placeholder="12345678"
              required
              autocomplete="tel-national"
              formControlName="mobileNumber"
            />
          </div>
          <app-text-field
            label="Password"
            type="password"
            required
            autocomplete="new-password"
            formControlName="password"
          />

          @if (submitError()) {
            <p class="error" role="alert">{{ submitError() }}</p>
          }

          <app-button type="submit" variant="primary" size="lg" [loading]="submitting()" fullWidth>
            Create account
          </app-button>
        </form>
        } @else {
          <form class="verification" aria-live="polite" [formGroup]="codeForm" (ngSubmit)="onVerify()" novalidate>
            <div class="email-mark">&#9993;</div>
            <h2>Check your inbox</h2>
            <p>{{ verificationMessage() }}</p>
            <app-text-field
              label="Verification code"
              type="tel"
              placeholder="123456"
              required
              autocomplete="one-time-code"
              formControlName="code"
            />

            @if (submitError()) {
              <p class="error" role="alert">{{ submitError() }}</p>
            }

            <app-button type="submit" variant="primary" size="lg" [loading]="verifying()" fullWidth>
              Verify email
            </app-button>
            <app-button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              [disabled]="resendCooldown() > 0"
              [loading]="resending()"
              (click)="onResend()"
            >
              {{ resendCooldown() > 0 ? 'Resend code (' + resendCooldown() + 's)' : 'Resend code' }}
            </app-button>
          </form>
        }

        <p class="meta">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .auth-shell {
      min-height: 76vh;
      display: grid;
      place-items: center;
      padding: clamp(var(--space-4), 4vw, var(--space-8));
      background: var(--color-surface-subtle);
    }

    .auth-layout {
      width: min(100%, 1280px);
      min-height: 760px;
      display: grid;
      grid-template-columns: minmax(360px, 0.82fr) minmax(540px, 1.18fr);
      overflow: hidden;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 28px;
      box-shadow: var(--shadow-lg);
    }

    .visual-panel {
      position: relative;
      display: flex;
      align-items: flex-end;
      min-width: 0;
      padding: clamp(28px, 4vw, 56px);
      color: #fff;
      background: linear-gradient(180deg, rgba(5, 26, 32, 0.02) 30%, rgba(5, 26, 32, 0.88) 100%),
        url('/images/auth-travel.png') center / cover no-repeat;
    }

    .visual-copy { position: relative; max-width: 420px; }
    .visual-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
    blockquote { margin: 16px 0; font-size: clamp(1.75rem, 3vw, 2.6rem); font-weight: 700; line-height: 1.12; letter-spacing: -0.03em; }
    .visual-copy p { margin: 0; color: rgba(255, 255, 255, 0.82); line-height: 1.65; }

    .intro {
      margin: calc(var(--space-6) * -0.65) 0 var(--space-6);
      color: var(--color-text-muted);
      line-height: 1.6;
    }

    .card {
      display: grid;
      place-items: center;
      padding: clamp(32px, 5vw, 68px);
    }

    .form-wrap { width: min(100%, 620px); }

    .eyebrow {
      margin: 0 0 var(--space-2);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
    }

    h1 {
      margin: 0 0 var(--space-6);
      font-size: var(--font-size-2xl);
      color: var(--color-text-primary);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .two-columns {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-4);
    }

    .phone-row {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: var(--space-4);
      align-items: start;
    }

    .error {
      margin: 0;
      color: var(--color-danger);
      font-size: var(--font-size-sm);
    }

    .meta {
      margin: var(--space-6) 0 0;
      text-align: center;
      color: var(--color-text-muted);
    }

    .meta a {
      color: var(--color-ink-950);
      font-weight: var(--font-weight-bold);
      text-decoration: none;
    }

    .verification { display: flex; flex-direction: column; gap: var(--space-4); text-align: center; }
    .verification h2, .verification p { margin: 0; }
    .email-mark {
      width: 56px; height: 56px; margin-inline: auto; display: grid; place-items: center;
      border-radius: 50%; background: var(--color-ink-950); color: white; font-size: 1.6rem; font-weight: 700;
    }

    @media (max-width: 960px) {
      .auth-layout { min-height: auto; grid-template-columns: 1fr; }
      .visual-panel { min-height: 260px; background-position: center 58%; }
      .visual-copy p { display: none; }
      blockquote { max-width: 560px; }
    }

    @media (max-width: 639px) {
      .auth-shell {
        min-height: auto;
        padding-block: var(--space-4) var(--space-8);
      }

      .card {
        padding: 30px var(--space-5) 34px;
      }

      .auth-layout { border-radius: var(--radius-xl); }
      .visual-panel { min-height: 190px; padding: var(--space-5); }
      blockquote { margin-bottom: 0; font-size: 1.55rem; }

      .two-columns {
        grid-template-columns: 1fr;
      }

      .phone-row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class RegisterPageComponent implements OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly verifying = signal(false);
  protected readonly resending = signal(false);
  protected readonly submitError = signal('');
  protected readonly civiliteOptions = CIVILITE_OPTIONS;
  protected readonly countryCodeOptions = COUNTRY_CODE_OPTIONS;
  protected readonly verificationId = signal('');
  protected readonly verificationMessage = signal('');
  protected readonly resendCooldown = signal(0);
  private cooldownSubscription?: Subscription;

  protected readonly form = this.fb.group({
    civilite: this.fb.control<Civilite>('MR', { validators: [Validators.required] }),
    prenom: this.fb.control('', { validators: [Validators.required] }),
    nom: this.fb.control('', { validators: [Validators.required] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    countryCode: this.fb.control('+216', { validators: [Validators.required] }),
    mobileNumber: this.fb.control('', {
      validators: [Validators.required, Validators.pattern(MOBILE_NUMBER_PATTERN)],
    }),
    password: this.fb.control('', { validators: [Validators.required, Validators.minLength(6)] }),
  });

  protected readonly codeForm = this.fb.group({
    code: this.fb.control('', { validators: [Validators.required, Validators.pattern(CODE_PATTERN)] }),
  });

  constructor() {
    // Strip anything that isn't a digit as the user types (or pastes) so
    // spaces, dashes, and letters never make it into the submitted number.
    this.form.controls.mobileNumber.valueChanges.subscribe((value) => {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly !== value) {
        this.form.controls.mobileNumber.setValue(digitsOnly, { emitEvent: false });
      }
    });
    this.codeForm.controls.code.valueChanges.subscribe((value) => {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      if (digitsOnly !== value) {
        this.codeForm.controls.code.setValue(digitsOnly, { emitEvent: false });
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    const mobile = `${this.form.value.countryCode ?? ''}${this.form.value.mobileNumber ?? ''}`;

    this.auth
      .register({
        civilite: this.form.value.civilite ?? 'MR',
        prenom: this.form.value.prenom ?? '',
        nom: this.form.value.nom ?? '',
        email: this.form.value.email ?? '',
        mobile,
        password: this.form.value.password ?? '',
      })
      .subscribe({
        next: (response) => {
          this.verificationId.set(response.verificationId);
          this.verificationMessage.set(response.message);
          this.startCooldown(60);
        },
        error: (error) => {
          this.submitting.set(false);
          this.submitError.set(error?.error?.message ?? 'Unable to create your account right now.');
        },
        complete: () => this.submitting.set(false),
      });
  }

  protected onVerify(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.verifying.set(true);
    this.submitError.set('');

    this.auth
      .verifyEmail({ verificationId: this.verificationId(), code: this.codeForm.value.code ?? '' })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (error) => {
          this.verifying.set(false);
          this.submitError.set(error?.error?.message ?? 'Invalid or expired code.');
        },
        complete: () => this.verifying.set(false),
      });
  }

  protected onResend(): void {
    if (this.resendCooldown() > 0) return;

    this.resending.set(true);
    this.submitError.set('');

    this.auth.resendVerification(this.verificationId()).subscribe({
      next: (response) => {
        this.verificationMessage.set(response.message);
        this.startCooldown(60);
      },
      error: (error) => {
        this.submitError.set(error?.error?.message ?? 'Unable to resend the code right now.');
      },
      complete: () => this.resending.set(false),
    });
  }

  private startCooldown(seconds: number): void {
    this.cooldownSubscription?.unsubscribe();
    this.resendCooldown.set(seconds);
    this.cooldownSubscription = interval(1000).subscribe(() => {
      const next = this.resendCooldown() - 1;
      this.resendCooldown.set(Math.max(0, next));
      if (next <= 0) this.cooldownSubscription?.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.cooldownSubscription?.unsubscribe();
  }
}
