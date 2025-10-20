import crypto from 'node:crypto';
import {
  CheckoutRequest,
  CheckoutSession,
  PaymentEvent,
  PaymentProvider,
  ProviderCheckoutError,
  ProviderConfigurationError,
} from './types.js';

type IyzicoConfig = {
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  checkoutBaseUrl: string;
  sessionTtlMs: number;
};

const defaultConfig: IyzicoConfig = {
  apiKey: process.env.IYZICO_API_KEY ?? 'sandbox-iyzico-api-key',
  secretKey: process.env.IYZICO_SECRET_KEY ?? 'sandbox-iyzico-secret-key',
  webhookSecret: process.env.IYZICO_WEBHOOK_SECRET ?? 'sandbox-iyzico-webhook-secret',
  checkoutBaseUrl: 'https://sandbox-iyzico-payments.example/checkout',
  sessionTtlMs: 10 * 60 * 1000,
};

export class IyzicoProvider implements PaymentProvider {
  public readonly key = 'iyzico' as const;
  public readonly displayName = 'Iyzico';
  public readonly supportedCurrencies = ['TRY', 'USD', 'EUR'];

  constructor(private readonly config: IyzicoConfig = defaultConfig) {
    if (!config.apiKey || !config.secretKey) {
      throw new ProviderConfigurationError(
        'Iyzico provider requires both IYZICO_API_KEY and IYZICO_SECRET_KEY.',
      );
    }
  }

  async createCheckoutSession(payload: CheckoutRequest): Promise<CheckoutSession> {
    if (!this.supportedCurrencies.includes(payload.currency)) {
      throw new ProviderCheckoutError(
        `Iyzico does not support currency ${payload.currency}.`,
      );
    }

    try {
      const sessionId = `iyz_${crypto.randomUUID()}`;
      return {
        id: sessionId,
        provider: this.key,
        redirectUrl: `${this.config.checkoutBaseUrl}/${sessionId}`,
        expiresAt: new Date(Date.now() + this.config.sessionTtlMs),
        rawResponse: {
          status: 'success',
          locale: 'tr',
          price: payload.amount,
        },
      } satisfies CheckoutSession;
    } catch (error) {
      throw new ProviderCheckoutError('Failed to create Iyzico checkout session.', error);
    }
  }

  verifyWebhookSignature(payload: Buffer, headers: Record<string, string | string[] | undefined>): boolean {
    const signatureHeader = headers['x-iyz-signature'];
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
        id: body.eventId ?? `iyz_evt_${crypto.randomUUID()}`,
        provider: this.key,
        type: body.eventType ?? 'unknown',
        payload: body,
        createdAt: new Date(),
      } satisfies PaymentEvent;
    } catch (error) {
      throw new ProviderCheckoutError('Unable to parse Iyzico webhook payload.', error);
    }
  }
}

export function createIyzicoProvider(config?: Partial<IyzicoConfig>): IyzicoProvider {
  return new IyzicoProvider({ ...defaultConfig, ...config });
}
