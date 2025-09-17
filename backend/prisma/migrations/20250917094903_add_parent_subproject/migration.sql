-- AlterTable
ALTER TABLE "subprojects" ADD COLUMN     "parent_subproject_id" INTEGER,
ALTER COLUMN "project_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "subprojects_parent_subproject_id_idx" ON "subprojects"("parent_subproject_id");

-- CreateIndex
CREATE INDEX "subprojects_project_id_idx" ON "subprojects"("project_id");

-- AddForeignKey
ALTER TABLE "subprojects" ADD CONSTRAINT "subprojects_parent_subproject_id_fkey" FOREIGN KEY ("parent_subproject_id") REFERENCES "subprojects"("subproject_id") ON DELETE SET NULL ON UPDATE CASCADE;
