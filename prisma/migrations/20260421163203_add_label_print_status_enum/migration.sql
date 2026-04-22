/*
  Warnings:

  - The `status` column on the `label_prints` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LabelPrintStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'DISCARDED', 'CONSUMED');

-- AlterTable
ALTER TABLE "label_prints" DROP COLUMN "status",
ADD COLUMN     "status" "LabelPrintStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "label_prints_status_idx" ON "label_prints"("status");
