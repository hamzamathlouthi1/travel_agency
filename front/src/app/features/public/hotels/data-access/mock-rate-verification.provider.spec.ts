import { firstValueFrom } from 'rxjs';
import { MockRateVerificationProvider } from './mock-rate-verification.provider';

describe('MockRateVerificationProvider', () => {
  let provider: MockRateVerificationProvider;

  beforeEach(() => {
    provider = new MockRateVerificationProvider();
  });

  it('is deterministic: the same rate ID always verifies the same way', async () => {
    const first = await firstValueFrom(provider.verify('deluxe-breakfast-flex'));
    const second = await firstValueFrom(provider.verify('deluxe-breakfast-flex'));
    expect(first.status).toBe(second.status);
    expect(first.status).toBe('AVAILABLE_SAME_PRICE');
  });

  it('returns AVAILABLE_PRICE_CHANGED with both prices for the scripted price-change rate', async () => {
    const result = await firstValueFrom(provider.verify('demo-price-changed'));
    expect(result.status).toBe('AVAILABLE_PRICE_CHANGED');
    expect(result.latestPrice).toBeDefined();
    expect(result.previousPrice).toBeDefined();
    expect(result.latestPrice!.amount).not.toBe(result.previousPrice!.amount);
  });

  it('returns SOLD_OUT for the scripted sold-out rate', async () => {
    const result = await firstValueFrom(provider.verify('demo-sold-out'));
    expect(result.status).toBe('SOLD_OUT');
  });

  it('defaults to AVAILABLE_SAME_PRICE for any unscripted rate ID', async () => {
    const result = await firstValueFrom(provider.verify('some-other-rate-id'));
    expect(result.status).toBe('AVAILABLE_SAME_PRICE');
  });
});
