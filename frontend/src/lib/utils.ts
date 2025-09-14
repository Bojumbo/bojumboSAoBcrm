import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Функції для перекладу типів та статусів
export const translateCounterpartyType = (type: string): string => {
  switch (type) {
    case 'INDIVIDUAL':
      return 'Фізична особа';
    case 'LEGAL_ENTITY':
      return 'Юридична особа';
    default:
      return type;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA');
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);
};
