import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentRequest } from '../domain/payment-request.model';
import { PaymentResult } from '../domain/payment-result.model';

// Angular never talks to a real payment processor directly — this is the
// one seam. `charge` always resolves (never throws) with a terminal
// PaymentResult; a thrown/errored Observable would collapse DECLINED and
// TECHNICAL_ERROR into the same "it failed" handling, which is exactly the
// distinction PaymentStore exists to keep apart. Swap the `useClass` in
// app.config.ts for a Spring Boot-backed implementation later
// (POST API_ENDPOINTS.payments.base) — real payment success will
// eventually be backend-authoritative (Spring verifies with the actual
// gateway and Angular only ever reflects that outcome), never
// frontend-trusted the way this mock necessarily is.
export interface PaymentGateway {
  charge(request: PaymentRequest): Observable<PaymentResult>;
}

export const PAYMENT_GATEWAY = new InjectionToken<PaymentGateway>('PAYMENT_GATEWAY');
