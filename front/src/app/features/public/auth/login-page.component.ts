import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TextFieldComponent } from '../../../shared/ui/text-field/text-field.component';
import { EmailVerificationRequiredError } from '../../../core/auth/models/auth.model';
import { Subscription, interval } from 'rxjs';

const CODE_PATTERN = /^[0-9]{6}$/;

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TextFieldComponent, ButtonComponent],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <aside class="visual-panel" aria-label="A Mediterranean coast at sunset">
          <div class="visual-copy">
            <span class="visual-kicker">Meridian Travel</span>
            <blockquote>“The journey begins the moment you decide to go.”</blockquote>
            <p>Handpicked stays, unforgettable places, and every detail taken care of.</p>
          </div>
        </aside>
        <div class="card">
          <div class="form-wrap">
        <p class="eyebrow">Welcome back</p>
        <h1>Sign in</h1>
        <p class="intro">Enter your details to continue planning your next escape.</p>

        @if (!verificationId()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <app-text-field
            label="Email"
            type="email"
            required
            autocomplete="email"
            formControlName="email"
          />

          <app-text-field
            label="Password"
            type="password"
            required
            autocomplete="current-password"
            formControlName="password"
          />

          @if (submitError()) {
            <p class="error" role="alert">{{ submitError() }}</p>
          }

          <app-button type="submit" variant="primary" size="lg" [loading]="submitting()" fullWidth>
            Sign in
          </app-button>
        </form>
        } @else {
          <form class="verification" aria-live="polite" [formGroup]="codeForm" (ngSubmit)="onVerify()" novalidate>
            <div class="email-mark" aria-hidden="true">&#9993;</div>
            <h2>Verify your email</h2>
            <p>Enter the code sent to <strong>{{ maskedEmail() }}</strong> to finish signing in.</p>
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
              Verify and sign in
            </app-button>
            <app-button type="button" variant="ghost" size="md" fullWidth
              [disabled]="resendCooldown() > 0" [loading]="resending()" (click)="onResend()">
              {{ resendCooldown() > 0 ? 'Resend code (' + resendCooldown() + 's)' : 'Resend code' }}
            </app-button>
            <button type="button" class="back" (click)="backToLogin()">Use another account</button>
          </form>
        }

        <p class="meta">
          Don’t have an account?
          <a routerLink="/register">Create one</a>
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
      width: min(100%, 1180px);
      min-height: 680px;
      display: grid;
      grid-template-columns: minmax(340px, 0.92fr) minmax(440px, 1.08fr);
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
      padding: clamp(32px, 6vw, 76px);
    }

    .form-wrap { width: min(100%, 460px); }

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

    .verification { text-align: center; }
    .verification h2, .verification p { margin: 0; }
    .verification p { color: var(--color-text-muted); line-height: var(--line-height-relaxed); }
    .email-mark {
      width: 56px; height: 56px; margin-inline: auto; display: grid; place-items: center;
      border-radius: 50%; background: var(--color-ink-950); color: white; font-size: 1.6rem;
    }
    .back { border: 0; background: none; color: var(--color-text-muted); text-decoration: underline; cursor: pointer; }

    @media (max-width: 880px) {
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
    }
  `,
})
export class LoginPageComponent implements OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly verificationId = signal('');
  protected readonly maskedEmail = signal('');
  protected readonly verifying = signal(false);
  protected readonly resending = signal(false);
  protected readonly resendCooldown = signal(0);
  private cooldownSubscription?: Subscription;

  protected readonly form = this.fb.group({
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { validators: [Validators.required] }),
  });

  protected readonly codeForm = this.fb.group({
    code: this.fb.control('', { validators: [Validators.required, Validators.pattern(CODE_PATTERN)] }),
  });

  constructor() {
    this.codeForm.controls.code.valueChanges.subscribe((value) => {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      if (digitsOnly !== value) this.codeForm.controls.code.setValue(digitsOnly, { emitEvent: false });
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    this.auth
      .login({
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? '',
      })
      .subscribe({
        next: (user) => this.router.navigate([user.roles.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN') ? '/admin' : '/']),
        error: (error) => {
          this.submitting.set(false);
          const pending = error?.error as EmailVerificationRequiredError | undefined;
          if (pending?.code === 'EMAIL_VERIFICATION_REQUIRED' && pending.verificationId) {
            this.verificationId.set(pending.verificationId);
            this.maskedEmail.set(pending.maskedEmail);
            this.submitError.set('');
            return;
          }
          this.submitError.set(error?.error?.message ?? 'Unable to sign in. Please check your credentials.');
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
    this.auth.verifyEmail({ verificationId: this.verificationId(), code: this.codeForm.controls.code.value }).subscribe({
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
        this.maskedEmail.set(response.maskedEmail);
        this.startCooldown(60);
      },
      error: (error) => this.submitError.set(error?.error?.message ?? 'Unable to resend the code right now.'),
      complete: () => this.resending.set(false),
    });
  }

  protected backToLogin(): void {
    this.verificationId.set('');
    this.maskedEmail.set('');
    this.codeForm.reset();
    this.submitError.set('');
    this.cooldownSubscription?.unsubscribe();
    this.resendCooldown.set(0);
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
