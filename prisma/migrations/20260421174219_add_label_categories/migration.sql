/*
  Warnings:

  - You are about to drop the column `category` on the `label_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "label_items" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "label_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "label_categories_name_key" ON "label_categories"("name");

-- CreateIndex
CREATE INDEX "label_items_categoryId_idx" ON "label_items"("categoryId");

-- AddForeignKey
ALTER TABLE "label_items" ADD CONSTRAINT "label_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "label_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
