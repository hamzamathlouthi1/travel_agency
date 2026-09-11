import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { PaymentGateway } from './payment-gateway.provider';
import { PaymentRequest } from '../domain/payment-request.model';
import { PaymentResult } from '../domain/payment-result.model';

const SIMULATED_LATENCY_MS = 1200;

// Dev/test-only scripted card numbers — same convention as
// "demo-price-changed"/"demo-sold-out" and the declined-booking-email
// trigger: deterministic, never randomness, never a switch exposed in
// customer-facing UI. The card number is read once to pick the outcome and
// is never stored on the returned PaymentResult or anywhere else.
const DECLINED_CARD_NUMBER = '4000000000000002';
const TECHNICAL_ERROR_CARD_NUMBER = '4000000000000119';

@Injectable({ providedIn: 'root' })
export class MockPaymentGateway implements PaymentGateway {
  private sequence = 0;

  charge(request: PaymentRequest): Observable<PaymentResult> {
    const cardNumber = request.card.number.replace(/\s+/g, '');

    if (cardNumber === DECLINED_CARD_NUMBER) {
      return of<PaymentResult>({
        status: 'DECLINED',
        gatewayReference: null,
        declineReason: 'Your card issuer declined this payment.',
      }).pipe(delay(SIMULATED_LATENCY_MS));
    }

    if (cardNumber === TECHNICAL_ERROR_CARD_NUMBER) {
      return of<PaymentResult>({ status: 'TECHNICAL_ERROR', gatewayReference: null, declineReason: null }).pipe(
        delay(SIMULATED_LATENCY_MS),
      );
    }

    this.sequence += 1;
    return of<PaymentResult>({
      status: 'SUCCESS',
      gatewayReference: `PAY-${Date.now().toString(36).toUpperCase()}-${this.sequence}`,
      declineReason: null,
    }).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
