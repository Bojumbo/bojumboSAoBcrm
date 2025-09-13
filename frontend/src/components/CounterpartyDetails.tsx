'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  Edit
} from 'lucide-react';
import type { 
  CounterpartyWithRelations, 
  CounterpartyDetailsProps
} from '@/types/counterparties';

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({
  counterparty,
  isOpen,
  onClose,
  onEdit
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const getCounterpartyTypeText = (type: string) => {
    return type === 'INDIVIDUAL' ? 'Фізична особа' : 'Юридична особа';
  };

  const getCounterpartyTypeIcon = (type: string) => {
    return type === 'INDIVIDUAL' ? User : Building2;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Деталі контрагента
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основна інформація */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(getCounterpartyTypeIcon(counterparty.counterparty_type), { className: "h-5 w-5" })}
                  {counterparty.name}
                </CardTitle>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(counterparty)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Редагувати</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Контактна інформація</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Тип:</span>
                      <Badge variant="outline">
                        {getCounterpartyTypeText(counterparty.counterparty_type)}
                      </Badge>
                    </div>
                    
                    {counterparty.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{counterparty.phone}</span>
                      </div>
                    )}

                    {counterparty.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{counterparty.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Інформація про систему</h4>
                  <div className="space-y-1 text-sm">
                    {counterparty.responsible_manager && (
                      <div>
                        <span className="text-muted-foreground">Відповідальний менеджер: </span>
                        <span>
                          {counterparty.responsible_manager.first_name} {counterparty.responsible_manager.last_name}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Створено: </span>
                      <span>{formatDate(counterparty.created_at)}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Оновлено: </span>
                      <span>{formatDate(counterparty.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Проекти */}
          {counterparty.projects && counterparty.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Проекти ({counterparty.projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {counterparty.projects.map((project) => (
                    <div key={project.project_id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{project.name}</h5>
                        {project.budget && (
                          <Badge variant="secondary">
                            {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(project.budget)}
                          </Badge>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {project.start_date && (
                          <span>Початок: {formatDate(project.start_date)}</span>
                        )}
                        {project.end_date && (
                          <span>Кінець: {formatDate(project.end_date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Продажі */}
          {counterparty.sales && counterparty.sales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Продажі ({counterparty.sales.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {counterparty.sales.map((sale) => (
                    <div key={sale.sale_id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{sale.name}</h5>
                        <Badge>
                          {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(sale.total_price)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Дата продажу: {formatDate(sale.sale_date)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CounterpartyDetails;