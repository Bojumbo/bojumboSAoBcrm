import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { Users } from 'lucide-react';

export default function CounterpartiesPage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Контрагенти"
        description="Управління клієнтами, постачальниками та партнерами"
        icon={Users}
      />
    </DashboardLayout>
  );
}
