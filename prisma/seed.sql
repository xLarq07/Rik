-- Seed script for initial data and constraint reinforcement.
-- Re-apply critical NOT NULL and UNIQUE constraints to guarantee idempotent environments.

ALTER TABLE "User"
  ALTER COLUMN "email" SET NOT NULL,
  ALTER COLUMN "password" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique_idx" ON "User" ("email");

ALTER TABLE "Profile"
  ALTER COLUMN "userId" SET NOT NULL,
  ALTER COLUMN "firstName" SET NOT NULL,
  ALTER COLUMN "lastName" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "profile_user_unique_idx" ON "Profile" ("userId");

ALTER TABLE "Transaction"
  ALTER COLUMN "userId" SET NOT NULL,
  ALTER COLUMN "reference" SET NOT NULL,
  ALTER COLUMN "amount" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "transaction_reference_unique_idx" ON "Transaction" ("reference");

-- Insert deterministic seed data respecting uniqueness constraints.
INSERT INTO "User" ("id", "email", "password", "phone") VALUES
  (1, 'alice@example.com', '$2b$10$examplehashforalice', '+905551112233'),
  (2, 'bob@example.com', '$2b$10$examplehashforbob', NULL)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Profile" ("id", "userId", "firstName", "lastName", "nationalId", "birthDate", "address") VALUES
  (1, 1, 'Alice', 'Yılmaz', '11111111110', '1990-01-15', 'İstanbul, TR'),
  (2, 2, 'Bob', 'Demir', NULL, NULL, 'Ankara, TR')
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Transaction" ("id", "userId", "reference", "amount", "currency", "cardPanHash", "cardExpiry", "metadata", "status") VALUES
  (1, 1, 'TXN-20240223-0001', 1250.50, 'TRY', 'vault:token:alice-pan', '12/27', '{"note": "Initial order"}', 'COMPLETED'),
  (2, 2, 'TXN-20240223-0002', 499.99, 'TRY', NULL, NULL, '{"note": "Second order"}', 'PENDING')
ON CONFLICT ("reference") DO NOTHING;
