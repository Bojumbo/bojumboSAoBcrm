'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, FolderOpen, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const stats = [
    {
      title: 'Активні проекти',
      value: '12',
      description: 'У роботі',
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Клієнти',
      value: '48',
      description: 'Загальна кількість',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Продажі',
      value: '₴124,500',
      description: 'За цей місяць',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Завдання',
      value: '23',
      description: 'Активні',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const quickActions = [
    { title: 'Створити новий проект', icon: FolderOpen, route: '/projects' },
    { title: 'Додати клієнта', icon: Users, route: '/counterparties' },
    { title: 'Нова продажа', icon: TrendingUp, route: '/sales' },
    { title: 'Створити завдання', icon: BarChart3, route: '/tasks' },
  ];

  const handleQuickAction = (route: string) => {
    router.push(route);
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ласкаво просимо, {user?.first_name}!
        </h1>
        <p className="text-gray-600">
          Ось огляд вашої системи на сьогодні
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Швидкі дії</CardTitle>
            <CardDescription>
              Найчастіші операції в системі
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction(action.route)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {action.title}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Останні активності</CardTitle>
            <CardDescription>
              Нещодавні дії в системі
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Проект "Веб-сайт" завершено</p>
                  <p className="text-xs text-gray-500">2 години тому</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Новий клієнт доданий</p>
                  <p className="text-xs text-gray-500">4 години тому</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Завдання призначено</p>
                  <p className="text-xs text-gray-500">6 годин тому</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Останні проекти</CardTitle>
          <CardDescription>
            Проекти, з якими ви нещодавно працювали
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-600">Назва проекту</th>
                  <th className="text-left py-2 font-medium text-gray-600">Клієнт</th>
                  <th className="text-left py-2 font-medium text-gray-600">Статус</th>
                  <th className="text-left py-2 font-medium text-gray-600">Прогрес</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 font-medium">Веб-сайт компанії</td>
                  <td className="py-3 text-gray-600">ТОВ "Приклад"</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Завершено
                    </span>
                  </td>
                  <td className="py-3">100%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 font-medium">Мобільний додаток</td>
                  <td className="py-3 text-gray-600">ПП "Тест"</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      В роботі
                    </span>
                  </td>
                  <td className="py-3">75%</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">CRM система</td>
                  <td className="py-3 text-gray-600">ТОВ "Інновація"</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Планування
                    </span>
                  </td>
                  <td className="py-3">25%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
