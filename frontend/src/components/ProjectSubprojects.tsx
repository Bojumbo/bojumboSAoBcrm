'use client';

import React, { useState, useEffect } from 'react';
import SubProjectEditDialog from './SubProjectEditDialog';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, DollarSign, User, Building, Eye, Edit } from 'lucide-react';
import { SubProject } from '@/types/projects';
import { subprojectsAPI } from '@/lib/api';

interface ProjectSubprojectsProps {
  projectId: number;
}

export default function ProjectSubprojects({ projectId }: ProjectSubprojectsProps) {
  const [subprojects, setSubprojects] = useState<SubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSubprojects();
  }, [projectId]);

  const fetchSubprojects = async () => {
    try {
      setLoading(true);
      const response = await subprojectsAPI.getAll(projectId);
      
      if (response.success && response.data) {
        setSubprojects(response.data);
      } else {
        console.error('Failed to fetch subprojects:', response.error);
        setSubprojects([]);
      }
    } catch (error) {
      console.error('Error fetching subprojects:', error);
      setSubprojects([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewSubproject = (subprojectId: number) => {
    router.push(`/subprojects/${subprojectId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Завантаження підпроектів...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 min-h-[600px]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Підпроекти</h3>
          <p className="text-sm text-muted-foreground">
            Управління підпроектами та їх статусами
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Додати підпроект
        </Button>
      </div>

      {!Array.isArray(subprojects) || subprojects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Немає підпроектів</h3>
            <p className="text-muted-foreground mb-4">
              Створіть перший підпроект для цього проекту
            </p>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Створити підпроект
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subprojects.map((subproject) => (
            <Card key={subproject.subproject_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{subproject.name}</CardTitle>
                    {subproject.description && (
                      <CardDescription className="mt-2">
                        {subproject.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      {subproject.funnel && (
                        <div className="text-sm text-muted-foreground">
                          Воронка: <span className="font-medium">{subproject.funnel.name}</span>
                        </div>
                      )}
                      {subproject.funnel_stage && (
                        <div className="text-sm text-muted-foreground">
                          Етап: <span className="font-medium">{subproject.funnel_stage.name}</span>
                        </div>
                      )}
                      {!subproject.funnel && !subproject.funnel_stage && (
                        <div className="text-sm text-muted-foreground">
                          Воронка не встановлена
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Вартість:</span>
                    <span className="font-medium">
                      {formatCurrency(subproject.cost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Створено:</span>
                    <span>{formatDate(subproject.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Оновлено:</span>
                    <span>{formatDate(subproject.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ID:</span>
                    <span>{subproject.subproject_id}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    ID: {subproject.subproject_id}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSubproject(subproject.subproject_id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Переглянути
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Діалог створення підпроекту */}
      <SubProjectEditDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={() => { setIsCreateDialogOpen(false); fetchSubprojects(); }}
        mode="create"
        projectId={projectId}
      />
    </div>
  );
}