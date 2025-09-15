/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sku" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "project_services" ADD COLUMN     "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "sale_services" ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
