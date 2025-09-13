export interface Counterparty {
  counterparty_id: number;
  name: string;
  counterparty_type: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  responsible_manager_id?: number | null;
  phone?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Manager {
  manager_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

export interface CounterpartyWithRelations extends Counterparty {
  responsible_manager?: Manager | null;
  sales?: Sale[];
  projects?: Project[];
}

export interface Sale {
  sale_id: number;
  name: string;
  total_price: number;
  sale_date: string;
  counterparty_id: number;
  responsible_manager_id: number;
  project_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  project_id: number;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  counterparty_id?: number | null;
  main_responsible_manager_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CounterpartyStats {
  totalSales: number;
  totalProjects: number;
  totalRevenue: number;
  lastActivity: string | null;
}

export interface CounterpartyDetailsProps {
  counterparty: CounterpartyWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (counterparty: CounterpartyWithRelations) => void;
}

export interface CreateCounterpartyData {
  name: string;
  counterparty_type: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  responsible_manager_id: number | null;
  phone: string | null;
  email: string | null;
}

export interface CounterpartyStatus {
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export type CounterpartyListItem = CounterpartyWithRelations;
