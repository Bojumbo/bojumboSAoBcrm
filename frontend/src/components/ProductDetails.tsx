'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Ruler, 
  Warehouse, 
  Edit, 
  Trash2,
  BarChart3,
  Info
} from 'lucide-react';
import { ProductWithRelations } from '@/types/products';
import { productService } from '@/services/productService';

interface ProductDetailsProps {
  product: ProductWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: ProductWithRelations) => void;
  onDelete: (productId: number) => void;
}

export default function ProductDetails({ 
  product, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ProductDetailsProps) {
  const [loading, setLoading] = useState(false);

  if (!product) {
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

  const getTotalStock = () => {
    if (!product.stocks || product.stocks.length === 0) return 0;
    return product.stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  const handleDelete = () => {
    if (confirm('Ви впевнені, що хочете видалити цей товар?')) {
      onDelete(product.product_id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            Детальна інформація про товар
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
                    <p className="text-lg font-semibold">{product.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Артикул (SKU)</label>
                    <code className="text-lg font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      {product.sku}
                    </code>
                  </div>
                  
                  {product.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Опис</label>
                      <p className="text-sm">{product.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ціна</label>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>

                  {product.unit && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-blue-600" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Одиниця виміру</label>
                        <div>
                          <Badge variant="outline">{product.unit.name}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Створено</label>
                    <p className="text-sm">{formatDate(product.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Оновлено</label>
                    <p className="text-sm">{formatDate(product.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Склади */}
          {product.stocks && product.stocks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  Інформація про склади
                </CardTitle>
                <CardDescription>
                  Кількість товару на кожному складі
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.stocks.map((stock) => (
                    <div key={stock.product_stock_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{stock.warehouse.name}</div>
                        <div className="text-sm text-muted-foreground">{stock.warehouse.location}</div>
                      </div>
                      <Badge variant={stock.quantity > 0 ? 'default' : 'secondary'}>
                        {stock.quantity} {product.unit?.name || 'шт.'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Загальна кількість на складах:</span>
                  <Badge variant="default" className="text-lg">
                    {getTotalStock()} {product.unit?.name || 'шт.'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{getTotalStock()}</div>
                  <div className="text-sm text-muted-foreground">Загальна кількість</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(product.price * getTotalStock())}
                  </div>
                  <div className="text-sm text-muted-foreground">Загальна вартість</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {product.stocks?.filter(s => s.quantity > 0).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Складів у наявності</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Дії */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Закрити
            </Button>
            <Button variant="outline" onClick={() => onEdit(product)}>
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