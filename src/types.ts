// Basic types for authentication and API services
export interface Manager {
  manager_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'head' | 'manager';
  supervisor_ids?: number[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Manager;
  token: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Project types
export interface Project {
  project_id: number;
  name: string;
  forecast_amount: number;
  main_responsible_manager_id: number | null;
  secondary_responsible_manager_ids?: number[];
  counterparty_id: number | null;
  funnel_id: number | null;
  funnel_stage_id: number | null;
  main_responsible_manager?: Manager;
  secondary_responsible_managers?: Manager[];
  counterparty?: Counterparty;
  funnel?: Funnel;
  funnel_stage?: FunnelStage;
}

export interface Counterparty {
  counterparty_id: number;
  name: string;
  counterparty_type: string;
  responsible_manager_id: number | null;
  responsible_manager?: Manager;
}

export interface Funnel {
  funnel_id: number;
  name: string;
}

export interface FunnelStage {
  funnel_stage_id: number;
  name: string;
  funnel_id: number;
  order: number;
}

// Sale types
export interface Sale {
  sale_id: number;
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: string;
  status: string;
  deferred_payment_date?: string | null;
  project_id?: number | null;
  counterparty?: Counterparty;
  responsible_manager?: Manager;
  products?: { product: Product; quantity: number }[];
  services?: Service[];
  total_price?: number;
}

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  unit_id?: number | null;
  unit?: Unit;
}

export interface Service {
  service_id: number;
  name: string;
  description: string;
  price: number;
}

export interface Unit {
  unit_id: number;
  name: string;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  location: string;
}

// Task types
export interface Task {
  task_id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_manager_id: number;
  project_id?: number | null;
  sub_project_id?: number | null;
  assigned_manager?: Manager;
  project?: Project;
  sub_project?: SubProject;
}

export interface SubProject {
  sub_project_id: number;
  name: string;
  description: string;
  status: string;
  project_id: number;
  project?: Project;
  tasks?: Task[];
}

// Request types
export interface CreateProjectRequest {
  name: string;
  forecast_amount: number;
  main_responsible_manager_id?: number;
  secondary_responsible_manager_ids?: number[];
  counterparty_id?: number;
  funnel_id?: number;
  funnel_stage_id?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  forecast_amount?: number;
  main_responsible_manager_id?: number;
  secondary_responsible_manager_ids?: number[];
  counterparty_id?: number;
  funnel_id?: number;
  funnel_stage_id?: number;
}

export interface CreateSaleRequest {
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: string;
  status: string;
  deferred_payment_date?: string;
  project_id?: number;
}

export interface UpdateSaleRequest {
  counterparty_id?: number;
  responsible_manager_id?: number;
  sale_date?: string;
  status?: string;
  deferred_payment_date?: string;
  project_id?: number;
}
