import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

interface Step {
  readonly step: number;
  readonly label: string;
}

const STEPS: readonly Step[] = [
  { step: 1, label: 'Traveller details' },
  { step: 2, label: 'Review' },
  { step: 3, label: 'Payment' },
  { step: 4, label: 'Confirmation' },
];

// Shell for the whole hotel booking funnel (/booking, /checkout, /payment):
// a slim brand + step-progress header, no nav/footer. Deliberately lighter
// than PublicLayoutComponent — a transactional flow keeps distraction and
// exit points to a minimum, so it earns its own shell rather than reusing
// the marketing site's. Each leaf route declares `data: { step }` (1-4);
// this layout has no other knowledge of what each step contains.
@Component({
  selector: 'app-transactional-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink],
  template: `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="header">
      <div class="container bar">
        <a routerLink="/" class="brand">Meridian</a>
        <ol class="steps" aria-label="Booking progress">
          @for (s of steps; track s.step) {
            <li [class.active]="s.step === currentStep()" [class.done]="s.step < currentStep()">
              <span class="dot" aria-hidden="true"></span>
              {{ s.label }}
            </li>
          }
        </ol>
      </div>
    </header>
    <main id="main-content">
      <router-outlet />
    </main>
  `,
  styles: `
    .header {
      border-block-end: 1px solid var(--color-border);
      background: var(--color-surface);
    }

    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-3);
      padding-block: var(--space-4);
    }

    .brand {
      font-family: var(--font-family-base);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: 0.02em;
      font-size: var(--font-size-lg);
      color: var(--color-ink-950);
      text-decoration: none;
      flex-shrink: 0;
    }

    .steps {
      display: flex;
      gap: var(--space-5);
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-muted);
    }

    .steps li {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full, 999px);
      background: var(--color-border);
    }

    .steps li.done {
      color: var(--color-text-secondary);
    }

    .steps li.done .dot {
      background: var(--color-teal-600);
    }

    .steps li.active {
      color: var(--color-text-primary);
    }

    .steps li.active .dot {
      background: var(--color-ink-950);
    }
  `,
})
export class TransactionalLayoutComponent {
  protected readonly steps = STEPS;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly currentStep = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.resolveStep()),
    ),
    { initialValue: this.resolveStep() },
  );

  private resolveStep(): number {
    let snapshot = this.route.snapshot;
    while (snapshot.firstChild) snapshot = snapshot.firstChild;
    return (snapshot.data['step'] as number | undefined) ?? 1;
  }
}
