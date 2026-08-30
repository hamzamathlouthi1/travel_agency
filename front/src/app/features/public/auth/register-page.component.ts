import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Civilite } from '../../../core/auth/models/auth.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SelectFieldComponent, SelectOption } from '../../../shared/ui/select-field/select-field.component';
import { TextFieldComponent } from '../../../shared/ui/text-field/text-field.component';

const CIVILITE_OPTIONS: readonly SelectOption[] = [
  { value: 'MR', label: 'Mr' },
  { value: 'MME', label: 'Mrs' },
  { value: 'MLLE', label: 'Miss' },
];

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TextFieldComponent, SelectFieldComponent, ButtonComponent],
  template: `
    <section class="auth-shell">
      <div class="card">
        <p class="eyebrow">Create account</p>
        <h1>Register</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <app-select-field label="Title" [options]="civiliteOptions" required formControlName="civilite" />
          <div class="two-columns">
            <app-text-field label="First name" required autocomplete="given-name" formControlName="prenom" />
            <app-text-field label="Last name" required autocomplete="family-name" formControlName="nom" />
          </div>
          <app-text-field label="Email" type="email" required autocomplete="email" formControlName="email" />
          <app-text-field label="Mobile" type="tel" required autocomplete="tel" formControlName="mobile" />
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

        <p class="meta">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .auth-shell {
      min-height: 70vh;
      display: grid;
      place-items: center;
      padding: var(--space-8) var(--space-4);
    }

    .card {
      width: min(100%, 620px);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: var(--space-8);
    }

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
  `,
})
export class RegisterPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly civiliteOptions = CIVILITE_OPTIONS;

  protected readonly form = this.fb.group({
    civilite: this.fb.control<Civilite>('MR', { validators: [Validators.required] }),
    prenom: this.fb.control('', { validators: [Validators.required] }),
    nom: this.fb.control('', { validators: [Validators.required] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    mobile: this.fb.control('', { validators: [Validators.required] }),
    password: this.fb.control('', { validators: [Validators.required, Validators.minLength(6)] }),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    this.auth
      .register({
        civilite: this.form.value.civilite ?? 'MR',
        prenom: this.form.value.prenom ?? '',
        nom: this.form.value.nom ?? '',
        email: this.form.value.email ?? '',
        mobile: this.form.value.mobile ?? '',
        password: this.form.value.password ?? '',
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (error) => {
          this.submitting.set(false);
          this.submitError.set(error?.error?.message ?? 'Unable to create your account right now.');
        },
        complete: () => this.submitting.set(false),
      });
  }
}
