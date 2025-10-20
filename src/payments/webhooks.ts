import { assertPaymentProvider, PaymentEvent, ProviderKey } from './providers/index.js';

export interface WebhookVerificationResult extends PaymentEvent {
  readonly verified: boolean;
  readonly signature?: string;
  readonly receivedAt: Date;
  readonly rawBody: string;
}

export class WebhookProcessingError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'WebhookProcessingError';
  }
}

const signatureHeaderLookup: Record<ProviderKey, string[]> = {
  iyzico: ['x-iyz-signature'],
  stripe: ['stripe-signature'],
  papara: ['x-papara-signature'],
};

const webhookEvents: WebhookVerificationResult[] = [];

function extractSignature(providerKey: ProviderKey, headers: Record<string, string | string[] | undefined>): string | undefined {
  for (const headerKey of signatureHeaderLookup[providerKey]) {
    const value = headers[headerKey];
    if (typeof value === 'string') {
      return value;
    }
  }

  return undefined;
}

export function verifyAndRecordWebhook(
  providerKey: ProviderKey,
  payload: Buffer,
  headers: Record<string, string | string[] | undefined>,
): WebhookVerificationResult {
  const provider = assertPaymentProvider(providerKey);

  try {
    const verified = provider.verifyWebhookSignature(payload, headers);
    const event = provider.parseWebhookEvent(payload);
    const record: WebhookVerificationResult = {
      ...event,
      verified,
      signature: extractSignature(provider.key, headers),
      receivedAt: new Date(),
      rawBody: payload.toString('utf-8'),
    };

    webhookEvents.push(record);
    return record;
  } catch (error) {
    throw new WebhookProcessingError(
      `Unable to process webhook for provider ${provider.key}.`,
      error,
    );
  }
}

export function listWebhookEvents(): readonly WebhookVerificationResult[] {
  return webhookEvents;
}

export function clearWebhookEvents(): void {
  webhookEvents.length = 0;
}
