'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Project, Manager, Counterparty } from '@/types/projects';
import { projectService } from '@/services/projectService';
import { managerService } from '@/services/managerService';
import { counterpartyService } from '@/services/counterpartyService';

interface ProjectEditDialogProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

export default function ProjectEditDialog({
  project,
  isOpen,
  onClose,
  onSave,
}: ProjectEditDialogProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    forecast_amount: project.forecast_amount.toString(),
    counterparty_id: project.counterparty_id?.toString() || '',
    main_responsible_manager_id: project.main_responsible_manager_id?.toString() || '',
  });

  const [managers, setManagers] = useState<Manager[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [secondaryManagers, setSecondaryManagers] = useState<Manager[]>(
    project.secondary_responsible_managers?.map(pm => pm.manager) || []
  );
  const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    // Фільтруємо доступних менеджерів (виключаємо головного та вже доданих)
    const filtered = managers.filter(manager => 
      manager.manager_id.toString() !== formData.main_responsible_manager_id &&
      !secondaryManagers.some(sm => sm.manager_id === manager.manager_id)
    );
    setAvailableManagers(filtered);
  }, [managers, formData.main_responsible_manager_id, secondaryManagers]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managersData, counterpartiesData] = await Promise.all([
        managerService.getAll(),
        counterpartyService.getAll(),
      ]);
      setManagers(managersData);
      setCounterparties(counterpartiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSecondaryManager = (managerId: string) => {
    const manager = managers.find(m => m.manager_id.toString() === managerId);
    if (manager && !secondaryManagers.some(sm => sm.manager_id === manager.manager_id)) {
      setSecondaryManagers(prev => [...prev, manager]);
    }
  };

  const handleRemoveSecondaryManager = (managerId: number) => {
    setSecondaryManagers(prev => prev.filter(m => m.manager_id !== managerId));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData: Partial<Project> = {
        name: formData.name,
        description: formData.description || undefined,
        forecast_amount: formData.forecast_amount,
        counterparty_id: formData.counterparty_id ? parseInt(formData.counterparty_id) : undefined,
        main_responsible_manager_id: formData.main_responsible_manager_id ? parseInt(formData.main_responsible_manager_id) : undefined,
      };

      // Оновлюємо проект
      const updatedProject = await projectService.update(project.project_id, updateData);

      // Оновлюємо додаткових менеджерів
      // Спочатку видаляємо всіх поточних додаткових менеджерів
      if (project.secondary_responsible_managers) {
        for (const pm of project.secondary_responsible_managers) {
          try {
            await projectService.removeSecondaryManager(project.project_id, pm.manager_id);
          } catch (error) {
            console.error('Error removing secondary manager:', error);
          }
        }
      }

      // Потім додаємо нових
      for (const manager of secondaryManagers) {
        try {
          await projectService.addSecondaryManager(project.project_id, manager.manager_id);
        } catch (error) {
          console.error('Error adding secondary manager:', error);
        }
      }

      // Отримуємо оновлені дані проекту
      const finalProject = await projectService.getById(project.project_id);
      onSave(finalProject);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Скидаємо форму до початкових значень
    setFormData({
      name: project.name,
      description: project.description || '',
      forecast_amount: project.forecast_amount.toString(),
      counterparty_id: project.counterparty_id?.toString() || '',
      main_responsible_manager_id: project.main_responsible_manager_id?.toString() || '',
    });
    setSecondaryManagers(project.secondary_responsible_managers?.map(pm => pm.manager) || []);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редагувати проект</DialogTitle>
          <DialogDescription>
            Змініть інформацію про проект та натисніть "Зберегти"
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Завантаження...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Назва проекту */}
            <div className="space-y-2">
              <Label htmlFor="name">Назва проекту</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введіть назву проекту"
              />
            </div>

            {/* Опис проекту */}
            <div className="space-y-2">
              <Label htmlFor="description">Опис проекту</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Введіть опис проекту"
                rows={3}
              />
            </div>

            {/* Прогнозована сума */}
            <div className="space-y-2">
              <Label htmlFor="forecast_amount">Прогнозована сума (грн)</Label>
              <Input
                id="forecast_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.forecast_amount}
                onChange={(e) => handleInputChange('forecast_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Контрагент */}
            <div className="space-y-2">
              <Label>Контрагент</Label>
              <Select
                value={formData.counterparty_id || "none"}
                onValueChange={(value) => handleInputChange('counterparty_id', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть контрагента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не вибрано</SelectItem>
                  {counterparties.map((counterparty) => (
                    <SelectItem key={counterparty.counterparty_id} value={counterparty.counterparty_id.toString()}>
                      {counterparty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Відповідальний менеджер */}
            <div className="space-y-2">
              <Label>Відповідальний менеджер</Label>
              <Select
                value={formData.main_responsible_manager_id || "none"}
                onValueChange={(value) => handleInputChange('main_responsible_manager_id', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть відповідального менеджера" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не вибрано</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.manager_id} value={manager.manager_id.toString()}>
                      {manager.first_name} {manager.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Додаткові менеджери */}
            <div className="space-y-2">
              <Label>Додаткові менеджери</Label>
              
              {/* Поточні додаткові менеджери */}
              {secondaryManagers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {secondaryManagers.map((manager) => (
                    <Badge key={manager.manager_id} variant="secondary" className="flex items-center gap-1">
                      {manager.first_name} {manager.last_name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveSecondaryManager(manager.manager_id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Додавання нового менеджера */}
              {availableManagers.length > 0 && (
                <Select onValueChange={handleAddSecondaryManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Додати менеджера" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableManagers.map((manager) => (
                      <SelectItem key={manager.manager_id} value={manager.manager_id.toString()}>
                        <div className="flex items-center gap-2">
                          <Plus className="h-3 w-3" />
                          {manager.first_name} {manager.last_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={saving}>
                Скасувати
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
                {saving ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}