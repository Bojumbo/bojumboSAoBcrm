import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { ShoppingCart } from 'lucide-react';

export default function SalesPage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Продажі"
        description="Управління продажами, угодами та воронкою продажів"
        icon={ShoppingCart}
      />
    </DashboardLayout>
  );
}
