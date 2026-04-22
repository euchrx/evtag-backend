-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "companyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Empresa padrão para dados já existentes
INSERT INTO "companies" ("id", "name", "isActive", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Empresa Padrão',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- AddColumn
ALTER TABLE "label_categories"
ADD COLUMN "companyId" TEXT;

-- AddColumn
ALTER TABLE "label_items"
ADD COLUMN "companyId" TEXT;

-- AddColumn
ALTER TABLE "label_prints"
ADD COLUMN "companyId" TEXT;

-- Preenche companyId nos dados existentes
UPDATE "label_categories"
SET "companyId" = '00000000-0000-0000-0000-000000000001'
WHERE "companyId" IS NULL;

UPDATE "label_items"
SET "companyId" = '00000000-0000-0000-0000-000000000001'
WHERE "companyId" IS NULL;

UPDATE "label_prints"
SET "companyId" = '00000000-0000-0000-0000-000000000001'
WHERE "companyId" IS NULL;

-- Torna obrigatório depois de preencher
ALTER TABLE "label_categories"
ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE "label_items"
ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE "label_prints"
ALTER COLUMN "companyId" SET NOT NULL;

-- Drop old unique
DROP INDEX IF EXISTS "label_categories_name_key";

-- New indexes
CREATE INDEX "users_companyId_idx" ON "users"("companyId");
CREATE INDEX "label_categories_companyId_idx" ON "label_categories"("companyId");
CREATE INDEX "label_items_companyId_idx" ON "label_items"("companyId");
CREATE INDEX "label_prints_companyId_idx" ON "label_prints"("companyId");

-- New unique
CREATE UNIQUE INDEX "label_categories_companyId_name_key" ON "label_categories"("companyId", "name");
CREATE UNIQUE INDEX "label_items_companyId_name_key" ON "label_items"("companyId", "name");

-- FKs
ALTER TABLE "users"
ADD CONSTRAINT "users_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "label_categories"
ADD CONSTRAINT "label_categories_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "label_items"
ADD CONSTRAINT "label_items_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "label_prints"
ADD CONSTRAINT "label_prints_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");