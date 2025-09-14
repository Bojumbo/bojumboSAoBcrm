'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Package, 
  DollarSign, 
  Edit, 
  Trash2, 
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { ProductWithRelations, Unit } from '@/types/products';
import { productService } from '@/services/productService';

interface ProductsTableProps {
  onProductSelect?: (product: ProductWithRelations) => void;
  onCreateProduct?: () => void;
  onEditProduct?: (product: ProductWithRelations) => void;
  refreshKey?: number;
}

type SortField = 'name' | 'price' | 'created_at' | 'stock';
type SortOrder = 'asc' | 'desc';

export default function ProductsTable({ 
  onProductSelect, 
  onCreateProduct, 
  onEditProduct,
  refreshKey
}: ProductsTableProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchProducts();
    fetchUnits();
  }, []);

  // Оновлення при зміні refreshKey
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      fetchProductsWithSearch();
    }
  }, [refreshKey]);

  // Дебаунсинг для пошуку
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProductsWithSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsWithSearch = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll(searchTerm || undefined);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await productService.getUnits();
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) {
      return;
    }

    try {
      await productService.delete(productId);
      await fetchProductsWithSearch(); // Оновлюємо список з поточним пошуком
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Помилка при видаленні товару');
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

  const getTotalStock = (product: ProductWithRelations) => {
    if (!product.stocks || product.stocks.length === 0) return 0;
    return product.stocks.reduce((total, stock) => total + stock.quantity, 0);
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

  // Фільтрація та сортування (пошук тепер серверний)
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesUnit = selectedUnit === 'all' || 
                         product.unit_id?.toString() === selectedUnit ||
                         (!product.unit_id && selectedUnit === 'no-unit');
      
      return matchesUnit;
    })
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
        case 'stock':
          aValue = getTotalStock(a);
          bValue = getTotalStock(b);
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
            <div className="text-muted-foreground">Завантаження товарів...</div>
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
          <h2 className="text-2xl font-bold">Товари</h2>
          <p className="text-muted-foreground">
            Управління каталогом товарів компанії
          </p>
        </div>
        <Button onClick={onCreateProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Додати товар
        </Button>
      </div>

      {/* Панель фільтрів та пошуку */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Пошук */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук за назвою або SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 items-center">
              {/* Фільтр за одиницею виміру */}
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Одиниця виміру" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі одиниці</SelectItem>
                  <SelectItem value="no-unit">Без одиниці</SelectItem>
                  {units.map(unit => (
                    <SelectItem key={unit.unit_id} value={unit.unit_id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всього товарів</p>
                <p className="text-2xl font-bold">{filteredAndSortedProducts.length}</p>
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
                  {filteredAndSortedProducts.length > 0 
                    ? formatCurrency(filteredAndSortedProducts.reduce((sum, p) => sum + p.price, 0) / filteredAndSortedProducts.length)
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
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">На складі</p>
                <p className="text-xl font-bold">
                  {filteredAndSortedProducts.reduce((total, product) => total + getTotalStock(product), 0)}
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
                    filteredAndSortedProducts.reduce((total, product) => 
                      total + (product.price * getTotalStock(product)), 0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблиця товарів */}
      <Card>
        <CardHeader>
          <CardTitle>Список товарів</CardTitle>
          <CardDescription>
            {filteredAndSortedProducts.length} з {products.length} товарів
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Товари не знайдено</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedUnit !== 'all' 
                  ? 'Спробуйте змінити критерії пошуку або фільтри'
                  : 'Почніть з додавання першого товару'
                }
              </p>
              {(!searchTerm && selectedUnit === 'all') && (
                <Button onClick={onCreateProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Додати товар
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
                        Назва товару
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead>Артикул</TableHead>
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
                    <TableHead>Одиниця</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center gap-2">
                        На складі
                        {getSortIcon('stock')}
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
                  {filteredAndSortedProducts.map((product) => (
                    <TableRow key={product.product_id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {product.description ? (
                          <span className="text-sm text-muted-foreground truncate block">
                            {product.description.length > 50 
                              ? `${product.description.substring(0, 50)}...`
                              : product.description
                            }
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(product.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.unit ? (
                          <Badge variant="outline">{product.unit.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTotalStock(product) > 0 ? 'default' : 'secondary'}>
                          {getTotalStock(product)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(product.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onProductSelect?.(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditProduct?.(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.product_id)}
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