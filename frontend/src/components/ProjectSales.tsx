'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, Search, Calendar, DollarSign, User, Building } from 'lucide-react';
import { Sale } from '@/types/projects';
import { UpdateSaleData } from '@/services/salesService';
import { salesService } from '@/services/salesService';
import SaleDetails from './SaleDetails';
import EditSaleForm from './EditSaleForm';

interface ProjectSalesProps {
  projectId: number;
}

export default function ProjectSales({ projectId }: ProjectSalesProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [projectId]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/sales`);

      if (response.ok) {
        const result = await response.json();
        console.log('Sales API response:', result);
        
        // Перевіряємо формат відповіді
        let data;
        if (result.success && result.data) {
          data = result.data;
        } else {
          data = result;
        }
        
        setSales(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch sales:', response.status);
        setSales([]);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'новий':
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'в обробці':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'завершено':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'скасовано':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalAmount = (sale: Sale) => {
    // Для демонстрації повертаємо базову суму
    // В реальному проекті тут буде логіка розрахунку на основі товарів та послуг
    return Math.floor(Math.random() * 50000) + 10000; // Тимчасово для демонстрації
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditOpen(true);
  };

  const handleSaleUpdated = () => {
    fetchSales(); // Перезавантажуємо список продажів
    setIsEditOpen(false);
    setSelectedSale(null);
  };

  const handleUpdateSale = async (id: number, data: UpdateSaleData) => {
    try {
      await salesService.update(id, data);
      handleSaleUpdated();
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  };

  const filteredSales = Array.isArray(sales) ? sales.filter(sale =>
    sale.counterparty?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.responsible_manager?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.responsible_manager?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + calculateTotalAmount(sale), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Завантаження продажів...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 min-h-[600px]">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Продажі проекту</h3>
          <p className="text-sm text-muted-foreground">
            Управління продажами пов'язаними з проектом
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Створити продаж
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Всього продажів</p>
                <p className="text-2xl font-bold">{filteredSales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Загальна сума</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalSalesAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Середня сума</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(filteredSales.length > 0 ? totalSalesAmount / filteredSales.length : 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Пошук */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук по контрагенту або менеджеру..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Список продажів */}
      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Продажі не знайдено' : 'Немає продажів'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Спробуйте змінити критерії пошуку' 
                : 'Створіть перший продаж для цього проекту'
              }
            </p>
            {!searchTerm && (
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Створити продаж
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSales.map((sale) => (
            <Card key={sale.sale_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Продаж #{sale.sale_id}
                      <Badge 
                        variant="secondary"
                        className={getStatusColor(sale.status)}
                      >
                        {sale.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Дата: {formatDate(sale.sale_date)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculateTotalAmount(sale))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Контрагент:</span>
                      <span className="font-medium">
                        {sale.counterparty?.name || 'Не вказано'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Менеджер:</span>
                      <span className="font-medium">
                        {sale.responsible_manager 
                          ? `${sale.responsible_manager.first_name} ${sale.responsible_manager.last_name}`
                          : 'Не вказано'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Створено:</span>
                      <span>{formatDate(sale.created_at)}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">ID продажу: </span>
                      <Badge variant="outline">{sale.sale_id}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditSale(sale)}
                  >
                    Редагувати
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewSale(sale)}
                  >
                    Переглянути
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Діалог перегляду продажу */}
      <SaleDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        sale={selectedSale}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        }}
      />

      {/* Діалог редагування продажу */}
      <EditSaleForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        sale={selectedSale}
        onSubmit={handleUpdateSale}
      />
    </div>
  );
}