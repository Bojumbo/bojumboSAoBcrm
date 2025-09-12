import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { CheckSquare } from 'lucide-react';

export default function TasksPage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Завдання"
        description="Управління завданнями та їх призначенням співробітникам"
        icon={CheckSquare}
      />
    </DashboardLayout>
  );
}
