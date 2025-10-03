'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SubProject } from '@/types/projects';
import { User, Calendar, DollarSign, TrendingUp, FileText, FolderOpen, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Manager } from '@/types/users';
import { ManagerCombobox } from './ManagerCombobox';
import { managerService } from '@/services/managerService';

interface SubProjectInfoPanelProps {
  subproject: SubProject;
  onEdit?: () => void;
  isEditing?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  onSubprojectChange?: (subproject: SubProject) => void;
}

export default function SubProjectInfoPanel({ subproject, onEdit, isEditing, onCancel, onSave, onSubprojectChange }: SubProjectInfoPanelProps) {
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    if (isEditing) {
      const fetchManagers = async () => {
        try {
          const fetchedManagers = await managerService.getAllForAssignment();
          setManagers(fetchedManagers);
        } catch (error) {
          console.error("Failed to fetch managers", error);
        }
      };
      fetchManagers();
    }
  }, [isEditing]);

  const handleManagerSelect = (managerId: number | null) => {
    if (onSubprojectChange) {
      const selectedManager = managers.find(m => m.manager_id === managerId);
      onSubprojectChange({
        ...subproject,
        main_responsible_manager_id: managerId,
        main_responsible_manager: selectedManager ? {
            first_name: selectedManager.first_name,
            last_name: selectedManager.last_name,
            email: selectedManager.email
        } : undefined
      });
    }
  };

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>Інформація про підпроект</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Редагувати" onClick={onEdit}>
          <Edit className="h-5 w-5 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Батьківський проект/підпроект</h4>
          {subproject.parent_subproject_id && subproject.parent_subproject_name ? (
            <div className="flex flex-col font-bold">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <Badge variant="outline">Підпроект</Badge>
                <span className="font-medium">{subproject.parent_subproject_name}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 ml-7">ID: {subproject.parent_subproject_id}</span>
            </div>
          ) : subproject.project_id && subproject.project_name ? (
            <div className="flex flex-col font-bold">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <Badge variant="outline">Проект</Badge>
                <span className="font-medium">{subproject.project_name}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 ml-7">ID: {subproject.project_id}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Без привʼязки</span>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Прогнозована вартість
          </h4>
          {isEditing ? (
            <Input 
              type="number" 
              value={subproject.cost} 
              onChange={(e) => onSubprojectChange && onSubprojectChange({ ...subproject, cost: parseFloat(e.target.value) || 0 })}
              className="text-lg font-medium" 
            />
          ) : (
            <p className="text-lg font-medium text-green-600">{subproject.cost} грн</p>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Менеджери підпроекту
          </h4>
          <div className="ml-2 mb-4">
            <p className="font-medium text-sm text-muted-foreground">Головний</p>
            {isEditing ? (
              <ManagerCombobox
                managers={managers}
                selectedManagerId={subproject.main_responsible_manager_id}
                onSelect={handleManagerSelect}
              />
            ) : (
              subproject.main_responsible_manager ? (
                <>
                  <span className="font-bold">{subproject.main_responsible_manager.first_name} {subproject.main_responsible_manager.last_name}</span>
                  <div className="text-sm text-muted-foreground">{subproject.main_responsible_manager.email}</div>
                </>
              ) : (
                <span className="ml-2">—</span>
              )
            )}
          </div>

          {subproject.secondary_responsible_managers && subproject.secondary_responsible_managers.length > 0 && (
            <div className="ml-2">
              <p className="font-medium text-sm text-muted-foreground">Додаткові</p>
              <ul className="space-y-2">
                {subproject.secondary_responsible_managers.map(sm => (
                  <li key={sm.manager_id} className="font-bold">
                    {sm.manager.first_name} {sm.manager.last_name}
                  </li>
                ))}
              </ul>
            </div>
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
        
        <Separator />
        
        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Скасувати</Button>
            <Button onClick={onSave}>Зберегти</Button>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}