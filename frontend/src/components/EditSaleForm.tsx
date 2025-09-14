'use client';

import React, { useState, useEffect } from 'react';
import { Sale, UpdateSaleData } from '@/services/salesService';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { counterpartyService } from '@/services/counterpartyService';
import { productService } from '@/services/productService';
import { serviceService } from '@/services/serviceService';
import { projectsAPI } from '@/lib/api';
import { translateCounterpartyType } from '@/lib/utils';

interface Counterparty {
  counterparty_id: number;
  name: string;
  counterparty_type: string;
}

interface Product {
  product_id: number;
  name: string;
  price: number;
  unit?: {
    name: string;
  };
}

interface Service {
  service_id: number;
  name: string;
  price: number;
}

interface Project {
  project_id: number;
  name: string;
}

interface EditSaleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: UpdateSaleData) => Promise<void>;
  sale: Sale | null;
  loading?: boolean;
}

interface SaleProduct {
  product_id: number;
  quantity: number;
}

interface SaleService {
  service_id: number;
  quantity: number;
}

export default function EditSaleForm({ open, onOpenChange, onSubmit, sale, loading = false }: EditSaleFormProps) {
  const [formData, setFormData] = useState<UpdateSaleData>({});
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const statusOptions = [
    { value: 'Оплачено', label: 'Оплачено' },
    { value: 'Відтермінована оплата', label: 'Відтермінована оплата' },
    { value: 'Не оплачено', label: 'Не оплачено' },
  ];

  useEffect(() => {
    if (open && sale) {
      loadFormData();
      setFormData({
        counterparty_id: sale.counterparty_id,
        sale_date: sale.sale_date.split('T')[0],
        status: sale.status,
        deferred_payment_date: sale.deferred_payment_date?.split('T')[0] || undefined,
        project_id: sale.project_id || undefined,
        subproject_id: sale.subproject_id || undefined,
        products: sale.products?.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity
        })) || [],
        services: sale.services?.map(s => ({
          service_id: s.service_id,
          quantity: s.quantity || 1
        })) || [],
      });
    }
  }, [open, sale]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      
      // Load counterparties
      try {
        const counterpartiesRes = await counterpartyService.getAll();
        setCounterparties(counterpartiesRes);
      } catch (error) {
        console.error('Error loading counterparties:', error);
      }

      // Load products
      try {
        const productsRes = await productService.getAll();
        setProducts(productsRes);
      } catch (error) {
        console.error('Error loading products:', error);
      }

      // Load services
      try {
        const servicesRes = await serviceService.getAll();
        setServices(servicesRes);
      } catch (error) {
        console.error('Error loading services:', error);
      }

      // Load projects
      try {
        const projectsRes = await projectsAPI.getAll();
        if (projectsRes.success && projectsRes.data) {
          setProjects(projectsRes.data);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }

    } catch (error) {
      console.error('Error loading form data:', error);
      alert('Помилка завантаження даних форми');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sale || !formData.counterparty_id) {
      alert('Будь ласка, оберіть контрагента');
      return;
    }

    try {
      await onSubmit(sale.sale_id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...(prev.products || []), { product_id: 0, quantity: 1 }]
    }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products?.filter((_, i) => i !== index) || []
    }));
  };

  const updateProduct = (index: number, field: keyof SaleProduct, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products?.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      ) || []
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), { service_id: 0, quantity: 1 }]
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index) || []
    }));
  };

  const updateService = (index: number, field: keyof SaleService, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      ) || []
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    
    formData.products?.forEach(saleProduct => {
      const product = products.find(p => p.product_id === saleProduct.product_id);
      if (product) {
        total += product.price * saleProduct.quantity;
      }
    });
    
    formData.services?.forEach(saleService => {
      const service = services.find(s => s.service_id === saleService.service_id);
      if (service) {
        total += service.price * (saleService.quantity || 1);
      }
    });
    
    return total;
  };

  if (!sale) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редагувати продаж #{sale.sale_id}</DialogTitle>
          <DialogDescription>
            Внесіть зміни до продажу
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Завантаження даних...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="counterparty">Контрагент *</Label>
                <Select
                  value={formData.counterparty_id?.toString() || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, counterparty_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть контрагента" />
                  </SelectTrigger>
                  <SelectContent>
                    {counterparties.map((counterparty) => (
                      <SelectItem key={counterparty.counterparty_id} value={counterparty.counterparty_id.toString()}>
                        {counterparty.name} ({translateCounterpartyType(counterparty.counterparty_type)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_date">Дата продажу *</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={formData.sale_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус *</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Проект (опціонально)</Label>
                <Select
                  value={formData.project_id?.toString() || ''}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    project_id: value ? parseInt(value) : undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть проект (опціонально)" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.project_id} value={project.project_id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'Відтермінована оплата' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deferred_payment_date">Дата відтермінованої оплати</Label>
                  <Input
                    id="deferred_payment_date"
                    type="date"
                    value={formData.deferred_payment_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, deferred_payment_date: e.target.value }))}
                  />
                </div>
              )}
            </div>

            {/* Продукти */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Продукти</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Додати продукт
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.products && formData.products.length > 0 ? (
                  <div className="space-y-2">
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>Продукт</Label>
                          <Select
                            value={product.product_id?.toString() || ''}
                            onValueChange={(value) => updateProduct(index, 'product_id', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть продукт" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.product_id} value={p.product_id.toString()}>
                                  {p.name} - {p.price} грн{p.unit ? ` / ${p.unit.name}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24">
                          <Label>Кількість</Label>
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Немає доданих продуктів</p>
                )}
              </CardContent>
            </Card>

            {/* Послуги */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Послуги</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Додати послугу
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.services && formData.services.length > 0 ? (
                  <div className="space-y-2">
                    {formData.services.map((service, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>Послуга</Label>
                          <Select
                            value={service.service_id?.toString() || ''}
                            onValueChange={(value) => updateService(index, 'service_id', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть послугу" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((s) => (
                                <SelectItem key={s.service_id} value={s.service_id.toString()}>
                                  {s.name} - {s.price} грн
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24">
                          <Label>Кількість</Label>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={service.quantity}
                            onChange={(e) => updateService(index, 'quantity', parseFloat(e.target.value))}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeService(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Немає доданих послуг</p>
                )}
              </CardContent>
            </Card>

            {/* Загальна сума */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Загальна сума: {new Intl.NumberFormat('uk-UA', {
                      style: 'currency',
                      currency: 'UAH',
                    }).format(calculateTotal())}
                  </p>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Збереження...
                  </>
                ) : (
                  'Зберегти зміни'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}