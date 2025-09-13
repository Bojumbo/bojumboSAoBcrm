'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, User, UserCog, ChevronDown, X, Search, Plus } from 'lucide-react';
import { Manager } from '@/types/counterparties';

interface AddCounterpartyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCounterpartyData) => Promise<void>;
  managers: Manager[];
}

interface CreateCounterpartyData {
  name: string;
  counterparty_type: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  responsible_manager_id: number | null;
  phone: string | null;
  email: string | null;
}

interface FormData {
  name: string;
  counterparty_type: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  responsible_manager_id: number | null;
  phone: string;
  email: string;
}

interface ManagerSearchState {
  searchQuery: string;
  isDropdownOpen: boolean;
  filteredManagers: Manager[];
}

export function AddCounterpartyForm({
  isOpen,
  onClose,
  onSave,
  managers,
}: AddCounterpartyFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    counterparty_type: 'INDIVIDUAL',
    responsible_manager_id: null,
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Стан для пошуку менеджерів
  const [managerSearch, setManagerSearch] = useState<ManagerSearchState>({
    searchQuery: '',
    isDropdownOpen: false,
    filteredManagers: managers,
  });

  // Скидаємо форму при відкритті
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        counterparty_type: 'INDIVIDUAL',
        responsible_manager_id: null,
        phone: '',
        email: '',
      });
      
      setManagerSearch({
        searchQuery: '',
        isDropdownOpen: false,
        filteredManagers: managers
      });
      
      setErrors({});
    }
  }, [isOpen, managers]);

  // Фільтрація менеджерів на основі пошукового запиту
  useEffect(() => {
    if (!managerSearch.searchQuery.trim()) {
      setManagerSearch(prev => ({ ...prev, filteredManagers: managers }));
    } else {
      const filtered = managers.filter(manager => {
        const searchLower = managerSearch.searchQuery.toLowerCase();
        const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase();
        const phone = manager.phone_number?.toLowerCase() || '';
        
        return fullName.includes(searchLower) || phone.includes(searchLower);
      });
      setManagerSearch(prev => ({ ...prev, filteredManagers: filtered }));
    }
  }, [managerSearch.searchQuery, managers]);

  // Закриття випадаючого списку при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.manager-dropdown-container')) {
        setManagerSearch(prev => ({ ...prev, isDropdownOpen: false }));
      }
    };

    if (managerSearch.isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [managerSearch.isDropdownOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ім'я контрагента є обов'язковим";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некоректний формат email';
    }

    if (formData.phone && !/^\+380\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Номер телефону має бути у форматі +380xxxxxxxxx';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Підготовка даних для відправки
      const createData: CreateCounterpartyData = {
        name: formData.name.trim(),
        counterparty_type: formData.counterparty_type,
        responsible_manager_id: formData.responsible_manager_id,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      };

      await onSave(createData);
      onClose();
      
      console.log('Контрагент успішно створено');
    } catch (error) {
      console.error('Помилка при створенні контрагента:', error);
      setErrors({ submit: 'Помилка при створенні. Спробуйте знову.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const getManagerName = (managerId: number | null) => {
    if (!managerId) return 'Не призначено';
    const manager = managers.find(m => m.manager_id === managerId);
    return manager ? `${manager.first_name} ${manager.last_name}` : 'Невідомий менеджер';
  };

  const handleManagerSelect = (managerId: number | null) => {
    setFormData(prev => ({ ...prev, responsible_manager_id: managerId }));
    setManagerSearch(prev => ({ 
      ...prev, 
      isDropdownOpen: false,
      searchQuery: managerId ? getManagerName(managerId) : ''
    }));
  };

  const handleManagerSearchChange = (value: string) => {
    setManagerSearch(prev => ({ 
      ...prev, 
      searchQuery: value,
      isDropdownOpen: value.length > 0 || prev.isDropdownOpen
    }));
  };

  const handleManagerInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setManagerSearch(prev => ({ ...prev, isDropdownOpen: false }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setManagerSearch(prev => ({ ...prev, isDropdownOpen: true }));
    }
  };

  const clearManagerSelection = () => {
    setFormData(prev => ({ ...prev, responsible_manager_id: null }));
    setManagerSearch(prev => ({ 
      ...prev, 
      searchQuery: '',
      isDropdownOpen: false 
    }));
  };

  // Функція форматування номера телефону
  const formatPhoneNumber = (value: string): string => {
    // Видаляємо всі нецифрові символи крім +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Якщо порожнє значення, повертаємо як є
    if (!cleaned) return '';
    
    // Якщо починається з +380, залишаємо як є
    if (cleaned.startsWith('+380')) {
      return cleaned.slice(0, 13); // Обмежуємо до +380xxxxxxxxx
    }
    
    // Якщо починається з +38, залишаємо як є (може бути у процесі набору)
    if (cleaned.startsWith('+38')) {
      return cleaned.slice(0, 13);
    }
    
    // Якщо починається з +, залишаємо як є
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // Якщо починається з 380, додаємо +
    if (cleaned.startsWith('380')) {
      return `+${cleaned}`.slice(0, 13);
    }
    
    // Якщо починається з 80, додаємо +3
    if (cleaned.startsWith('80')) {
      return `+3${cleaned}`.slice(0, 13);
    }
    
    // Якщо починається з 0, замінюємо на +380
    if (cleaned.startsWith('0')) {
      return `+38${cleaned}`.slice(0, 13);
    }
    
    // Якщо просто цифри (9 цифр), додаємо +380
    if (/^\d{1,9}$/.test(cleaned)) {
      return `+380${cleaned}`.slice(0, 13);
    }
    
    // В інших випадках повертаємо як є
    return cleaned.slice(0, 13);
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneNumber(value);
    setFormData({ ...formData, phone: formattedPhone });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Додати контрагента
          </DialogTitle>
          <DialogDescription>
            Заповніть форму для створення нового контрагента
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Назва */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Назва контрагента *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введіть назву контрагента"
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Тип контрагента */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Тип контрагента
            </Label>
            <Select
              value={formData.counterparty_type}
              onValueChange={(value: 'INDIVIDUAL' | 'LEGAL_ENTITY') =>
                setFormData({ ...formData, counterparty_type: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Фізична особа</SelectItem>
                <SelectItem value="LEGAL_ENTITY">Юридична особа</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Відповідальний менеджер */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Відповідальний менеджер
            </Label>
            <div className="relative manager-dropdown-container">
              <div className="flex">
                <Input
                  value={formData.responsible_manager_id ? getManagerName(formData.responsible_manager_id) : managerSearch.searchQuery}
                  onChange={(e) => handleManagerSearchChange(e.target.value)}
                  onFocus={() => setManagerSearch(prev => ({ ...prev, isDropdownOpen: true }))}
                  onKeyDown={handleManagerInputKeyDown}
                  placeholder="Пошук менеджера за ім'ям або телефоном..."
                  disabled={isLoading}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {formData.responsible_manager_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearManagerSelection}
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setManagerSearch(prev => ({ ...prev, isDropdownOpen: !prev.isDropdownOpen }))}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${managerSearch.isDropdownOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Випадаючий список менеджерів */}
              {managerSearch.isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() => handleManagerSelect(null)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Не призначено</span>
                    </div>
                  </div>
                  
                  {managerSearch.filteredManagers.length === 0 ? (
                    <div className="px-3 py-4 text-center text-gray-500">
                      <Search className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-sm">Менеджерів не знайдено</p>
                    </div>
                  ) : (
                    managerSearch.filteredManagers.map((manager) => (
                      <div 
                        key={manager.manager_id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleManagerSelect(manager.manager_id)}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">
                              {manager.first_name} {manager.last_name}
                            </div>
                            {manager.phone_number && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {manager.phone_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {managers.length === 0 && (
              <p className="text-sm text-yellow-600">Менеджери ще завантажуються...</p>
            )}
          </div>

          {/* Телефон */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Телефон
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+380XX XXX XX XX"
              disabled={isLoading}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@domain.com"
              disabled={isLoading}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Створити контрагента
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}