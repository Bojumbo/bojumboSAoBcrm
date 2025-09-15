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
import { Package, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProjectProduct {
  project_product_id: number;
  quantity: number;
  product?: {
    product_id: number;
    name: string;
    sku: string;
    description?: string;
    price: string;
    unit?: {
      unit_id: number;
      name: string;
    };
  };
}

interface EditProductInProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
  projectProduct: ProjectProduct | null;
  projectId: number;
}

export default function EditProductInProjectDialog({
  isOpen,
  onClose,
  onProductUpdated,
  projectProduct,
  projectId,
}: EditProductInProjectDialogProps) {
  const [quantity, setQuantity] = useState<string>('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Встановлення початкової кількості при відкритті діалогу
  useEffect(() => {
    if (projectProduct && isOpen) {
      setQuantity(projectProduct.quantity?.toString() || '1');
      setError(null);
    }
  }, [projectProduct, isOpen]);

  const handleSubmit = async () => {
    if (!projectProduct || !quantity) {
      setError('Введіть кількість');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Кількість повинна бути додатнім числом');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/products/${projectProduct.project_product_id}`,
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
        onProductUpdated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Помилка оновлення товару');
      }
    } catch (error) {
      console.error('Error updating product:', error);
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
    if (!projectProduct?.product || !quantity) return 0;
    const quantityNum = parseInt(quantity) || 0;
    const price = parseFloat(projectProduct.product.price) || 0;
    return price * quantityNum;
  };

  if (!projectProduct?.product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Редагувати товар у проекті
          </DialogTitle>
          <DialogDescription>
            Змініть кількість товару в проекті
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {/* Інформація про товар */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <span>Товар:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{projectProduct.product.name}</span>
                <Badge variant="outline" className="text-xs">
                  {projectProduct.product.sku}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Ціна за одиницю:</span>
              <span>{formatCurrency(parseFloat(projectProduct.product.price) || 0)}</span>
            </div>
            {projectProduct.product.description && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {projectProduct.product.description}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Кількість</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Введіть кількість"
            />
          </div>

          {quantity && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center text-sm">
                <span>Нова кількість:</span>
                <span className="font-medium">
                  {quantity}{projectProduct.product.unit && ` ${projectProduct.product.unit.name}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                <span>Нова загальна сума:</span>
                <Badge variant="secondary" className="text-green-600">
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