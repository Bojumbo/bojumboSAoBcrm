import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { Package } from 'lucide-react';

export default function WarehousePage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Склад"
        description="Управління складськими запасами та їх обліком"
        icon={Package}
      />
    </DashboardLayout>
  );
}
