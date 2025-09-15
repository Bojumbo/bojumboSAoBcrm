'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProjectService {
  project_service_id: number;
  quantity: number;
  service?: {
    service_id: number;
    name: string;
    description?: string;
    price: string;
  };
}

interface EditServiceInProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceUpdated: () => void;
  projectService: ProjectService | null;
  projectId: number;
}

export default function EditServiceInProjectDialog({
  isOpen,
  onClose,
  onServiceUpdated,
  projectService,
  projectId,
}: EditServiceInProjectDialogProps) {
  const [quantity, setQuantity] = useState<string>('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Встановлення початкової кількості при відкритті діалогу
  useEffect(() => {
    if (projectService && isOpen) {
      setQuantity(projectService.quantity?.toString() || '1');
      setError(null);
    }
  }, [projectService, isOpen]);

  const handleSubmit = async () => {
    if (!projectService || !quantity) {
      setError('Введіть кількість');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Кількість повинна бути додатнім числом');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/services/${projectService.project_service_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: quantityNum,
          }),
        }
      );

      if (response.ok) {
        onServiceUpdated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Помилка оновлення послуги');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      setError('Помилка підключення до сервера');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantity('1');
    setError(null);
    onClose();
  };

  const calculateTotal = () => {
    if (!projectService?.service || !quantity) return 0;
    const quantityNum = parseFloat(quantity) || 0;
    const price = parseFloat(projectService.service.price) || 0;
    return price * quantityNum;
  };

  if (!projectService?.service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Редагувати послугу у проекті
          </DialogTitle>
          <DialogDescription>
            Змініть кількість послуги в проекті
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {/* Інформація про послугу */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <span>Послуга:</span>
              <span className="font-medium">{projectService.service.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Ціна за одиницю:</span>
              <span>{formatCurrency(parseFloat(projectService.service.price) || 0)}</span>
            </div>
            {projectService.service.description && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {projectService.service.description}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Кількість</Label>
            <Input
              id="quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Введіть кількість"
            />
          </div>

          {quantity && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center text-sm">
                <span>Нова кількість:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                <span>Нова загальна сума:</span>
                <Badge variant="secondary" className="text-blue-600">
                  {formatCurrency(calculateTotal())}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !quantity}>
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Оновлення...
              </div>
            ) : (
              'Зберегти'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}