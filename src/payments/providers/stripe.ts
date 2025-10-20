import crypto from 'node:crypto';
import {
  CheckoutRequest,
  CheckoutSession,
  PaymentEvent,
  PaymentProvider,
  ProviderCheckoutError,
  ProviderConfigurationError,
} from './types.js';

type StripeConfig = {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  checkoutBaseUrl: string;
  sessionTtlMs: number;
};

const defaultConfig: StripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY ?? 'sk_test_1234567890',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? 'pk_test_1234567890',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_1234567890',
  checkoutBaseUrl: 'https://dashboard.stripe.com/test/checkout/sessions',
  sessionTtlMs: 24 * 60 * 60 * 1000,
};

export class StripeProvider implements PaymentProvider {
  public readonly key = 'stripe' as const;
  public readonly displayName = 'Stripe';
  public readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'TRY'];

  constructor(private readonly config: StripeConfig = defaultConfig) {
    if (!config.secretKey || !config.publishableKey) {
      throw new ProviderConfigurationError(
        'Stripe provider requires STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY.',
      );
    }
  }

  async createCheckoutSession(payload: CheckoutRequest): Promise<CheckoutSession> {
    if (payload.amount <= 0) {
      throw new ProviderCheckoutError('Stripe checkout requires a positive amount.');
    }

    try {
      const sessionId = `cs_test_${crypto.randomUUID()}`;
      return {
        id: sessionId,
        provider: this.key,
        redirectUrl: `${this.config.checkoutBaseUrl}/${sessionId}`,
        expiresAt: new Date(Date.now() + this.config.sessionTtlMs),
        rawResponse: {
          status: 'open',
          amount_total: payload.amount,
          currency: payload.currency.toLowerCase(),
        },
      } satisfies CheckoutSession;
    } catch (error) {
      throw new ProviderCheckoutError('Failed to create Stripe checkout session.', error);
    }
  }

  verifyWebhookSignature(payload: Buffer, headers: Record<string, string | string[] | undefined>): boolean {
    const signatureHeader = headers['stripe-signature'];
    if (typeof signatureHeader !== 'string' || !this.config.webhookSecret) {
      return false;
    }

    const expected = Buffer.from(
      crypto.createHmac('sha256', this.config.webhookSecret).update(payload).digest('hex'),
    );
    const provided = Buffer.from(signatureHeader);

    if (expected.length !== provided.length) {
      return false;
    }

    return crypto.timingSafeEqual(provided, expected);
  }

  parseWebhookEvent(payload: Buffer): PaymentEvent {
    try {
      const body = JSON.parse(payload.toString());
      return {
        id: body.id ?? `evt_${crypto.randomUUID()}`,
        provider: this.key,
        type: body.type ?? 'unknown',
        payload: body,
        createdAt: new Date(),
      } satisfies PaymentEvent;
    } catch (error) {
      throw new ProviderCheckoutError('Unable to parse Stripe webhook payload.', error);
    }
  }
}

export function createStripeProvider(config?: Partial<StripeConfig>): StripeProvider {
  return new StripeProvider({ ...defaultConfig, ...config });
}
