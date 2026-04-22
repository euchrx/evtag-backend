/*
  Warnings:

  - Made the column `categoryId` on table `label_items` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "label_items" ALTER COLUMN "categoryId" SET NOT NULL;
