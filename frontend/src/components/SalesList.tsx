'use client';

import React, { useEffect, useState } from 'react';
import { salesService, Sale } from '@/services/salesService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2, Eye, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { translateCounterpartyType, formatDate, formatCurrency } from '@/lib/utils';

interface SalesListProps {
  onEdit: (sale: Sale) => void;
  onView: (sale: Sale) => void;
  onAdd: () => void;
  refreshTrigger?: number;
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

export default function SalesList({ onEdit, onView, onAdd, refreshTrigger }: SalesListProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const salesData = await salesService.getAll();
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
      alert('Помилка завантаження продажів');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [refreshTrigger]);

  const handleDeleteClick = (sale: Sale) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!saleToDelete) return;
    
    try {
      setDeletingId(saleToDelete.sale_id);
      await salesService.delete(saleToDelete.sale_id);
      setSales(prev => prev.filter(sale => sale.sale_id !== saleToDelete.sale_id));
      alert('Продаж успішно видалено');
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Помилка видалення продажу');
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  const formatSaleCurrency = (amount: number) => {
    return formatCurrency(amount);
  };

  const calculateSaleTotal = (sale: Sale) => {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Завантаження продажів...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Список продажів</CardTitle>
              <CardDescription>
                Управління всіма продажами компанії
              </CardDescription>
            </div>
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Додати продаж
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Немає продажів для відображення</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Контрагент</TableHead>
                    <TableHead>Менеджер</TableHead>
                    <TableHead>Дата продажу</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Проект</TableHead>
                    <TableHead>Сума</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.sale_id}>
                      <TableCell className="font-medium">
                        #{sale.sale_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {sale.counterparty?.name || 'Не вказано'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {translateCounterpartyType(sale.counterparty?.counterparty_type || '')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {sale.responsible_manager?.first_name} {sale.responsible_manager?.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(sale.sale_date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.project ? (
                          <div>
                            <div className="font-medium">{sale.project.name}</div>
                            {sale.subproject && (
                              <div className="text-sm text-muted-foreground">
                                {sale.subproject.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Без проекту</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatSaleCurrency(calculateSaleTotal(sale))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(sale)}
                            title="Переглянути"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(sale)}
                            title="Редагувати"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(sale)}
                            title="Видалити"
                            disabled={deletingId === sale.sale_id}
                          >
                            {deletingId === sale.sale_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердження видалення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити продаж #{saleToDelete?.sale_id}? 
              Цю дію неможливо скасувати.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingId !== null}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Видалення...
                </>
              ) : (
                'Видалити'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}