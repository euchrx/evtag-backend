-- CreateEnum
CREATE TYPE "LabelItemType" AS ENUM ('INPUT', 'PRODUCTION', 'FRACTIONED');

-- CreateTable
CREATE TABLE "label_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemType" "LabelItemType" NOT NULL,
    "defaultShelfLifeHours" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label_prints" (
    "id" TEXT NOT NULL,
    "labelItemId" TEXT NOT NULL,
    "preparedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER,
    "weight" DECIMAL(10,3),
    "lot" TEXT,
    "qrCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_prints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "label_prints_qrCode_key" ON "label_prints"("qrCode");

-- CreateIndex
CREATE INDEX "label_prints_labelItemId_idx" ON "label_prints"("labelItemId");

-- CreateIndex
CREATE INDEX "label_prints_expiresAt_idx" ON "label_prints"("expiresAt");

-- CreateIndex
CREATE INDEX "label_prints_status_idx" ON "label_prints"("status");

-- AddForeignKey
ALTER TABLE "label_prints" ADD CONSTRAINT "label_prints_labelItemId_fkey" FOREIGN KEY ("labelItemId") REFERENCES "label_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
