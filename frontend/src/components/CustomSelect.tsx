import React, { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useClickOutside } from '../hooks/useClickOutside';

interface Option {
  value: number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder: string;
  disabled?: boolean;
}

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

export const CustomSelect = ({ options, value, onChange, placeholder, disabled = false }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
  });

  const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

  const filteredOptions = useMemo(() =>
    options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  const handleSelect = (optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:placeholder:text-gray-400 dark:ring-offset-gray-900"
      >
        <span className={`truncate ${selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex items-center">
            {selectedOption && (
                <span 
                  onClick={handleClear} 
                  className="mr-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                  aria-label="Clear selection"
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClear(e as React.KeyboardEvent<HTMLSpanElement>); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </span>
            )}
            <ChevronDownIcon />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg p-2">
          <Input
            placeholder="Пошук..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="max-h-48">
            {filteredOptions.length > 0 ? filteredOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${value === option.value ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            )) : (
                <div className="text-center text-sm text-gray-500 py-2">Не знайдено</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
