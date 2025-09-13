'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, ShoppingCart, Search, Package, DollarSign, Hash } from 'lucide-react';
import { ProjectProduct, ProjectService } from '@/types/projects';

interface ProjectProductsProps {
  projectId: number;
}

export default function ProjectProducts({ projectId }: ProjectProductsProps) {
  const [products, setProducts] = useState<ProjectProduct[]>([]);
  const [services, setServices] = useState<ProjectService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2,
    }).format(numAmount);
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
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Додати товар
          </Button>
          <Button className="flex items-center gap-2">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((projectProduct) => (
              <Card key={projectProduct.project_product_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-start justify-between">
                    <span>{projectProduct.product?.name}</span>
                    <Badge variant="outline">Товар</Badge>
                  </CardTitle>
                  {projectProduct.product?.description && (
                    <CardDescription className="text-sm">
                      {projectProduct.product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Ціна:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(projectProduct.product?.price || 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        Кількість:
                      </span>
                      <span className="font-medium">
                        {projectProduct.quantity || 0}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                      <span>Загальна сума:</span>
                      <span className="text-green-600">
                        {formatCurrency(
                          (parseFloat(projectProduct.product?.price || '0') * (projectProduct.quantity || 0))
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Редагувати
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Видалити
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Послуги */}
      <div>
        <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Послуги
          <Badge variant="secondary">{filteredServices.length}</Badge>
        </h4>
        
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Послуги не знайдено' : 'Немає послуг у проекті'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((projectService) => (
              <Card key={projectService.project_service_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-start justify-between">
                    <span>{projectService.service?.name}</span>
                    <Badge variant="secondary">Послуга</Badge>
                  </CardTitle>
                  {projectService.service?.description && (
                    <CardDescription className="text-sm">
                      {projectService.service.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Ціна:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(projectService.service?.price || 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        ID:
                      </span>
                      <span className="font-medium">
                        {projectService.project_service_id}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                      <span>Ціна послуги:</span>
                      <span className="text-green-600">
                        {formatCurrency(projectService.service?.price || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Редагувати
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Видалити
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}