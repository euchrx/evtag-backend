-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "LabelItemType" AS ENUM ('INPUT', 'PRODUCTION', 'FRACTIONED');

-- CreateEnum
CREATE TYPE "LabelPrintStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'DISCARDED', 'CONSUMED');

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

-- CreateTable
CREATE TABLE "label_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemType" "LabelItemType" NOT NULL,
    "defaultShelfLifeHours" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelPrint" (
    "id" TEXT NOT NULL,
    "labelItemId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "preparedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER,
    "weight" DECIMAL(10,3),
    "lot" TEXT,
    "qrCode" TEXT NOT NULL,
    "status" "LabelPrintStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "consumedByUserId" TEXT,
    "consumedByDeviceId" TEXT,

    CONSTRAINT "LabelPrint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "users"("companyId");

-- CreateIndex
CREATE INDEX "label_categories_companyId_idx" ON "label_categories"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "label_categories_companyId_name_key" ON "label_categories"("companyId", "name");

-- CreateIndex
CREATE INDEX "label_items_categoryId_idx" ON "label_items"("categoryId");

-- CreateIndex
CREATE INDEX "label_items_companyId_idx" ON "label_items"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "label_items_companyId_name_key" ON "label_items"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LabelPrint_qrCode_key" ON "LabelPrint"("qrCode");

-- CreateIndex
CREATE INDEX "LabelPrint_labelItemId_idx" ON "LabelPrint"("labelItemId");

-- CreateIndex
CREATE INDEX "LabelPrint_companyId_idx" ON "LabelPrint"("companyId");

-- CreateIndex
CREATE INDEX "LabelPrint_expiresAt_idx" ON "LabelPrint"("expiresAt");

-- CreateIndex
CREATE INDEX "LabelPrint_status_idx" ON "LabelPrint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- CreateIndex
CREATE INDEX "Device_companyId_idx" ON "Device"("companyId");

-- CreateIndex
CREATE INDEX "Device_lastSeenAt_idx" ON "Device"("lastSeenAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_categories" ADD CONSTRAINT "label_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_items" ADD CONSTRAINT "label_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "label_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_items" ADD CONSTRAINT "label_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelPrint" ADD CONSTRAINT "LabelPrint_labelItemId_fkey" FOREIGN KEY ("labelItemId") REFERENCES "label_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelPrint" ADD CONSTRAINT "LabelPrint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
