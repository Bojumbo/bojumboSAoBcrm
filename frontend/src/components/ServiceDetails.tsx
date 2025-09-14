'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Wrench, 
  DollarSign, 
  Calendar, 
  Edit, 
  Trash2,
  BarChart3,
  Info
} from 'lucide-react';
import { ServiceWithRelations } from '@/types/services';

interface ServiceDetailsProps {
  service: ServiceWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (service: ServiceWithRelations) => void;
  onDelete: (serviceId: number) => void;
}

export default function ServiceDetails({ 
  service, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ServiceDetailsProps) {
  if (!service) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (confirm('Ви впевнені, що хочете видалити цю послугу?')) {
      onDelete(service.service_id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {service.name}
          </DialogTitle>
          <DialogDescription>
            Детальна інформація про послугу
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основна інформація */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Основна інформація
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Назва</label>
                    <p className="text-lg font-semibold">{service.name}</p>
                  </div>
                  
                  {service.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Опис</label>
                      <p className="text-sm whitespace-pre-wrap">{service.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ціна</label>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Створено</label>
                    <p className="text-sm">{formatDate(service.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Оновлено</label>
                    <p className="text-sm">{formatDate(service.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Інформація
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(service.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">Вартість послуги</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {service.service_id}
                  </div>
                  <div className="text-sm text-muted-foreground">ID послуги</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Дії */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Закрити
            </Button>
            <Button variant="outline" onClick={() => onEdit(service)}>
              <Edit className="h-4 w-4 mr-2" />
              Редагувати
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Видалити
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}