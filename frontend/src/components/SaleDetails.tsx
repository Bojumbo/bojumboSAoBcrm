'use client';

import React from 'react';
import { Sale } from '@/services/salesService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { translateCounterpartyType, formatDate, formatCurrency } from '@/lib/utils';

interface SaleDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onEdit: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Оплачено':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Відтермінована оплата':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Не оплачено':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function SaleDetails({ open, onOpenChange, sale, onEdit }: SaleDetailsProps) {
  if (!sale) {
    return null;
  }

  const calculateSaleTotal = () => {
    let total = 0;
    
    // Додаємо вартість продуктів
    sale.products?.forEach(saleProduct => {
      total += (saleProduct.product?.price || 0) * saleProduct.quantity;
    });
    
    // Додаємо вартість послуг
    sale.services?.forEach(saleService => {
      total += (saleService.service?.price || 0) * (saleService.quantity || 1);
    });
    
    return total;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Деталі продажу #{sale.sale_id}</DialogTitle>
          <DialogDescription>
            Повна інформація про продаж
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основна інформація */}
          <Card>
            <CardHeader>
              <CardTitle>Основна інформація</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Контрагент</p>
                  <div>
                    <p className="text-base font-semibold">
                      {sale.counterparty?.name || 'Не вказано'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {translateCounterpartyType(sale.counterparty?.counterparty_type || '')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Відповідальний менеджер</p>
                  <p className="text-base">
                    {sale.responsible_manager?.first_name} {sale.responsible_manager?.last_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Дата продажу</p>
                  <p className="text-base">{formatDate(sale.sale_date)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Статус</p>
                  <Badge className={getStatusColor(sale.status)}>
                    {sale.status}
                  </Badge>
                </div>

                {sale.project && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Проект</p>
                    <div>
                      <p className="text-base font-semibold">{sale.project.name}</p>
                      {sale.subproject && (
                        <p className="text-sm text-muted-foreground">
                          Підпроект: {sale.subproject.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {sale.deferred_payment_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Дата відтермінованої оплати</p>
                    <p className="text-base">{formatDate(sale.deferred_payment_date)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Створено</p>
                  <p className="text-base">{formatDate(sale.created_at)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Оновлено</p>
                  <p className="text-base">{formatDate(sale.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Продукти */}
          {sale.products && sale.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Продукти</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sale.products.map((saleProduct, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">
                            {saleProduct.product?.name || 'Назва не вказана'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Кількість: {saleProduct.quantity}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ціна за одиницю: {formatCurrency(saleProduct.product?.price || 0)}
                            {saleProduct.product?.unit && ` / ${saleProduct.product.unit.name}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency((saleProduct.product?.price || 0) * saleProduct.quantity)}
                          </p>
                        </div>
                      </div>
                      {index < sale.products!.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Послуги */}
          {sale.services && sale.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Послуги</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sale.services.map((saleService, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">
                            {saleService.service?.name || 'Назва не вказана'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Кількість: {saleService.quantity || 1}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ціна за одиницю: {formatCurrency(saleService.service?.price || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency((saleService.service?.price || 0) * (saleService.quantity || 1))}
                          </p>
                        </div>
                      </div>
                      {index < sale.services!.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Загальна сума */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Загальна сума:</p>
                <p className="text-xl font-bold">
                  {formatCurrency(calculateSaleTotal())}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрити
          </Button>
          <Button onClick={onEdit}>
            Редагувати
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}