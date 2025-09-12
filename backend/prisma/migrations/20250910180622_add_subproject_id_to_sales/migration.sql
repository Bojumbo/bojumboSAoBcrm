-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "subproject_id" INTEGER;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_subproject_id_fkey" FOREIGN KEY ("subproject_id") REFERENCES "subprojects"("subproject_id") ON DELETE SET NULL ON UPDATE CASCADE;
