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
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import { Service } from '@/types/projects';

interface AddServiceToProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
  projectId: number;
}

export default function AddServiceToProjectDialog({
  isOpen,
  onClose,
  onServiceAdded,
  projectId,
}: AddServiceToProjectDialogProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Завантаження списку послуг
  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/services`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Services API response:', result);
        
        let data;
        if (result.success && result.data) {
          data = result.data;
        } else {
          data = result;
        }
        
        setServices(Array.isArray(data) ? data : []);
      } else {
        setError('Помилка завантаження послуг');
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Помилка підключення до сервера');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedServiceId || !quantity) {
      setError('Оберіть послугу та вкажіть кількість');
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/services`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            service_id: parseInt(selectedServiceId),
            quantity: quantityNum,
          }),
        }
      );

      if (response.ok) {
        onServiceAdded();
        onClose();
        // Скидаємо форму
        setSelectedServiceId('');
        setQuantity('1');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Помилка додавання послуги');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      setError('Помилка підключення до сервера');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedServiceId('');
    setQuantity('1');
    setSearchTerm('');
    setError(null);
    onClose();
  };

  const selectedService = services.find(s => s.service_id.toString() === selectedServiceId);

  // Фільтрація послуг за пошуковим терміном
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateTotal = () => {
    if (!selectedService || !quantity) return 0;
    const quantityNum = parseFloat(quantity) || 0;
    const price = parseFloat(selectedService.price) || 0;
    return price * quantityNum;
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Додати послугу до проекту
          </DialogTitle>
          <DialogDescription>
            Оберіть послугу та вкажіть кількість для додавання до проекту
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="service">Послуга</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Завантаження..." : "Оберіть послугу"} />
              </SelectTrigger>
              <SelectContent>
                <div className="sticky top-0 bg-background p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Пошук послуг..."
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
                ) : filteredServices.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    {searchTerm ? 'Послуги не знайдено' : 'Немає доступних послуг'}
                  </SelectItem>
                ) : (
                  filteredServices.map((service) => (
                    <SelectItem key={service.service_id} value={service.service_id.toString()}>
                      <div className="flex flex-col">
                        <span>{service.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(service.price)}
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
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Введіть кількість"
            />
          </div>

          {selectedService && quantity && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center text-sm">
                <span>Послуга:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Ціна за одиницю:</span>
                <span>{formatCurrency(selectedService.price)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Кількість:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                <span>Загальна сума:</span>
                <Badge variant="secondary" className="text-green-600">
                  {formatCurrency(calculateTotal())}
                </Badge>
              </div>
              {selectedService.description && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {selectedService.description}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedServiceId || !quantity}>
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