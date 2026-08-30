import { firstValueFrom } from 'rxjs';
import { MockPaymentGateway } from './mock-payment-gateway.provider';
import { PaymentRequest } from '../domain/payment-request.model';

function fakeRequest(cardNumber: string): PaymentRequest {
  return {
    bookingId: 'BKG-1',
    amount: { amount: 1000, currency: 'TND' },
    method: 'CARD',
    card: { holderName: 'Amir Ben Salah', number: cardNumber, expiry: '12/29', cvv: '123' },
  };
}

describe('MockPaymentGateway', () => {
  let gateway: MockPaymentGateway;

  beforeEach(() => {
    gateway = new MockPaymentGateway();
  });

  it('is deterministic: an ordinary card number always succeeds', async () => {
    const first = await firstValueFrom(gateway.charge(fakeRequest('4242424242424242')));
    const second = await firstValueFrom(gateway.charge(fakeRequest('4242424242424242')));
    expect(first.status).toBe('SUCCESS');
    expect(second.status).toBe('SUCCESS');
  });

  it('returns a gatewayReference on success and no declineReason', async () => {
    const result = await firstValueFrom(gateway.charge(fakeRequest('4242424242424242')));
    expect(result.gatewayReference).toBeTruthy();
    expect(result.declineReason).toBeNull();
  });

  it('deterministically declines the scripted decline card number', async () => {
    const result = await firstValueFrom(gateway.charge(fakeRequest('4000000000000002')));
    expect(result.status).toBe('DECLINED');
    expect(result.gatewayReference).toBeNull();
    expect(result.declineReason).toBeTruthy();
  });

  it('deterministically fails technically for the scripted technical-error card number', async () => {
    const result = await firstValueFrom(gateway.charge(fakeRequest('4000000000000119')));
    expect(result.status).toBe('TECHNICAL_ERROR');
    expect(result.gatewayReference).toBeNull();
    expect(result.declineReason).toBeNull();
  });

  it('tolerates spaces in the card number when matching scripted outcomes', async () => {
    const result = await firstValueFrom(gateway.charge(fakeRequest('4000 0000 0000 0002')));
    expect(result.status).toBe('DECLINED');
  });

  it('never echoes the card number back on the result', async () => {
    const result = await firstValueFrom(gateway.charge(fakeRequest('4242424242424242')));
    expect(JSON.stringify(result)).not.toContain('4242');
  });
});
