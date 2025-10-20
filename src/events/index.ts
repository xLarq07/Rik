import { EventBus, EventPayload } from './EventBus';

export const eventBus = new EventBus();

export const USER_CREATED = 'user.created';
export const PAYMENT_REQUESTED = 'payment.requested';

type UserCreatedPayload = {
  id: string;
  email: string;
};

type PaymentRequestedPayload = {
  id: string;
  amount: number;
  currency: string;
};

// Kullanıcı oluşturma olayını dinleyen örnek abonelik
export const registerUserCreatedListener = () =>
  eventBus.subscribe<UserCreatedPayload>(USER_CREATED, async (event: EventPayload<UserCreatedPayload>) => {
    // Burada audit log, e-posta tetikleme vb. işlemleri gerçekleştirebilirsiniz.
    console.log('User created event received', event.payload);
  });

// Ödeme talebi olayını yayınlayan örnek fonksiyon
export const publishPaymentRequested = (payload: PaymentRequestedPayload) => {
  eventBus.publish<PaymentRequestedPayload>({
    type: PAYMENT_REQUESTED,
    payload,
    metadata: { publishedAt: new Date().toISOString() }
  });
};

// Basit kullanım senaryosu
export const demoEventFlow = () => {
  const unsubscribe = registerUserCreatedListener();

  eventBus.publish<UserCreatedPayload>({
    type: USER_CREATED,
    payload: { id: 'usr_demo', email: 'demo@rik.dev' },
    metadata: { publishedAt: new Date().toISOString() }
  });

  publishPaymentRequested({ id: 'pay_demo', amount: 125.0, currency: 'TRY' });

  unsubscribe();
};
