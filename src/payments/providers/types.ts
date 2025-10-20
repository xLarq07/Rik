export type ProviderKey = 'iyzico' | 'stripe' | 'papara';

export interface CheckoutRequest {
  amount: number;
  currency: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSession {
  id: string;
  provider: ProviderKey;
  redirectUrl: string;
  expiresAt: Date;
  rawResponse?: unknown;
}

export interface PaymentEvent {
  id: string;
  provider: ProviderKey;
  type: string;
  payload: unknown;
  createdAt: Date;
}

export interface PaymentProvider {
  readonly key: ProviderKey;
  readonly displayName: string;
  readonly supportedCurrencies: string[];
  createCheckoutSession(payload: CheckoutRequest): Promise<CheckoutSession>;
  verifyWebhookSignature(payload: Buffer, headers: Record<string, string | string[] | undefined>): boolean;
  parseWebhookEvent(payload: Buffer): PaymentEvent;
}

export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderConfigurationError';
  }
}

export class ProviderCheckoutError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ProviderCheckoutError';
  }
}

export class ProviderNotFoundError extends Error {
  constructor(public readonly providerKey: string) {
    super(`Unsupported payment provider: ${providerKey}`);
    this.name = 'ProviderNotFoundError';
  }
}
