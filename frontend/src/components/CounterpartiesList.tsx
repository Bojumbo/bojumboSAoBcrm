'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, Search, Filter, X, ChevronDown } from 'lucide-react';
import { CounterpartyWithRelations, Manager } from '@/types/counterparties';
import CounterpartyCard from './CounterpartyCard';

interface CounterpartiesListProps {
  onCounterpartySelect: (counterparty: CounterpartyWithRelations) => void;
  refreshTrigger?: number;
  onManagersLoad?: (managers: Manager[]) => void;
  onAddCounterparty?: () => void;
}

const CounterpartiesList: React.FC<CounterpartiesListProps> = ({ 
  onCounterpartySelect, 
  refreshTrigger = 0,
  onManagersLoad,
  onAddCounterparty
}) => {
  const [counterparties, setCounterparties] = useState<CounterpartyWithRelations[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Стани для пошуку та фільтрації
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Стани для пошуку менеджерів
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [selectedManagerText, setSelectedManagerText] = useState('');
  
  // Стани для фільтра типів
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [selectedTypeText, setSelectedTypeText] = useState('');
  
  // Реф для інпуту пошуку
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const managerDropdownRef = React.useRef<HTMLDivElement>(null);
  const typeDropdownRef = React.useRef<HTMLDivElement>(null);

  // Дебаунс для пошуку
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Клавіатурні скорочення
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F для фокусу на пошук
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Клік поза межами випадаючих списків
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (managerDropdownRef.current && !managerDropdownRef.current.contains(event.target as Node)) {
        setIsManagerDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фільтрація менеджерів за пошуковим запитом
  const filteredManagers = useMemo(() => {
    if (!managerSearchQuery.trim()) return managers;
    
    const searchLower = managerSearchQuery.toLowerCase().trim();
    return managers.filter(manager => 
      `${manager.first_name} ${manager.last_name}`.toLowerCase().includes(searchLower) ||
      manager.email.toLowerCase().includes(searchLower) ||
      manager.phone_number.includes(searchLower)
    );
  }, [managers, managerSearchQuery]);

  // Функції для управління вибором менеджера
  const handleManagerSelect = (managerId: string, managerName: string) => {
    setSelectedManagerId(managerId);
    setSelectedManagerText(managerId === 'all' ? '' : managerName);
    setManagerSearchQuery('');
    setIsManagerDropdownOpen(false);
  };

  const handleManagerSearchChange = (value: string) => {
    setManagerSearchQuery(value);
    setIsManagerDropdownOpen(true);
  };

  // Функції для управління вибором типу
  const handleTypeSelect = (typeValue: string, typeName: string) => {
    setSelectedType(typeValue);
    setSelectedTypeText(typeValue === 'all' ? '' : typeName);
    setIsTypeDropdownOpen(false);
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return 'Фізична особа';
      case 'LEGAL_ENTITY': return 'Юридична особа';
      default: return 'Всі типи';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('Token found:', !!token);
        
        if (!token) {
          setError('Токен авторизації не знайдено. Будь ласка, увійдіть в систему.');
          return;
        }

        // Завантажуємо контрагентів та менеджерів паралельно
        const [counterpartiesResponse, managersResponse] = await Promise.all([
          fetch('http://localhost:3001/api/counterparties', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('http://localhost:3001/api/managers', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        ]);

        console.log('Counterparties response status:', counterpartiesResponse.status);
        console.log('Managers response status:', managersResponse.status);

        if (!counterpartiesResponse.ok) {
          if (counterpartiesResponse.status === 403) {
            setError('Немає доступу. Перевірте ваші права доступу.');
          } else if (counterpartiesResponse.status === 401) {
            setError('Токен авторизації недійсний. Будь ласка, увійдіть знову.');
          } else {
            setError(`Помилка сервера: ${counterpartiesResponse.status}`);
          }
          return;
        }

        const counterpartiesData = await counterpartiesResponse.json();
        const managersData = await managersResponse.json();

        if (counterpartiesData.success) {
          setCounterparties(counterpartiesData.data);
        } else {
          setError(counterpartiesData.error || 'Помилка завантаження контрагентів');
        }

        if (managersResponse.ok && managersData.success) {
          setManagers(managersData.data);
          // Передаємо менеджерів в батьківський компонент
          if (onManagersLoad) {
            onManagersLoad(managersData.data);
          }
        } else {
          console.warn('Помилка завантаження менеджерів:', managersResponse.status, managersData.error || managersData);
        }
      } catch (err) {
        setError('Помилка мережі. Перевірте підключення до сервера.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, onManagersLoad]); // Додаємо refreshTrigger як залежність

  // Фільтрація контрагентів
  const filteredCounterparties = useMemo(() => {
    const filtered = counterparties.filter((counterparty) => {
      // Пошук по назві, email та телефону (регістронезалежний)
      const searchLower = debouncedSearchQuery.toLowerCase().trim();
      const matchesSearch = !debouncedSearchQuery || [
        counterparty.name,
        counterparty.email,
        counterparty.phone,
      ].some(field => 
        field && field.toLowerCase().includes(searchLower)
      );

      // Фільтр по менеджеру
      const matchesManager = selectedManagerId === 'all' || 
        counterparty.responsible_manager_id?.toString() === selectedManagerId;

      // Фільтр по типу контрагента
      const matchesType = selectedType === 'all' || 
        counterparty.counterparty_type === selectedType;

      return matchesSearch && matchesManager && matchesType;
    });

    // Сортування за алфавітом по назві
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'uk', { sensitivity: 'base' }));
  }, [counterparties, debouncedSearchQuery, selectedManagerId, selectedType]);

  const handleViewDetails = (id: number) => {
    const counterparty = counterparties.find(c => c.counterparty_id === id);
    if (counterparty) {
      onCounterpartySelect(counterparty);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4 text-lg font-medium">
            {error}
          </div>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p>Можливі причини:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Бекенд не працює на порту 3001</li>
              <li>Ви не увійшли в систему</li>
              <li>Токен авторизації застарів</li>
            </ul>
          </div>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              Оновити сторінку
            </Button>
            <Button onClick={() => window.location.href = '/login'}>
              Увійти в систему
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Контрагенти</h1>
          <p className="text-muted-foreground">
            Управління контрагентами та їх інформацією
          </p>
        </div>
        <Button onClick={onAddCounterparty}>
          <Plus className="h-4 w-4 mr-2" />
          Додати контрагента
        </Button>
      </div>

      {/* Блок пошуку та фільтрів */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4">
          {/* Рядок пошуку */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Пошук по назві, email або телефону... (Ctrl+F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('');
                }
              }}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Рядок фільтрів */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Фільтр по менеджеру з пошуком */}
            <div className="flex-1 min-w-[200px] relative" ref={managerDropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder={selectedManagerText || "Пошук менеджера..."}
                  value={managerSearchQuery}
                  onChange={(e) => handleManagerSearchChange(e.target.value)}
                  onFocus={() => setIsManagerDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsManagerDropdownOpen(false);
                      setManagerSearchQuery('');
                    }
                  }}
                  className="pl-10 pr-20"
                />
                {selectedManagerText && (
                  <button
                    onClick={() => handleManagerSelect('all', '')}
                    className="absolute right-8 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <ChevronDown 
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
                />
              </div>
              
              {isManagerDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div 
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b ${
                      selectedManagerId === 'all' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => handleManagerSelect('all', '')}
                  >
                    <span className="font-medium">Всі менеджери</span>
                  </div>
                  {filteredManagers
                    .sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`, 'uk'))
                    .map((manager) => (
                      <div
                        key={manager.manager_id}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                          selectedManagerId === manager.manager_id.toString() ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                        onClick={() => handleManagerSelect(manager.manager_id.toString(), `${manager.first_name} ${manager.last_name}`)}
                      >
                        <div className="font-medium">{manager.first_name} {manager.last_name}</div>
                        <div className="text-xs text-gray-500">
                          {manager.email} • {manager.phone_number}
                        </div>
                      </div>
                    ))}
                  {filteredManagers.length === 0 && managerSearchQuery && (
                    <div className="px-3 py-2 text-gray-500 text-center">
                      Менеджерів не знайдено
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Фільтр по типу */}
            <div className="flex-1 min-w-[180px] relative" ref={typeDropdownRef}>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder={selectedTypeText || "Тип контрагента..."}
                  value={selectedTypeText}
                  readOnly
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="pl-10 pr-10 cursor-pointer"
                />
                {selectedTypeText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeSelect('all', '');
                    }}
                    className="absolute right-8 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <ChevronDown 
                  className={`absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer transition-transform ${
                    isTypeDropdownOpen ? 'rotate-180' : ''
                  }`}
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                />
              </div>
              
              {isTypeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                  <div 
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b ${
                      selectedType === 'all' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => handleTypeSelect('all', '')}
                  >
                    <span className="font-medium">Всі типи</span>
                  </div>
                  <div
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b ${
                      selectedType === 'INDIVIDUAL' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => handleTypeSelect('INDIVIDUAL', 'Фізична особа')}
                  >
                    <div className="font-medium">Фізична особа</div>
                    <div className="text-xs text-gray-500">Приватні особи</div>
                  </div>
                  <div
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      selectedType === 'LEGAL_ENTITY' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => handleTypeSelect('LEGAL_ENTITY', 'Юридична особа')}
                  >
                    <div className="font-medium">Юридична особа</div>
                    <div className="text-xs text-gray-500">Компанії та організації</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Показник кількості результатів та кнопка очищення */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              Знайдено: {filteredCounterparties.length} з {counterparties.length} контрагентів
            </span>
          </div>
          
          {(debouncedSearchQuery || selectedManagerId !== 'all' || selectedType !== 'all') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedManagerId('all');
                setSelectedManagerText('');
                setManagerSearchQuery('');
                setSelectedType('all');
                setSelectedTypeText('');
                setIsManagerDropdownOpen(false);
                setIsTypeDropdownOpen(false);
              }}
            >
              Очистити фільтри
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {filteredCounterparties.map((counterparty) => (
          <CounterpartyCard
            key={counterparty.counterparty_id}
            counterparty={counterparty}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredCounterparties.length === 0 && counterparties.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">За вашим запитом нічого не знайдено</p>
            <p className="text-sm text-muted-foreground">
              Спробуйте змінити параметри пошуку або фільтри
            </p>
          </CardContent>
        </Card>
      )}

      {counterparties.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Контрагенти відсутні</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CounterpartiesList;