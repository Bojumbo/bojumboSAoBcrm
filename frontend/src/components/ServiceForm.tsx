'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, DollarSign, FileText } from 'lucide-react';
import { ServiceWithRelations, ServiceInput } from '@/types/services';
import { serviceService } from '@/services/serviceService';

interface ServiceFormProps {
  service?: ServiceWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ServiceForm({ service, isOpen, onClose, onSave }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceInput>({
    name: '',
    description: '',
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (service) {
        // Редагування існуючої послуги
        setFormData({
          name: service.name,
          description: service.description || '',
          price: service.price,
        });
      } else {
        // Створення нової послуги
        resetForm();
      }
    }
  }, [isOpen, service]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Назва послуги є обов\'язковою';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Ціна повинна бути більше 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (service) {
        // Оновлення існуючої послуги
        await serviceService.update(service.service_id, formData);
      } else {
        // Створення нової послуги
        await serviceService.create(formData);
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving service:', error);
      setErrors({ submit: 'Помилка при збереженні послуги: ' + (error.message || 'Невідома помилка') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServiceInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаємо помилку для поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {service ? 'Редагувати послугу' : 'Додати нову послугу'}
          </DialogTitle>
          <DialogDescription>
            {service 
              ? 'Внесіть зміни в інформацію про послугу' 
              : 'Заповніть інформацію про нову послугу'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основна інформація */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Інформація про послугу
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Назва */}
              <div className="space-y-2">
                <Label htmlFor="name">Назва послуги *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введіть назву послуги"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Опис */}
              <div className="space-y-2">
                <Label htmlFor="description">Опис послуги</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Введіть опис послуги (необов'язково)"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Ціна */}
              <div className="space-y-2">
                <Label htmlFor="price">Ціна *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Вартість: {new Intl.NumberFormat('uk-UA', {
                    style: 'currency',
                    currency: 'UAH',
                    minimumFractionDigits: 2,
                  }).format(formData.price)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Помилка відправки */}
          {errors.submit && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : (service ? 'Зберегти зміни' : 'Створити послугу')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}