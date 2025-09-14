'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountSettings from '@/components/settings/AccountSettings';
import FunnelSettings from '@/components/settings/FunnelSettings';
import SubProjectFunnelSettings from '@/components/settings/SubProjectFunnelSettings';
import { User, Funnel, GitBranch } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Налаштування</h1>
          <p className="text-muted-foreground">
            Керуйте налаштуваннями вашого акаунта та системи
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Основні</span>
            </TabsTrigger>
            <TabsTrigger value="funnels" className="flex items-center gap-2">
              <Funnel className="h-4 w-4" />
              <span className="hidden sm:inline">Воронки проектів</span>
            </TabsTrigger>
            <TabsTrigger value="subproject-funnels" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Воронки підпроектів</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="funnels" className="space-y-6">
            <FunnelSettings />
          </TabsContent>

          <TabsContent value="subproject-funnels" className="space-y-6">
            <SubProjectFunnelSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
