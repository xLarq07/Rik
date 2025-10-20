# API Sözleşmeleri

Bu doküman, kullanıcı ve ödeme servislerinin sağladığı REST API uç noktalarının OpenAPI 3.1 taslağını içerir.

```yaml
openapi: 3.1.0
info:
  title: Rik Platform API
  version: 0.1.0
  description: >-
    Kullanıcı yönetimi ve ödeme işlevleri için temel uç noktalar. Bu taslak, geliştirme sırasında
    doğrulama ve müşteri ekipleri ile paylaşılacak tek kaynak olarak kullanılmalıdır.
servers:
  - url: https://api.rik.local/v1
    description: Lokal geliştirici ortamı
paths:
  /users:
    get:
      summary: Kullanıcı listesini getirir
      tags: [Users]
      responses:
        '200':
          description: Başarılı yanıt
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Yeni bir kullanıcı oluşturur
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreateRequest'
      responses:
        '201':
          description: Kullanıcı oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  /users/{id}:
    get:
      summary: Kullanıcı detayını getirir
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Kullanıcı bulundu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: Kullanıcı bulunamadı
  /payments:
    post:
      summary: Yeni bir ödeme talebi oluşturur
      tags: [Payments]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PaymentCreateRequest'
      responses:
        '202':
          description: Ödeme isteği kabul edildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'
  /payments/{id}/status:
    get:
      summary: Ödeme durumunu getirir
      tags: [Payments]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Ödeme durumu
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  status:
                    type: string
components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
        email:
          type: string
          format: email
        fullName:
          type: string
        createdAt:
          type: string
          format: date-time
    UserCreateRequest:
      type: object
      required: [email, fullName]
      properties:
        email:
          type: string
          format: email
        fullName:
          type: string
    Payment:
      type: object
      required: [id, amount, currency, status]
      properties:
        id:
          type: string
        amount:
          type: number
          format: float
        currency:
          type: string
        status:
          type: string
        createdAt:
          type: string
          format: date-time
    PaymentCreateRequest:
      type: object
      required: [amount, currency, customerId]
      properties:
        amount:
          type: number
          format: float
        currency:
          type: string
          enum: [TRY, USD, EUR]
        customerId:
          type: string
```
