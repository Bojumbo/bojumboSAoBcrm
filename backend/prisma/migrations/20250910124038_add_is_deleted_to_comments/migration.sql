-- AlterTable
ALTER TABLE "project_comments" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subproject_comments" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
