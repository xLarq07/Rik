import crypto from 'node:crypto';
import {
  CheckoutRequest,
  CheckoutSession,
  PaymentEvent,
  PaymentProvider,
  ProviderCheckoutError,
  ProviderConfigurationError,
} from './types.js';

type PaparaConfig = {
  merchantId?: string;
  apiKey?: string;
  webhookSecret?: string;
  checkoutBaseUrl: string;
  sessionTtlMs: number;
};

const defaultConfig: PaparaConfig = {
  merchantId: process.env.PAPARA_MERCHANT_ID ?? 'sandbox-merchant-id',
  apiKey: process.env.PAPARA_API_KEY ?? 'sandbox-papara-api-key',
  webhookSecret: process.env.PAPARA_WEBHOOK_SECRET ?? 'sandbox-papara-webhook-secret',
  checkoutBaseUrl: 'https://merchant.test.papara.com/checkout',
  sessionTtlMs: 15 * 60 * 1000,
};

export class PaparaProvider implements PaymentProvider {
  public readonly key = 'papara' as const;
  public readonly displayName = 'Papara';
  public readonly supportedCurrencies = ['TRY'];

  constructor(private readonly config: PaparaConfig = defaultConfig) {
    if (!config.merchantId || !config.apiKey) {
      throw new ProviderConfigurationError(
        'Papara provider requires PAPARA_MERCHANT_ID and PAPARA_API_KEY.',
      );
    }
  }

  async createCheckoutSession(payload: CheckoutRequest): Promise<CheckoutSession> {
    if (payload.currency !== 'TRY') {
      throw new ProviderCheckoutError('Papara only supports TRY currency.');
    }

    try {
      const sessionId = `papara_${crypto.randomUUID()}`;
      return {
        id: sessionId,
        provider: this.key,
        redirectUrl: `${this.config.checkoutBaseUrl}/${sessionId}`,
        expiresAt: new Date(Date.now() + this.config.sessionTtlMs),
        rawResponse: {
          status: 'created',
          amount: payload.amount,
          currency: payload.currency,
        },
      } satisfies CheckoutSession;
    } catch (error) {
      throw new ProviderCheckoutError('Failed to create Papara checkout session.', error);
    }
  }

  verifyWebhookSignature(payload: Buffer, headers: Record<string, string | string[] | undefined>): boolean {
    const signatureHeader = headers['x-papara-signature'];
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
        id: body.transactionId ?? `papara_evt_${crypto.randomUUID()}`,
        provider: this.key,
        type: body.status ?? 'unknown',
        payload: body,
        createdAt: new Date(),
      } satisfies PaymentEvent;
    } catch (error) {
      throw new ProviderCheckoutError('Unable to parse Papara webhook payload.', error);
    }
  }
}

export function createPaparaProvider(config?: Partial<PaparaConfig>): PaparaProvider {
  return new PaparaProvider({ ...defaultConfig, ...config });
}
