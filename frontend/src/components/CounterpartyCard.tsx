'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Eye
} from 'lucide-react';
import { CounterpartyWithRelations } from '@/types/counterparties';

interface CounterpartyCardProps {
  counterparty: CounterpartyWithRelations;
  onViewDetails: (id: number) => void;
}

const CounterpartyCard = ({ counterparty, onViewDetails }: CounterpartyCardProps) => {
  const getCounterpartyTypeText = (type: string) => {
    return type === 'INDIVIDUAL' ? 'Фізична особа' : 'Юридична особа';
  };

  const getCounterpartyTypeIcon = (type: string) => {
    return type === 'INDIVIDUAL' ? User : Building2;
  };

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {(() => {
              const IconComponent = getCounterpartyTypeIcon(counterparty.counterparty_type);
              return <IconComponent className="h-5 w-5" />;
            })()}
            <div>
              <CardTitle className="text-lg">{counterparty.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getCounterpartyTypeText(counterparty.counterparty_type)}
              </p>
            </div>
          </div>
          <Badge variant={counterparty.counterparty_type === 'INDIVIDUAL' ? 'default' : 'secondary'}>
            {counterparty.counterparty_type === 'INDIVIDUAL' ? 'ФО' : 'ЮО'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {counterparty.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{counterparty.phone}</span>
            </div>
          )}
          {counterparty.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{counterparty.email}</span>
            </div>
          )}
          {counterparty.responsible_manager && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {counterparty.responsible_manager.first_name} {counterparty.responsible_manager.last_name}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 mt-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(counterparty.counterparty_id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Переглянути
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CounterpartyCard;
