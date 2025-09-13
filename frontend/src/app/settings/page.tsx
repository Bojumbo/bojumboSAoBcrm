'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PagePlaceholder from '@/components/PagePlaceholder';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <PagePlaceholder
        title="Налаштування"
        description="Налаштування системи, користувачів та прав доступу"
        icon={Settings}
      />
    </DashboardLayout>
  );
}
