import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PaymentResult } from '../../domain/payment-result.model';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

type Phase = 'idle' | 'processing' | 'declined' | 'technical-error';

// Keeps DECLINED and TECHNICAL_ERROR visibly distinct (see
// payment-status.model.ts) — a decline says the card was refused; a
// technical error says our side failed to complete the attempt. Both are
// announced via aria-live, never color-only.
@Component({
  selector: 'app-payment-result-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent, ButtonComponent],
  template: `
    <div aria-live="polite">
      @switch (phase()) {
        @case ('processing') {
          <div class="state processing" role="status">
            <app-spinner size="sm" />
            <span>Processing your payment&hellip; please don't close this page.</span>
          </div>
        }
        @case ('declined') {
          <div class="state declined" role="alert">
            <div class="state-title">Payment declined</div>
            <p class="hint">{{ result()!.declineReason ?? 'Your card issuer declined this payment.' }}</p>
            <p class="hint">No charge was made.</p>
            <app-button variant="secondary" (click)="retry.emit()">Try a different card</app-button>
          </div>
        }
        @case ('technical-error') {
          <div class="state error" role="alert">
            <div class="state-title">We couldn't process your payment right now</div>
            <p class="hint">This wasn't a decline from your bank — something failed on our side. No charge was made.</p>
            <app-button variant="destructive" (click)="retry.emit()">Try again</app-button>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .state {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      margin-block-end: var(--space-4);
    }

    .state.processing {
      flex-direction: row;
      align-items: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .state-title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-sm);
      color: var(--color-danger);
    }

    .hint {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
  `,
})
export class PaymentResultPanelComponent {
  readonly processing = input(false);
  readonly result = input<PaymentResult | null>(null);

  readonly retry = output<void>();

  protected readonly phase = computed<Phase>(() => {
    if (this.processing()) return 'processing';
    switch (this.result()?.status) {
      case 'DECLINED':
        return 'declined';
      case 'TECHNICAL_ERROR':
        return 'technical-error';
      default:
        return 'idle';
    }
  });
}
