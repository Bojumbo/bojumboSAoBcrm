'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Package, DollarSign, FileText, Ruler } from 'lucide-react';
import { ProductWithRelations, Unit, Warehouse, CreateProductRequest } from '@/types/products';
import { productService } from '@/services/productService';

interface ProductFormProps {
  product?: ProductWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductForm({ product, isOpen, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    unit_id: undefined,
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stocks, setStocks] = useState<{ warehouse_id: number; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
      fetchWarehouses();
      
      if (product) {
        // Редагування існуючого товару
        setFormData({
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          price: product.price,
          unit_id: product.unit_id || undefined,
        });
        
        // Завантажуємо інформацію про склади
        if (product.stocks) {
          setStocks(product.stocks.map(stock => ({
            warehouse_id: stock.warehouse_id,
            quantity: stock.quantity
          })));
        }
      } else {
        // Створення нового товару
        resetForm();
      }
    }
  }, [isOpen, product]);

  const fetchUnits = async () => {
    try {
      const data = await productService.getUnits();
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await productService.getWarehouses();
      setWarehouses(data);
      
      // Ініціалізуємо склади з нульовою кількістю для нового товару
      if (!product) {
        setStocks(data.map(warehouse => ({
          warehouse_id: warehouse.warehouse_id,
          quantity: 0
        })));
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      price: 0,
      unit_id: undefined,
    });
    setStocks([]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Назва товару є обов\'язковою';
    }

    // SKU не обов'язкове - може бути автогенероване
    if (formData.sku && formData.sku.trim() && formData.sku.length < 2) {
      newErrors.sku = 'Артикул повинен містити принаймні 2 символи';
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
      if (product) {
        // Оновлення існуючого товару
        await productService.update(product.product_id, formData);
        
        // Оновлюємо склади
        if (stocks.length > 0) {
          await productService.setProductStocks(product.product_id, stocks);
        }
      } else {
        // Створення нового товару
        const newProduct = await productService.create(formData);
        
        // Встановлюємо склади для нового товару
        if (stocks.length > 0) {
          await productService.setProductStocks(newProduct.product_id, stocks);
        }
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      // Не логуємо помилки валідації як неочікувані
      const isValidationError = error.message && (
        error.message.includes('Артикул (SKU) вже існує') ||
        error.message.includes('не унікальні') ||
        error.message.includes('вже використовується')
      );
      
      if (!isValidationError) {
        console.error('Error saving product:', error);
      }
      
      // Перевіряємо чи це помилка дублювання SKU
      if (error.message && (
        error.message.includes('Артикул (SKU) вже існує') ||
        error.message.includes('не унікальні') ||
        error.message.includes('вже використовується')
      )) {
        setErrors({ sku: 'Цей артикул вже використовується. Будь ласка, оберіть інший або згенеруйте новий.' });
      } else if (error.message && error.message.toLowerCase().includes('sku')) {
        setErrors({ sku: 'Помилка з артикулом товару: ' + error.message });
      } else {
        setErrors({ submit: 'Помилка при збереженні товару: ' + (error.message || 'Невідома помилка') });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateProductRequest, value: any) => {
    // Спеціальна обробка для unit_id
    if (field === 'unit_id') {
      const processedValue = value === "null" ? undefined : (value ? parseInt(value) : undefined);
      setFormData(prev => ({ ...prev, [field]: processedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Очищаємо помилку для поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateSKU = () => {
    // Створюємо SKU тільки з цифр
    const timestamp = Date.now().toString();
    const sku = timestamp.slice(-6); // Беремо останні 6 цифр
    
    handleInputChange('sku', sku);
  };

  const handleStockChange = (warehouseId: number, quantity: number) => {
    setStocks(prev => prev.map(stock => 
      stock.warehouse_id === warehouseId 
        ? { ...stock, quantity: Math.max(0, quantity) }
        : stock
    ));
  };

  const selectedUnit = units.find(unit => unit.unit_id === formData.unit_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product ? 'Редагувати товар' : 'Додати новий товар'}
          </DialogTitle>
          <DialogDescription>
            {product 
              ? 'Внесіть зміни в інформацію про товар' 
              : 'Заповніть інформацію про новий товар'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основна інформація */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Основна інформація
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Назва */}
              <div className="space-y-2">
                <Label htmlFor="name">Назва товару *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введіть назву товару"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Артикул */}
              <div className="space-y-2">
                <Label htmlFor="sku">Артикул (SKU)</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Введіть артикул (літери/цифри) або залиште порожнім"
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                    className="whitespace-nowrap"
                  >
                    Згенерувати
                  </Button>
                </div>
                {errors.sku && (
                  <p className="text-sm text-red-500">{errors.sku}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Автогенерація створює цифровий код. Вручну можна вводити будь-які символи.
                </p>
              </div>

              {/* Опис */}
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Введіть опис товару"
                  rows={3}
                />
              </div>

              {/* Ціна та одиниця виміру */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Одиниця виміру</Label>
                  <Select 
                    value={formData.unit_id ? formData.unit_id.toString() : "null"} 
                    onValueChange={(value) => handleInputChange('unit_id', value)}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Оберіть одиницю" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Без одиниці</SelectItem>
                      {units.map(unit => (
                        <SelectItem key={unit.unit_id} value={unit.unit_id.toString()}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Інформація про обрану одиницю */}
              {selectedUnit && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedUnit.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Створено: {new Date(selectedUnit.created_at).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Склади */}
          {warehouses.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Кількість на складах
                </CardTitle>
                <CardDescription>
                  Вкажіть кількість товару на кожному складі
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warehouses.map(warehouse => {
                    const stock = stocks.find(s => s.warehouse_id === warehouse.warehouse_id);
                    return (
                      <div key={warehouse.warehouse_id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{warehouse.name}</div>
                          <div className="text-sm text-muted-foreground">{warehouse.location}</div>
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="0"
                            value={stock?.quantity || 0}
                            onChange={(e) => handleStockChange(
                              warehouse.warehouse_id, 
                              parseInt(e.target.value) || 0
                            )}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Загальна кількість:</span>
                    <Badge variant="default">
                      {stocks.reduce((total, stock) => total + stock.quantity, 0)}
                      {selectedUnit && ` ${selectedUnit.name}`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Помилки */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : (product ? 'Зберегти зміни' : 'Створити товар')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}