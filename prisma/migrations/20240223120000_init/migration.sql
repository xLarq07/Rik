-- Initial migration for user, profile, and transaction tables.
-- PCI/KVKK sensitive columns are explicitly commented for encryption or vault handling.

CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "user_email_unique" UNIQUE ("email")
);

COMMENT ON COLUMN "User"."password" IS 'KVKK: store only hashed values.';
COMMENT ON COLUMN "User"."phone" IS 'KVKK: encrypt column or offload to secure vault.';

CREATE TABLE "Profile" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalId" TEXT,
    "birthDate" DATE,
    "address" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "profile_user_unique" UNIQUE ("userId"),
    CONSTRAINT "profile_user_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

COMMENT ON COLUMN "Profile"."nationalId" IS 'KVKK: encrypt column or store in external vault.';

CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

CREATE TABLE "Transaction" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "cardPanHash" TEXT,
    "cardExpiry" TEXT,
    "metadata" JSONB,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "transaction_reference_unique" UNIQUE ("reference"),
    CONSTRAINT "transaction_user_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

COMMENT ON COLUMN "Transaction"."cardPanHash" IS 'PCI: use column-level encryption or secure vault tokenization.';
COMMENT ON COLUMN "Transaction"."cardExpiry" IS 'PCI: encrypt column or store via secure vault.';

CREATE INDEX "transaction_user_idx" ON "Transaction" ("userId");

-- Trigger to update timestamps for updatedAt columns.
CREATE OR REPLACE FUNCTION set_current_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE PROCEDURE set_current_timestamp();

CREATE TRIGGER set_profile_updated_at
BEFORE UPDATE ON "Profile"
FOR EACH ROW EXECUTE PROCEDURE set_current_timestamp();

CREATE TRIGGER set_transaction_updated_at
BEFORE UPDATE ON "Transaction"
FOR EACH ROW EXECUTE PROCEDURE set_current_timestamp();
