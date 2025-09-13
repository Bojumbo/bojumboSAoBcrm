'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { Wrench } from 'lucide-react';

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Послуги"
        description="Каталог послуг, що надаються компанією"
        icon={Wrench}
      />
    </DashboardLayout>
  );
}
