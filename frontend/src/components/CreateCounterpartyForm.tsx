'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { X, User, Building } from 'lucide-react';
import { Manager } from '@/types/projects';

interface CreateCounterpartyFormProps {
  managers: Manager[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCounterpartyForm({ 
  managers, 
  onClose, 
  onSuccess 
}: CreateCounterpartyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    counterparty_type: '',
    phone: '',
    email: '',
    responsible_manager_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Валідація
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Назва обов\'язкова';
    }
    if (!formData.counterparty_type) {
      newErrors.counterparty_type = 'Тип контрагента обов\'язковий';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/counterparties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          responsible_manager_id: formData.responsible_manager_id ? 
            parseInt(formData.responsible_manager_id) : null
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ general: data.error || 'Помилка створення контрагента' });
      }
    } catch (error) {
      console.error('Error creating counterparty:', error);
      setErrors({ general: 'Помилка мережі' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Створити контрагента</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Назва */}
          <div>
            <Label htmlFor="name">Назва *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Введіть назву контрагента"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Тип */}
          <div>
            <Label htmlFor="type">Тип контрагента *</Label>
            <Select 
              value={formData.counterparty_type} 
              onValueChange={(value) => handleInputChange('counterparty_type', value)}
            >
              <SelectTrigger className={errors.counterparty_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Оберіть тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Фізична особа
                  </div>
                </SelectItem>
                <SelectItem value="LEGAL_ENTITY">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Юридична особа
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.counterparty_type && (
              <p className="text-sm text-red-500 mt-1">{errors.counterparty_type}</p>
            )}
          </div>

          {/* Телефон */}
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+380..."
              type="tel"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Електронна пошта</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
              type="email"
            />
          </div>

          {/* Відповідальний менеджер */}
          <div>
            <Label htmlFor="manager">Відповідальний менеджер</Label>
            <Select 
              value={formData.responsible_manager_id} 
              onValueChange={(value) => handleInputChange('responsible_manager_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Оберіть менеджера (необов'язково)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без менеджера</SelectItem>
                {managers.map(manager => (
                  <SelectItem key={manager.manager_id} value={manager.manager_id.toString()}>
                    {manager.first_name} {manager.last_name} ({manager.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Скасувати
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Створення...' : 'Створити'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
