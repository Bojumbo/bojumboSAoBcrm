'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SubProject } from '@/types/projects';
import { User, Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react';

interface SubProjectInfoPanelProps {
  subproject: SubProject;
  onEdit?: () => void;
}

export default function SubProjectInfoPanel({ subproject, onEdit }: SubProjectInfoPanelProps) {
  return (
    <Card className="h-fit sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Інформація про підпроект
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Назва</h4>
          <p className="font-bold">{subproject.name}</p>
          {subproject.description && (
            <p className="text-sm text-muted-foreground leading-relaxed break-words mt-2">
              {subproject.description}
            </p>
          )}
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">ID підпроекту</h4>
          <p className="font-bold">#{subproject.subproject_id}</p>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">Батьківський проект/підпроект</h4>
          <p className="font-bold">{subproject.parent_subproject_id ? `#${subproject.parent_subproject_id}` : (subproject.project_id ? `#${subproject.project_id}` : '—')}</p>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Прогнозована вартість
          </h4>
          <p className="text-lg font-medium text-green-600">{subproject.cost}</p>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Менеджер підпроекту
          </h4>
          {subproject.main_responsible_manager ? (
            <div className="ml-2">
              <span className="font-bold">{subproject.main_responsible_manager.first_name} {subproject.main_responsible_manager.last_name}</span>
              <div className="text-sm text-muted-foreground">{subproject.main_responsible_manager.email}</div>
            </div>
          ) : (
            <span className="ml-2">—</span>
          )}
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Дати
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Створено:</span>
              <p>{subproject.created_at}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Оновлено:</span>
              <p>{subproject.updated_at}</p>
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Статистика виконання
          </h4>
          <ul className="ml-4 list-disc">
            <li>Сума по товарах: <span className="font-bold">—</span></li>
            <li>Сума по послугах: <span className="font-bold">—</span></li>
            <li>Загальна сума: <span className="font-bold">—</span></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
