'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { SubProject } from '@/types/projects';
import { subprojectsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GitBranch, Euro, Calendar, FileText } from 'lucide-react';

export default function SubprojectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [subproject, setSubproject] = useState<SubProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subprojectId = typeof params.id === 'string' ? parseInt(params.id) : null;

  useEffect(() => {
    const loadSubproject = async () => {
      if (!subprojectId) {
        setError('Невірний ID підпроекту');
        setLoading(false);
        return;
      }

      try {
        const response = await subprojectsAPI.getById(subprojectId);
        if (response.success && response.data) {
          setSubproject(response.data);
        } else {
          setError(response.error || 'Помилка завантаження підпроекту');
        }
      } catch (err) {
        setError('Помилка завантаження підпроекту');
      } finally {
        setLoading(false);
      }
    };

    loadSubproject();
  }, [subprojectId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !subproject) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Підпроект не знайдено'}</p>
            <Button onClick={() => router.push('/subprojects')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Повернутися до списку
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Навігація */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.push('/subprojects')} 
            variant="outline" 
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до підпроектів
          </Button>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold">{subproject.name}</h1>
            <Badge variant="outline">#{subproject.subproject_id}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основна інформація */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Деталі підпроекту</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subproject.description && (
                  <div>
                    <h3 className="font-medium mb-2">Опис</h3>
                    <p className="text-gray-600">{subproject.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Проект: #{subproject.project_id}
                    </span>
                  </div>
                  
                  {subproject.status && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {subproject.status}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    Вартість: {parseFloat(subproject.cost).toLocaleString('uk-UA')} ₴
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Бічна панель */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-gray-600">Створено</div>
                    <div className="font-medium">
                      {new Date(subproject.created_at).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-gray-600">Оновлено</div>
                    <div className="font-medium">
                      {new Date(subproject.updated_at).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}