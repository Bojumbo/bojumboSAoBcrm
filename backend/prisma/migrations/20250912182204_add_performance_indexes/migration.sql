-- CreateIndex
CREATE INDEX "project_comments_project_id_idx" ON "project_comments"("project_id");

-- CreateIndex
CREATE INDEX "project_comments_created_at_idx" ON "project_comments"("created_at");

-- CreateIndex
CREATE INDEX "project_products_project_id_idx" ON "project_products"("project_id");

-- CreateIndex
CREATE INDEX "projects_main_responsible_manager_id_idx" ON "projects"("main_responsible_manager_id");

-- CreateIndex
CREATE INDEX "projects_counterparty_id_idx" ON "projects"("counterparty_id");

-- CreateIndex
CREATE INDEX "projects_funnel_id_idx" ON "projects"("funnel_id");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");

-- CreateIndex
CREATE INDEX "projects_updated_at_idx" ON "projects"("updated_at");
