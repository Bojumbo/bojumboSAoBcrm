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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, GitBranch, Euro, Calendar, FileText, Edit, Package, Settings, MessageSquare, CheckSquare } from 'lucide-react';

export default function SubprojectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [subproject, setSubproject] = useState<SubProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEditSubproject = () => {
    setIsEditDialogOpen(true);
  };

  const handleSubprojectUpdated = (updatedSubproject: SubProject) => {
    setSubproject(updatedSubproject);
    setIsEditDialogOpen(false);
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

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
        {/* Навігація та заголовок */}
        <div className="flex items-center justify-between">
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
          <Button onClick={handleEditSubproject} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Редагувати
          </Button>
        </div>

        {/* Основна інформація */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Вартість</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(subproject.cost)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Воронка</span>
              </div>
              <div className="text-lg font-medium">
                {subproject.funnel?.name || 'Не вказано'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Етап</span>
              </div>
              <div className="text-lg font-medium">
                {subproject.funnel_stage?.name || 'Не вказано'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Створено</span>
              </div>
              <div className="text-lg font-semibold">
                {new Date(subproject.created_at).toLocaleDateString('uk-UA')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-muted-foreground">Проект</span>
              </div>
              <div className="text-lg font-semibold">
                #{subproject.project_id}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Опис */}
        {subproject.description && (
          <Card>
            <CardHeader>
              <CardTitle>Опис підпроекту</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{subproject.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Вкладки з додатковою інформацією */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Товари
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Послуги
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Коментарі
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Завдання
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Товари підпроекту</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Список товарів буде додано в наступних версіях</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Послуги підпроекту</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Список послуг буде додано в наступних версіях</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Коментарі до підпроекту</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Коментарі будуть додані в наступних версіях</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Завдання підпроекту</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Завдання будуть додані в наступних версіях</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </DashboardLayout>
  );
}