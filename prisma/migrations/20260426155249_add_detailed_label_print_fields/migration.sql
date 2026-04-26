/*
  Warnings:

  - You are about to drop the `LabelPrint` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LabelWeightUnit" AS ENUM ('G', 'KG', 'UN');

-- DropForeignKey
ALTER TABLE "LabelPrint" DROP CONSTRAINT "LabelPrint_companyId_fkey";

-- DropForeignKey
ALTER TABLE "LabelPrint" DROP CONSTRAINT "LabelPrint_labelItemId_fkey";

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "cep" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "document" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "tradeName" TEXT;

-- DropTable
DROP TABLE "LabelPrint";

-- CreateTable
CREATE TABLE "label_prints" (
    "id" TEXT NOT NULL,
    "labelItemId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "preparedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "originalExpiresAt" TIMESTAMP(3),
    "quantity" INTEGER,
    "weight" DECIMAL(10,3),
    "weightUnit" "LabelWeightUnit" NOT NULL DEFAULT 'KG',
    "lot" TEXT,
    "brandOrSupplier" TEXT,
    "sif" TEXT,
    "responsible" TEXT,
    "showQr" BOOLEAN NOT NULL DEFAULT true,
    "qrCode" TEXT NOT NULL,
    "status" "LabelPrintStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "consumedByUserId" TEXT,
    "consumedByDeviceId" TEXT,

    CONSTRAINT "label_prints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "label_prints_qrCode_key" ON "label_prints"("qrCode");

-- CreateIndex
CREATE INDEX "label_prints_labelItemId_idx" ON "label_prints"("labelItemId");

-- CreateIndex
CREATE INDEX "label_prints_companyId_idx" ON "label_prints"("companyId");

-- CreateIndex
CREATE INDEX "label_prints_expiresAt_idx" ON "label_prints"("expiresAt");

-- CreateIndex
CREATE INDEX "label_prints_status_idx" ON "label_prints"("status");

-- AddForeignKey
ALTER TABLE "label_prints" ADD CONSTRAINT "label_prints_labelItemId_fkey" FOREIGN KEY ("labelItemId") REFERENCES "label_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_prints" ADD CONSTRAINT "label_prints_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
