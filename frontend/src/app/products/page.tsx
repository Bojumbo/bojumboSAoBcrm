'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { Box } from 'lucide-react';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Товари"
        description="Каталог товарів, їх характеристики та ціни"
        icon={Box}
      />
    </DashboardLayout>
  );
}
