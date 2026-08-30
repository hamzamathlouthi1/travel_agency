import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TextFieldComponent } from '../../../shared/ui/text-field/text-field.component';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TextFieldComponent, ButtonComponent],
  template: `
    <section class="auth-shell">
      <div class="card">
        <p class="eyebrow">Welcome back</p>
        <h1>Sign in</h1>

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

        <p class="meta">
          Don’t have an account?
          <a routerLink="/register">Create one</a>
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
      width: min(100%, 520px);
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
export class LoginPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');

  protected readonly form = this.fb.group({
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { validators: [Validators.required] }),
  });

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
        next: () => this.router.navigate(['/']),
        error: (error) => {
          this.submitting.set(false);
          this.submitError.set(error?.error?.message ?? 'Unable to sign in. Please check your credentials.');
        },
        complete: () => this.submitting.set(false),
      });
  }
}
