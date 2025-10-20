# Payments Proof of Concept

Bu POC, Iyzico, Stripe ve Papara sağlayıcıları için ortak bir ödeme katmanı sunar. Aşağıdaki bilgiler sandbox ortamında hızlı test yapılmasını kolaylaştırmak için eklenmiştir.

## Sandbox ortam değişkenleri

| Sağlayıcı | Değişken | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| Iyzico | `IYZICO_API_KEY` | `sandbox-iyzico-api-key` | API erişimi için anahtar |
| Iyzico | `IYZICO_SECRET_KEY` | `sandbox-iyzico-secret-key` | İmzalama anahtarı |
| Iyzico | `IYZICO_WEBHOOK_SECRET` | `sandbox-iyzico-webhook-secret` | Webhook doğrulama anahtarı |
| Stripe | `STRIPE_SECRET_KEY` | `sk_test_1234567890` | Test gizli anahtar |
| Stripe | `STRIPE_PUBLISHABLE_KEY` | `pk_test_1234567890` | Test yayınlanabilir anahtar |
| Stripe | `STRIPE_WEBHOOK_SECRET` | `whsec_1234567890` | Webhook doğrulama anahtarı |
| Papara | `PAPARA_MERCHANT_ID` | `sandbox-merchant-id` | Ticari hesap numarası |
| Papara | `PAPARA_API_KEY` | `sandbox-papara-api-key` | API erişimi için anahtar |
| Papara | `PAPARA_WEBHOOK_SECRET` | `sandbox-papara-webhook-secret` | Webhook doğrulama anahtarı |

> Varsayılan değerler repository içinde test amaçlı sağlanmıştır. Gerçek entegrasyonda ilgili sağlayıcının verdiği sandbox bilgilerini kullanın.

## Test kartları ve hesapları

### Stripe
- Kart numarası: `4242 4242 4242 4242`
- Son kullanma tarihi: herhangi bir gelecekteki tarih (örn. `12/34`)
- CVC: `123`

### Iyzico
- Kart numarası: `5890 3440 0000 0016`
- Son kullanma tarihi: `12/30`
- CVC: `123`

### Papara
Papara sanal POS testlerinde kart yerine cüzdan hesabı kullanılır:
- Hesap numarası: `12345678`
- Doğrulama kodu (OTP): `000000`

## Uygulamayı çalıştırma

```bash
npm install
npm run build
npm start
```

`POST /api/payments/checkout` isteği için örnek gövde:

```json
{
  "provider": "stripe",
  "amount": 1999,
  "currency": "TRY",
  "customerId": "cust_001",
  "description": "Premium üyelik"
}
```
