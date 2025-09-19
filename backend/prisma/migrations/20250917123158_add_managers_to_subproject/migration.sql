/*
  Warnings:

  - You are about to drop the `subprojects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_subproject_id_fkey";

-- DropForeignKey
ALTER TABLE "subproject_comments" DROP CONSTRAINT "subproject_comments_subproject_id_fkey";

-- DropForeignKey
ALTER TABLE "subproject_products" DROP CONSTRAINT "subproject_products_subproject_id_fkey";

-- DropForeignKey
ALTER TABLE "subproject_services" DROP CONSTRAINT "subproject_services_subproject_id_fkey";

-- DropForeignKey
ALTER TABLE "subprojects" DROP CONSTRAINT "subprojects_parent_subproject_id_fkey";

-- DropForeignKey
ALTER TABLE "subprojects" DROP CONSTRAINT "subprojects_project_id_fkey";

-- DropForeignKey
ALTER TABLE "subprojects" DROP CONSTRAINT "subprojects_sub_project_funnel_id_fkey";

-- DropForeignKey
ALTER TABLE "subprojects" DROP CONSTRAINT "subprojects_sub_project_funnel_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_subproject_id_fkey";

-- DropTable
DROP TABLE "subprojects";

-- CreateTable
CREATE TABLE "SubProject" (
    "subproject_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "project_id" INTEGER,
    "parent_subproject_id" INTEGER,
    "status" TEXT,
    "cost" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sub_project_funnel_id" INTEGER,
    "sub_project_funnel_stage_id" INTEGER,
    "main_responsible_manager_id" INTEGER,

    CONSTRAINT "SubProject_pkey" PRIMARY KEY ("subproject_id")
);

-- CreateTable
CREATE TABLE "subproject_managers" (
    "subproject_id" INTEGER NOT NULL,
    "manager_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subproject_managers_pkey" PRIMARY KEY ("subproject_id","manager_id")
);

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_subproject_id_fkey" FOREIGN KEY ("subproject_id") REFERENCES "SubProject"("subproject_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_parent_subproject_id_fkey" FOREIGN KEY ("parent_subproject_id") REFERENCES "SubProject"("subproject_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_sub_project_funnel_id_fkey" FOREIGN KEY ("sub_project_funnel_id") REFERENCES "sub_project_funnels"("sub_project_funnel_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_sub_project_funnel_stage_id_fkey" FOREIGN KEY ("sub_project_funnel_stage_id") REFERENCES "sub_project_funnel_stages"("sub_project_funnel_stage_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_main_responsible_manager_id_fkey" FOREIGN KEY ("main_responsible_manager_id") REFERENCES "managers"("manager_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subproject_managers" ADD CONSTRAINT "subproject_managers_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "managers"("manager_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subproject_managers" ADD CONSTRAINT "subproject_managers_subproject_id_fkey" FOREIGN KEY ("subproject_id") REFERENCES "SubProject"("subproject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_subproject_id_fkey" FOREIGN KEY ("subproject_id") REFERENCES "SubProject"("subproject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subproject_products" ADD CONSTRAINT "subproject_products_subproject_id_fkey" FOREIGN KEY ("subproject_id") REFERENCES "SubProject"("subproject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subproject_services" ADD CONSTRAINT "subproject_services_subproject_id_fkey" FOREIGN KEY ("subproject_id") REFERENCES "SubProject"("subproject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subproject_comments" ADD CONSTRAINT "subproject_comments_subproject_id_fkey" FOREIGN KEY ("subproject_id") REFERENCES "SubProject"("subproject_id") ON DELETE CASCADE ON UPDATE CASCADE;
