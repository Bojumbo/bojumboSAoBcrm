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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, Loader2, Search } from 'lucide-react';
import { Product } from '@/types/projects';

interface AddProductToProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  projectId: number;
}

export default function AddProductToProjectDialog({
  isOpen,
  onClose,
  onProductAdded,
  projectId,
}: AddProductToProjectDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Завантаження списку товарів
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Products API response:', result);
        
        let data;
        if (result.success && result.data) {
          data = result.data;
        } else {
          data = result;
        }
        
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setError('Помилка завантаження товарів');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Помилка підключення до сервера');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProductId || !quantity) {
      setError('Оберіть товар та вкажіть кількість');
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: parseInt(selectedProductId),
            quantity: quantityNum,
          }),
        }
      );

      if (response.ok) {
        onProductAdded();
        onClose();
        // Скидаємо форму
        setSelectedProductId('');
        setQuantity('1');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Помилка додавання товару');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Помилка підключення до сервера');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProductId('');
    setQuantity('1');
    setSearchTerm('');
    setError(null);
    onClose();
  };

  const selectedProduct = products.find(p => p.product_id.toString() === selectedProductId);

  // Фільтрація товарів за пошуковим терміном
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const calculateTotal = () => {
    if (!selectedProduct || !quantity) return 0;
    const quantityNum = parseInt(quantity) || 0;
    const price = parseFloat(selectedProduct.price) || 0;
    return price * quantityNum;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Додати товар до проекту
          </DialogTitle>
          <DialogDescription>
            Оберіть товар та вкажіть кількість для додавання до проекту
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="product">Товар</Label>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Завантаження..." : "Оберіть товар"} />
              </SelectTrigger>
              <SelectContent>
                <div className="sticky top-0 bg-background p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Пошук по назві або SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8"
                    />
                  </div>
                </div>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Завантаження...
                    </div>
                  </SelectItem>
                ) : filteredProducts.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    {searchTerm ? 'Товари не знайдено' : 'Немає доступних товарів'}
                  </SelectItem>
                ) : (
                  filteredProducts.map((product) => (
                    <SelectItem key={product.product_id} value={product.product_id.toString()}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{product.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {product.sku}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(product.price)}
                          {product.unit && ` / ${product.unit.name}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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

          {selectedProduct && quantity && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center text-sm">
                <span>Товар:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedProduct.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedProduct.sku}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Ціна за одиницю:</span>
                <span>{formatCurrency(selectedProduct.price)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Кількість:</span>
                <span>{quantity}{selectedProduct.unit && ` ${selectedProduct.unit.name}`}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                <span>Загальна сума:</span>
                <Badge variant="secondary" className="text-green-600">
                  {formatCurrency(calculateTotal())}
                </Badge>
              </div>
              {selectedProduct.description && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {selectedProduct.description}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedProductId || !quantity}>
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Додавання...
              </div>
            ) : (
              'Додати'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}