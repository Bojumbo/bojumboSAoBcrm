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
import { SubProject, SubProjectFunnel } from '@/types/projects';
import { subprojectsAPI, subprojectFunnelsAPI } from '@/lib/api';

interface SubProjectEditDialogProps {
  subproject: SubProject;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSubproject: SubProject) => void;
}

export default function SubProjectEditDialog({
  subproject,
  isOpen,
  onClose,
  onSave,
}: SubProjectEditDialogProps) {
  const [formData, setFormData] = useState({
    name: subproject.name,
    description: subproject.description || '',
    cost: subproject.cost.toString(),
    sub_project_funnel_id: subproject.sub_project_funnel_id?.toString() || 'none',
    sub_project_funnel_stage_id: subproject.sub_project_funnel_stage_id?.toString() || 'none',
  });

  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Скидання форми при відкритті діалогу
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: subproject.name,
        description: subproject.description || '',
        cost: subproject.cost.toString(),
        sub_project_funnel_id: subproject.sub_project_funnel_id?.toString() || 'none',
        sub_project_funnel_stage_id: subproject.sub_project_funnel_stage_id?.toString() || 'none',
      });
      fetchFunnels();
    }
  }, [isOpen, subproject]);

  const fetchFunnels = async () => {
    try {
      setLoading(true);
      const response = await subprojectFunnelsAPI.getAll();
      if (response.success && response.data) {
        setFunnels(response.data);
      }
    } catch (error) {
      console.error('Error fetching funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        description: formData.description || undefined,
        cost: formData.cost, // Залишаємо як рядок, оскільки API очікує строку
        sub_project_funnel_id: formData.sub_project_funnel_id === 'none' ? undefined : parseInt(formData.sub_project_funnel_id),
        sub_project_funnel_stage_id: formData.sub_project_funnel_stage_id === 'none' ? undefined : parseInt(formData.sub_project_funnel_stage_id),
      };

      // Оновлюємо підпроект через API
      const response = await subprojectsAPI.update(subproject.subproject_id, updateData);

      if (response.success && response.data) {
        onSave(response.data);
      } else {
        throw new Error(response.error || 'Помилка оновлення підпроекту');
      }
    } catch (error) {
      console.error('Error saving subproject:', error);
      alert('Помилка при збереженні підпроекту. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Скидаємо форму до початкових значень
    setFormData({
      name: subproject.name,
      description: subproject.description || '',
      cost: subproject.cost.toString(),
      sub_project_funnel_id: subproject.sub_project_funnel_id?.toString() || 'none',
      sub_project_funnel_stage_id: subproject.sub_project_funnel_stage_id?.toString() || 'none',
    });
    onClose();
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.cost && 
           !isNaN(parseFloat(formData.cost)) && 
           parseFloat(formData.cost) >= 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редагувати підпроект</DialogTitle>
          <DialogDescription>
            Внесіть зміни до підпроекту "{subproject.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Назва підпроекту */}
          <div className="space-y-2">
            <Label htmlFor="name">Назва підпроекту *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Введіть назву підпроекту"
              className="w-full"
            />
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Введіть опис підпроекту"
              className="w-full min-h-[100px]"
            />
          </div>

          {/* Вартість, воронка та етап */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Вартість */}
            <div className="space-y-2">
              <Label htmlFor="cost">Вартість (₴) *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </div>

            {/* Воронка */}
            <div className="space-y-2">
              <Label htmlFor="funnel">Воронка</Label>
              <Select
                value={formData.sub_project_funnel_id}
                onValueChange={(value) => {
                  handleInputChange('sub_project_funnel_id', value);
                  // Скидаємо етап при зміні воронки
                  handleInputChange('sub_project_funnel_stage_id', 'none');
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Виберіть воронку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не вибрано</SelectItem>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.sub_project_funnel_id} value={funnel.sub_project_funnel_id.toString()}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Етап воронки */}
            <div className="space-y-2">
              <Label htmlFor="stage">Етап</Label>
              <Select
                value={formData.sub_project_funnel_stage_id}
                onValueChange={(value) => handleInputChange('sub_project_funnel_stage_id', value)}
                disabled={loading || formData.sub_project_funnel_id === 'none'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Виберіть етап" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не вибрано</SelectItem>
                  {formData.sub_project_funnel_id !== 'none' && 
                    funnels
                      .find(f => f.sub_project_funnel_id.toString() === formData.sub_project_funnel_id)
                      ?.stages?.map((stage) => (
                        <SelectItem 
                          key={stage.sub_project_funnel_stage_id} 
                          value={stage.sub_project_funnel_stage_id.toString()}
                        >
                          {stage.name}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Інформація про проект */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">
              Проект: #{subproject.project_id}
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Підпроект належить до проекту з ID {subproject.project_id}
            </p>
          </div>
        </div>

        {/* Кнопки дій */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Скасувати
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !isFormValid()}
          >
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}