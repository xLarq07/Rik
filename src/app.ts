import express, { type NextFunction, type Request, type Response } from 'express';
import {
  assertPaymentProvider,
  ProviderCheckoutError,
  ProviderConfigurationError,
  ProviderNotFoundError,
} from './payments/providers/index.js';

interface CheckoutEndpointPayload {
  provider: string;
  amount: number;
  currency: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseCheckoutBody(body: unknown): CheckoutEndpointPayload {
  if (!isRecord(body)) {
    throw new Error('Request body must be an object.');
  }

  const { provider, amount, currency, customerId, description, metadata } = body;

  if (typeof provider !== 'string' || provider.trim().length === 0) {
    throw new Error('`provider` must be a non-empty string.');
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    throw new Error('`amount` must be a positive number.');
  }

  if (typeof currency !== 'string' || currency.trim().length === 0) {
    throw new Error('`currency` must be a non-empty string.');
  }

  if (typeof customerId !== 'string' || customerId.trim().length === 0) {
    throw new Error('`customerId` must be a non-empty string.');
  }

  if (metadata !== undefined && !isRecord(metadata)) {
    throw new Error('`metadata` must be an object when provided.');
  }

  if (description !== undefined && typeof description !== 'string') {
    throw new Error('`description` must be a string when provided.');
  }

  return {
    provider: provider.trim(),
    amount,
    currency: currency.trim().toUpperCase(),
    customerId: customerId.trim(),
    description,
    metadata,
  } satisfies CheckoutEndpointPayload;
}

export const app = express();

app.use(express.json());

app.post('/api/payments/checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = parseCheckoutBody(req.body);
    const provider = assertPaymentProvider(body.provider);

    const session = await provider.createCheckoutSession({
      amount: body.amount,
      currency: body.currency,
      customerId: body.customerId,
      description: body.description,
      metadata: body.metadata,
    });

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ProviderNotFoundError) {
    res.status(400).json({ error: error.message, provider: error.providerKey });
    return;
  }

  if (error instanceof ProviderCheckoutError) {
    res.status(502).json({ error: error.message });
    return;
  }

  if (error instanceof ProviderConfigurationError) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: 'Unknown error' });
});
