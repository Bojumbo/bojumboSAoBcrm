-- AlterTable
ALTER TABLE "counterparties" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "subprojects" ADD COLUMN     "sub_project_funnel_id" INTEGER,
ADD COLUMN     "sub_project_funnel_stage_id" INTEGER;

-- CreateTable
CREATE TABLE "sub_project_funnels" (
    "sub_project_funnel_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_project_funnels_pkey" PRIMARY KEY ("sub_project_funnel_id")
);

-- CreateTable
CREATE TABLE "sub_project_funnel_stages" (
    "sub_project_funnel_stage_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sub_project_funnel_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_project_funnel_stages_pkey" PRIMARY KEY ("sub_project_funnel_stage_id")
);

-- AddForeignKey
ALTER TABLE "sub_project_funnel_stages" ADD CONSTRAINT "sub_project_funnel_stages_sub_project_funnel_id_fkey" FOREIGN KEY ("sub_project_funnel_id") REFERENCES "sub_project_funnels"("sub_project_funnel_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subprojects" ADD CONSTRAINT "subprojects_sub_project_funnel_id_fkey" FOREIGN KEY ("sub_project_funnel_id") REFERENCES "sub_project_funnels"("sub_project_funnel_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subprojects" ADD CONSTRAINT "subprojects_sub_project_funnel_stage_id_fkey" FOREIGN KEY ("sub_project_funnel_stage_id") REFERENCES "sub_project_funnel_stages"("sub_project_funnel_stage_id") ON DELETE SET NULL ON UPDATE CASCADE;
