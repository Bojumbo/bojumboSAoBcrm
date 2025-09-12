'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function PagePlaceholder({ title, description, icon: Icon = Construction }: PagePlaceholderProps) {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="p-6 pt-20 lg:pt-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Icon className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Сторінка в розробці</CardTitle>
            <CardDescription>
              Цей розділ буде реалізований у наступних версіях системи
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-yellow-800">
                <Construction className="w-5 h-5" />
                <span className="font-medium">Функціонал розробляється</span>
              </div>
              <p className="text-yellow-700 text-sm mt-2">
                Наша команда працює над реалізацією цього модуля. 
                Слідкуйте за оновленнями!
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Планований функціонал:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Перегляд та управління записами</li>
                <li>• Створення та редагування</li>
                <li>• Пошук та фільтрація</li>
                <li>• Експорт даних</li>
                <li>• Детальна аналітика</li>
              </ul>
            </div>

            <Button variant="outline" className="mt-4" onClick={handleBackToDashboard}>
              Повернутися до Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
