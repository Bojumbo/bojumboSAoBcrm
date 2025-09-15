'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Project, ProjectProduct, ProjectService } from '@/types/projects';
import { User, Building2, Users, DollarSign, Calendar, FileText, Edit, TrendingUp, ShoppingCart } from 'lucide-react';

interface ProjectInfoPanelProps {
  project: Project;
  onEdit?: () => void;
}

export default function ProjectInfoPanel({ project, onEdit }: ProjectInfoPanelProps) {
  const [products, setProducts] = useState<ProjectProduct[]>([]);
  const [services, setServices] = useState<ProjectService[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Завантаження товарів та послуг проекту
  useEffect(() => {
    const fetchProductsAndServices = async () => {
      try {
        setLoadingProducts(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/projects/${project.project_id}/products`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          let data;
          if (result.success && result.data) {
            data = result.data;
          } else {
            data = result;
          }
          
          setProducts(Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : []);
          setServices(Array.isArray(data.services) ? data.services : []);
        } else {
          setProducts([]);
          setServices([]);
        }
      } catch (error) {
        console.error('Error fetching products and services:', error);
        setProducts([]);
        setServices([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsAndServices();
  }, [project.project_id]);
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Розрахунок сум продажів
  const calculateProductsTotal = () => {
    return products.reduce((total, projectProduct) => {
      const price = parseFloat(projectProduct.product?.price || '0');
      const quantity = projectProduct.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateServicesTotal = () => {
    return services.reduce((total, projectService) => {
      const price = parseFloat(projectService.service?.price || '0');
      const quantity = projectService.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateSalesTotal = () => {
    return calculateProductsTotal() + calculateServicesTotal();
  };

  // Розрахунок відсотка виконання
  const calculateCompletionPercentage = () => {
    const salesTotal = calculateSalesTotal();
    const forecastAmount = parseFloat(project.forecast_amount?.toString() || '0');
    
    if (forecastAmount === 0) return 0;
    return Math.round((salesTotal / forecastAmount) * 100);
  };

  return (
    <div className="w-full">
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Інформація про проект
            </CardTitle>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Опис проекту */}
          {project.description && (
            <div>
              <h4 className="font-semibold mb-2">Опис</h4>
              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                {project.description}
              </p>
            </div>
          )}

        <Separator />

        {/* Прогнозна сума */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Прогнозна сума
          </h4>
          <p className="text-lg font-medium text-green-600">
            {formatCurrency(project.forecast_amount)}
          </p>
        </div>

        <Separator />

        {/* Продажі та виконання */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Продажі
          </h4>
          
          {loadingProducts ? (
            <div className="text-sm text-muted-foreground">Завантаження...</div>
          ) : (
            <div className="space-y-3">
              {/* Сума продажів */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Сума продажів:</span>
                </div>
                <p className="text-lg font-medium text-blue-600">
                  {formatCurrency(calculateSalesTotal())}
                </p>
              </div>

              {/* Відсоток виконання */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Виконання:</span>
                  <Badge 
                    variant={calculateCompletionPercentage() >= 100 ? "default" : calculateCompletionPercentage() >= 70 ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {calculateCompletionPercentage()}%
                  </Badge>
                </div>
                
                {/* Прогрес бар */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      calculateCompletionPercentage() >= 100 
                        ? 'bg-green-500' 
                        : calculateCompletionPercentage() >= 70 
                        ? 'bg-blue-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(calculateCompletionPercentage(), 100)}%` }}
                  ></div>
                </div>
                
                {/* Детальна інформація */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Товари:</span>
                    <span>{formatCurrency(calculateProductsTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Послуги:</span>
                    <span>{formatCurrency(calculateServicesTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Контрагент */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Контрагент
          </h4>
          {project.counterparty ? (
            <div className="space-y-1">
              <p className="text-sm font-medium break-words">{project.counterparty.name}</p>
              {project.counterparty.phone && (
                <p className="text-sm text-muted-foreground break-all">
                  Тел: {project.counterparty.phone}
                </p>
              )}
              {project.counterparty.email && (
                <p className="text-sm text-muted-foreground break-all">
                  Email: {project.counterparty.email}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Не вказано</p>
          )}
        </div>

        <Separator />

        {/* Відповідальний менеджер */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Відповідальний менеджер
          </h4>
          {project.main_responsible_manager ? (
            <div className="space-y-1">
              <p className="text-sm font-medium break-words">
                {project.main_responsible_manager.first_name} {project.main_responsible_manager.last_name}
              </p>
              <p className="text-sm text-muted-foreground break-all">
                {project.main_responsible_manager.email}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Не вказано</p>
          )}
        </div>

        <Separator />

        {/* Додаткові менеджери */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Додаткові менеджери
          </h4>
          {project.secondary_responsible_managers && project.secondary_responsible_managers.length > 0 ? (
            <div className="space-y-2">
              {project.secondary_responsible_managers.map((pm) => (
                <div key={pm.manager_id} className="space-y-1">
                  <p className="text-sm font-medium break-words">
                    {pm.manager.first_name} {pm.manager.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground break-all">
                    {pm.manager.email}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Не вказано</p>
          )}
        </div>

        <Separator />

        {/* Дати */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Дати
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Створено:</span>
              <p>{formatDate(project.created_at)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Оновлено:</span>
              <p>{formatDate(project.updated_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}