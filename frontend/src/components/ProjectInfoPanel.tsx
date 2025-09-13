'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Project } from '@/types/projects';
import { User, Building2, Users, DollarSign, Calendar, FileText } from 'lucide-react';

interface ProjectInfoPanelProps {
  project: Project;
}

export default function ProjectInfoPanel({ project }: ProjectInfoPanelProps) {
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Інформація про проект
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Опис проекту */}
          {project.description && (
            <div>
              <h4 className="font-semibold mb-2">Опис</h4>
              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                {project.description}
              </p>
            </div>
          )}

        <Separator />

        {/* Прогнозна сума */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Прогнозна сума
          </h4>
          <p className="text-lg font-medium text-green-600">
            {formatCurrency(project.forecast_amount)}
          </p>
        </div>

        <Separator />

        {/* Контрагент */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Контрагент
          </h4>
          {project.counterparty ? (
            <div className="space-y-1">
              <p className="text-sm font-medium break-words">{project.counterparty.name}</p>
              {project.counterparty.phone && (
                <p className="text-sm text-muted-foreground break-all">
                  Тел: {project.counterparty.phone}
                </p>
              )}
              {project.counterparty.email && (
                <p className="text-sm text-muted-foreground break-all">
                  Email: {project.counterparty.email}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Не вказано</p>
          )}
        </div>

        <Separator />

        {/* Відповідальний менеджер */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Відповідальний менеджер
          </h4>
          {project.main_responsible_manager ? (
            <div className="space-y-1">
              <p className="text-sm font-medium break-words">
                {project.main_responsible_manager.first_name} {project.main_responsible_manager.last_name}
              </p>
              <p className="text-sm text-muted-foreground break-all">
                {project.main_responsible_manager.email}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Не вказано</p>
          )}
        </div>

        <Separator />

        {/* Додаткові менеджери */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Додаткові менеджери
          </h4>
          {project.secondary_responsible_managers && project.secondary_responsible_managers.length > 0 ? (
            <div className="space-y-2">
              {project.secondary_responsible_managers.map((pm) => (
                <div key={pm.manager_id} className="space-y-1">
                  <p className="text-sm font-medium break-words">
                    {pm.manager.first_name} {pm.manager.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground break-all">
                    {pm.manager.email}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Не вказано</p>
          )}
        </div>

        <Separator />

        {/* Дати */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Дати
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Створено:</span>
              <p>{formatDate(project.created_at)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Оновлено:</span>
              <p>{formatDate(project.updated_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}