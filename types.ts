export interface Manager {
  manager_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'head' | 'manager';
  supervisor_ids?: number[];
}

export enum CounterpartyType {
  INDIVIDUAL = 'individual',
  LEGAL_ENTITY = 'legal_entity',
}

export interface Counterparty {
  counterparty_id: number;
  name: string;
  counterparty_type: CounterpartyType;
  responsible_manager_id: number | null;
  responsible_manager?: Manager;
}

export interface Unit {
    unit_id: number;
    name: string;
}

export interface ProductStock {
  product_stock_id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  warehouse?: Warehouse;
}

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  unit_id?: number | null;
  unit?: Unit;
  stocks?: ProductStock[];
  total_stock?: number;
}

export interface Service {
  service_id: number;
  name: string;
  description: string;
  price: number;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  location: string;
}

export interface SaleStatusType {
    sale_status_id: number;
    name: string;
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

export interface SubProjectStatusType {
    sub_project_status_id: number;
    name: string;
}

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

export interface ProjectProduct {
  project_product_id: number;
  project_id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface ProjectService {
  project_service_id: number;
  project_id: number;
  service_id: number;
  service?: Service;
}

export interface ProjectComment {
  comment_id: number;
  project_id: number;
  manager_id: number;
  content: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  manager?: Manager;
}

export interface SubProjectComment {
  comment_id: number;
  sub_project_id: number;
  manager_id: number;
  content: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  manager?: Manager;
}

export interface SubProjectProduct {
  sub_project_product_id: number;
  sub_project_id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface SubProjectService {
  sub_project_service_id: number;
  sub_project_id: number;
  service_id: number;
  service?: Service;
}

export interface Project {
  project_id: number;
  name: string;
  description?: string;
  main_responsible_manager_id?: number;
  counterparty_id?: number;
  funnel_id?: number;
  funnel_stage_id?: number;
  forecast_amount: number;
  main_responsible_manager?: Manager;
  secondary_responsible_managers?: Manager[];
  counterparty?: Counterparty;
  funnel?: Funnel;
  funnel_stage?: FunnelStage;
  subprojects?: SubProject[];
  tasks?: Task[];
  sales?: Sale[];
  project_products?: ProjectProduct[];
  project_services?: ProjectService[];
  comments?: ProjectComment[];
}

export interface SubProject {
  sub_project_id: number;
  name: string;
  description?: string;
  project_id: number;
  status?: string;
  cost?: number;
  project?: Project;
  tasks?: Task[];
  comments?: SubProjectComment[];
  subproject_products?: SubProjectProduct[];
  subproject_services?: SubProjectService[];
}

export interface Task {
  task_id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  responsible_manager_id: number;
  creator_manager_id: number;
  project_id?: number;
  sub_project_id?: number;
  due_date?: string;
  responsible_manager?: Manager;
  creator_manager?: Manager;
  project?: Project;
  subproject?: SubProject;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<Manager, 'supervisor_ids'>;
  token: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  main_responsible_manager_id?: number;
  counterparty_id?: number;
  funnel_id?: number;
  funnel_stage_id?: number;
  forecast_amount: number;
  secondary_responsible_manager_ids?: number[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  main_responsible_manager_id?: number;
  counterparty_id?: number;
  funnel_id?: number;
  funnel_stage_id?: number;
  forecast_amount?: number;
  secondary_responsible_manager_ids?: number[];
}

export interface CreateSaleRequest {
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: string;
  status: string;
  deferred_payment_date?: string;
  project_id?: number;
  products?: { product_id: number; quantity: number }[];
  services?: { service_id: number }[];
}

export interface UpdateSaleRequest {
  counterparty_id?: number;
  responsible_manager_id?: number;
  sale_date?: string;
  status?: string;
  deferred_payment_date?: string;
  project_id?: number;
  products?: { product_id: number; quantity: number }[];
  services?: { service_id: number }[];
}

// File Upload Types
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}