'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { GitBranch } from 'lucide-react';

export default function SubprojectsPage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Підпроекти"
        description="Управління підпроектами в рамках основних проектів"
        icon={GitBranch}
      />
    </DashboardLayout>
  );
}
