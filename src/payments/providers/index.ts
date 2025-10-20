import { createIyzicoProvider } from './iyzico.js';
import { createPaparaProvider } from './papara.js';
import { createStripeProvider } from './stripe.js';
import { PaymentProvider, ProviderKey, ProviderNotFoundError } from './types.js';

const providers: Record<ProviderKey, PaymentProvider> = {
  iyzico: createIyzicoProvider(),
  stripe: createStripeProvider(),
  papara: createPaparaProvider(),
};

export function getPaymentProvider(key: ProviderKey): PaymentProvider | undefined {
  return providers[key];
}

export function assertPaymentProvider(key: string): PaymentProvider {
  const provider = getPaymentProvider(key as ProviderKey);
  if (!provider) {
    throw new ProviderNotFoundError(key);
  }

  return provider;
}

export function listPaymentProviders(): PaymentProvider[] {
  return Object.values(providers);
}

export type { PaymentProvider, ProviderKey } from './types.js';
export * from './types.js';
