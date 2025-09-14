'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Wrench, 
  DollarSign, 
  Edit, 
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { ServiceWithRelations } from '@/types/services';
import { serviceService } from '@/services/serviceService';

interface ServicesTableProps {
  onServiceSelect?: (service: ServiceWithRelations) => void;
  onCreateService?: () => void;
  onEditService?: (service: ServiceWithRelations) => void;
  refreshKey?: number;
}

type SortField = 'name' | 'price' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function ServicesTable({ 
  onServiceSelect, 
  onCreateService, 
  onEditService,
  refreshKey
}: ServicesTableProps) {
  const [services, setServices] = useState<ServiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchServicesWithSearch();
  }, [refreshKey]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchServicesWithSearch();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchServicesWithSearch = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAll(searchTerm);
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю послугу?')) {
      return;
    }

    try {
      await serviceService.delete(serviceId);
      await fetchServicesWithSearch(); // Оновлюємо список з поточним пошуком
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Помилка при видаленні послуги');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Фільтрація та сортування
  const filteredAndSortedServices = services
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Завантаження послуг...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок та кнопка створення */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Послуги</h2>
          <p className="text-muted-foreground">
            Управління каталогом послуг компанії
          </p>
        </div>
        <Button onClick={onCreateService} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Додати послугу
        </Button>
      </div>

      {/* Панель пошуку */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук послуг за назвою..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всього послуг</p>
                <p className="text-2xl font-bold">{filteredAndSortedServices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Середня ціна</p>
                <p className="text-xl font-bold">
                  {filteredAndSortedServices.length > 0 
                    ? formatCurrency(filteredAndSortedServices.reduce((sum, s) => sum + s.price, 0) / filteredAndSortedServices.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Загальна вартість</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    filteredAndSortedServices.reduce((total, service) => 
                      total + service.price, 0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблиця послуг */}
      <Card>
        <CardHeader>
          <CardTitle>Список послуг</CardTitle>
          <CardDescription>
            {filteredAndSortedServices.length} з {services.length} послуг
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedServices.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Послуги не знайдено</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Спробуйте змінити критерії пошуку'
                  : 'Почніть з додавання першої послуги'
                }
              </p>
              {!searchTerm && (
                <Button onClick={onCreateService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Додати послугу
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Назва послуги
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead>Опис</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-2">
                        Ціна
                        {getSortIcon('price')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Створено
                        {getSortIcon('created_at')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedServices.map((service) => (
                    <TableRow key={service.service_id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <button
                            onClick={() => onServiceSelect?.(service)}
                            className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                          >
                            {service.name}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {service.description ? (
                          <span className="text-sm text-muted-foreground truncate block">
                            {service.description.length > 50 
                              ? `${service.description.substring(0, 50)}...`
                              : service.description
                            }
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(service.price)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(service.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onServiceSelect?.(service)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditService?.(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteService(service.service_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}