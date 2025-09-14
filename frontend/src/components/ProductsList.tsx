'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Package, 
  DollarSign, 
  Edit, 
  Trash2, 
  Filter,
  Grid,
  List,
  Warehouse
} from 'lucide-react';
import { ProductWithRelations, Unit } from '@/types/products';
import { productService } from '@/services/productService';

interface ProductsListProps {
  onProductSelect?: (product: ProductWithRelations) => void;
  onCreateProduct?: () => void;
  onEditProduct?: (product: ProductWithRelations) => void;
}

export default function ProductsList({ 
  onProductSelect, 
  onCreateProduct, 
  onEditProduct 
}: ProductsListProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchProducts();
    fetchUnits();
  }, []);

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
      await fetchProducts(); // Оновлюємо список
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

  const getTotalStock = (product: ProductWithRelations) => {
    if (!product.stocks || product.stocks.length === 0) return 0;
    return product.stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  // Фільтрація та сортування
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.unit?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUnit = selectedUnit === 'all' || 
                         product.unit_id?.toString() === selectedUnit ||
                         (!product.unit_id && selectedUnit === 'no-unit');
      
      return matchesSearch && matchesUnit;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
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
                placeholder="Пошук товарів..."
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

              {/* Сортування */}
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as 'name' | 'price' | 'created_at');
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Сортування" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Назва А-Я</SelectItem>
                  <SelectItem value="name-desc">Назва Я-А</SelectItem>
                  <SelectItem value="price-asc">Ціна ↑</SelectItem>
                  <SelectItem value="price-desc">Ціна ↓</SelectItem>
                  <SelectItem value="created_at-desc">Нові спочатку</SelectItem>
                  <SelectItem value="created_at-asc">Старі спочатку</SelectItem>
                </SelectContent>
              </Select>

              {/* Переключення режиму відображення */}
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-3">
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
                <p className="text-2xl font-bold">
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
              <Warehouse className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">На складі</p>
                <p className="text-2xl font-bold">
                  {filteredAndSortedProducts.reduce((total, product) => total + getTotalStock(product), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список товарів */}
      {filteredAndSortedProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
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
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'space-y-4'
        }>
          {filteredAndSortedProducts.map((product) => (
            <Card 
              key={product.product_id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                viewMode === 'list' ? 'p-0' : ''
              }`}
              onClick={() => onProductSelect?.(product)}
            >
              <CardHeader className={viewMode === 'list' ? 'pb-2' : 'pb-3'}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {product.name}
                      {product.unit && (
                        <Badge variant="outline" className="text-xs">
                          {product.unit.name}
                        </Badge>
                      )}
                    </CardTitle>
                    {product.description && (
                      <CardDescription className="text-sm mt-1">
                        {viewMode === 'list' 
                          ? product.description 
                          : product.description.length > 60 
                            ? `${product.description.substring(0, 60)}...`
                            : product.description
                        }
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className={viewMode === 'list' ? 'pt-0' : 'pt-0'}>
                <div className={viewMode === 'list' 
                  ? 'flex items-center justify-between gap-4'
                  : 'space-y-3'
                }>
                  <div className={viewMode === 'list' ? 'flex items-center gap-6' : 'space-y-2'}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ціна:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">На складі:</span>
                      <Badge variant={getTotalStock(product) > 0 ? 'default' : 'secondary'}>
                        {getTotalStock(product)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className={`flex gap-2 ${viewMode === 'list' ? '' : 'mt-4'}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct?.(product);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Редагувати
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.product_id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}