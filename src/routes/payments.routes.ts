import { Router, Request, Response } from 'express';

export const paymentsRouter = Router();

// Ödeme oluşturma
paymentsRouter.post('/', (req: Request, res: Response) => {
  const { amount, currency, customerId } = req.body ?? {};

  const payment = {
    id: `pay_${Date.now()}`,
    amount,
    currency,
    customerId,
    status: 'processing',
    createdAt: new Date().toISOString()
  };

  res.status(202).json(payment);
});

// Ödeme durumu sorgulama
paymentsRouter.get('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;

  res.json({
    id,
    status: 'processing'
  });
});
