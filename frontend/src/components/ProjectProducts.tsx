'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  ShoppingCart, 
  Search, 
  Package, 
  DollarSign, 
  Hash, 
  Trash2, 
  Edit,
  Settings
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProjectProduct, ProjectService } from '@/types/projects';
import AddProductToProjectDialog from './AddProductToProjectDialog';
import AddServiceToProjectDialog from './AddServiceToProjectDialog';
import EditProductInProjectDialog from './EditProductInProjectDialog';
import EditServiceInProjectDialog from './EditServiceInProjectDialog';

interface ProjectProductsProps {
  projectId: number;
}

export default function ProjectProducts({ projectId }: ProjectProductsProps) {
  const [products, setProducts] = useState<ProjectProduct[]>([]);
  const [services, setServices] = useState<ProjectService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProjectProduct | null>(null);
  const [editingService, setEditingService] = useState<ProjectService | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [projectId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Products API response:', result);
        
        // Перевіряємо формат відповіді
        let data;
        if (result.success && result.data) {
          data = result.data;
        } else {
          data = result;
        }
        
        // Припускаємо, що API повертає як товари так і послуги
        setProducts(Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : []);
        setServices(Array.isArray(data.services) ? data.services : []);
      } else {
        console.error('Failed to fetch products:', response.status);
        setProducts([]);
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (projectProductId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей товар з проекту?')) {
      return;
    }

    try {
      setDeletingProductId(projectProductId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/products/${projectProductId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Оновлюємо список товарів
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Помилка видалення товару');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Помилка підключення до сервера');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDeleteService = async (projectServiceId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю послугу з проекту?')) {
      return;
    }

    try {
      setDeletingServiceId(projectServiceId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/services/${projectServiceId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Оновлюємо список послуг
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Помилка видалення послуги');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Помилка підключення до сервера');
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleEditProduct = (projectProduct: ProjectProduct) => {
    setEditingProduct(projectProduct);
    setIsEditProductDialogOpen(true);
  };

  const handleEditService = (projectService: ProjectService) => {
    setEditingService(projectService);
    setIsEditServiceDialogOpen(true);
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // Розрахунок сум
  const calculateProductsTotal = () => {
    return filteredProducts.reduce((total, projectProduct) => {
      const price = parseFloat(projectProduct.product?.price || '0');
      const quantity = projectProduct.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateServicesTotal = () => {
    return filteredServices.reduce((total, projectService) => {
      const price = parseFloat(projectService.service?.price || '0');
      const quantity = projectService.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateProductsTotal() + calculateServicesTotal();
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredServices = Array.isArray(services) ? services.filter(service =>
    service.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Завантаження товарів та послуг...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 min-h-[600px]">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Товари та послуги</h3>
          <p className="text-sm text-muted-foreground">
            Управління товарами та послугами проекту
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsAddProductDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Додати товар
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddServiceDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Додати послугу
          </Button>
        </div>
      </div>

      {/* Пошук */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук товарів та послуг..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Товари */}
      <div>
        <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Товари
          <Badge variant="secondary">{filteredProducts.length}</Badge>
        </h4>
        
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Товари не знайдено' : 'Немає товарів у проекті'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead className="text-right">Ціна</TableHead>
                    <TableHead className="text-center">Кількість</TableHead>
                    <TableHead className="text-right">Загальна сума</TableHead>
                    <TableHead className="text-center w-[100px]">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((projectProduct) => (
                    <TableRow key={projectProduct.project_product_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{projectProduct.product?.name}</div>
                          {projectProduct.product?.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {projectProduct.product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(projectProduct.product?.price || 0)}
                        {projectProduct.product?.unit && (
                          <div className="text-xs text-muted-foreground">
                            за {projectProduct.product.unit.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {projectProduct.quantity || 0}
                          {projectProduct.product?.unit && ` ${projectProduct.product.unit.name}`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(
                          (parseFloat(projectProduct.product?.price || '0') * (projectProduct.quantity || 0))
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProduct(projectProduct)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(projectProduct.project_product_id)}
                            disabled={deletingProductId === projectProduct.project_product_id}
                          >
                            {deletingProductId === projectProduct.project_product_id ? (
                              <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin" />
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Послуги */}
      <div>
        <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Послуги
          <Badge variant="secondary">{filteredServices.length}</Badge>
        </h4>
        
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Послуги не знайдено' : 'Немає послуг у проекті'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Послуга</TableHead>
                    <TableHead className="text-right">Ціна</TableHead>
                    <TableHead className="text-center">Кількість</TableHead>
                    <TableHead className="text-right">Загальна сума</TableHead>
                    <TableHead className="text-center w-[100px]">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((projectService) => (
                    <TableRow key={projectService.project_service_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{projectService.service?.name}</div>
                          {projectService.service?.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {projectService.service.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(projectService.service?.price || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {projectService.quantity || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        {formatCurrency(
                          (parseFloat(projectService.service?.price || '0') * (projectService.quantity || 0))
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditService(projectService)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteService(projectService.project_service_id)}
                            disabled={deletingServiceId === projectService.project_service_id}
                          >
                            {deletingServiceId === projectService.project_service_id ? (
                              <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin" />
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Підсумкова інформація */}
      {(filteredProducts.length > 0 || filteredServices.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Підсумкова інформація</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Сума по товарах:</span>
                  <Badge variant="outline">{filteredProducts.length} поз.</Badge>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(calculateProductsTotal())}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Сума по послугах:</span>
                  <Badge variant="outline">{filteredServices.length} поз.</Badge>
                </div>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(calculateServicesTotal())}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 pt-4 border-t-2">
                <span className="text-xl font-bold">Загальна сума:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(calculateGrandTotal())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Діалоги для додавання товарів та послуг */}
      <AddProductToProjectDialog
        isOpen={isAddProductDialogOpen}
        onClose={() => setIsAddProductDialogOpen(false)}
        onProductAdded={() => {
          fetchProducts();
          setIsAddProductDialogOpen(false);
        }}
        projectId={projectId}
      />

      <AddServiceToProjectDialog
        isOpen={isAddServiceDialogOpen}
        onClose={() => setIsAddServiceDialogOpen(false)}
        onServiceAdded={() => {
          fetchProducts();
          setIsAddServiceDialogOpen(false);
        }}
        projectId={projectId}
      />

      {/* Діалоги для редагування товарів та послуг */}
      <EditProductInProjectDialog
        isOpen={isEditProductDialogOpen}
        onClose={() => {
          setIsEditProductDialogOpen(false);
          setEditingProduct(null);
        }}
        onProductUpdated={() => {
          fetchProducts();
          setIsEditProductDialogOpen(false);
          setEditingProduct(null);
        }}
        projectProduct={editingProduct}
        projectId={projectId}
      />

      <EditServiceInProjectDialog
        isOpen={isEditServiceDialogOpen}
        onClose={() => {
          setIsEditServiceDialogOpen(false);
          setEditingService(null);
        }}
        onServiceUpdated={() => {
          fetchProducts();
          setIsEditServiceDialogOpen(false);
          setEditingService(null);
        }}
        projectService={editingService}
        projectId={projectId}
      />
    </div>
  );
}