// Temporarily commented out Prisma imports until client is generated
// import { Manager, Counterparty, Product, Service, Warehouse, Sale, Project, SubProject, Task, CounterpartyType, Unit, SaleStatusType, SubProjectStatusType, ProjectProduct, ProjectService, ProjectComment, ProductStock, Funnel, FunnelStage, SubProjectComment, SubProjectProduct, SubProjectService } from '@prisma/client';

// Basic type definitions for compilation
export interface Manager {
  manager_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: 'admin' | 'head' | 'manager';
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Counterparty {
  counterparty_id: number;
  name: string;
  type: string;
  responsible_manager_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: number;
  unit_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  service_id: number;
  name: string;
  description?: string;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  address?: string;
  created_at: Date;
}

export interface Sale {
  sale_id: number;
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: Date;
  status: string;
  deferred_payment_date?: Date;
  project_id?: number;
  created_at: Date;
  updated_at: Date;
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
  secondary_responsible_manager_ids?: number[];
  created_at: Date;
  updated_at: Date;
}

export interface SubProject {
  sub_project_id: number;
  name: string;
  description?: string;
  project_id: number;
  status: string;
  created_at: Date;
  updated_at: Date;
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
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Unit {
  unit_id: number;
  name: string;
  short_name: string;
  created_at: Date;
}

export interface ProductStock {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface Funnel {
  funnel_id: number;
  name: string;
  created_at: Date;
}

export interface FunnelStage {
  funnel_stage_id: number;
  name: string;
  funnel_id: number;
  order: number;
  created_at: Date;
}

export interface ProjectProduct {
  project_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
}

export interface ProjectService {
  project_id: number;
  service_id: number;
  created_at: Date;
}

export interface ProjectComment {
  comment_id: number;
  project_id: number;
  manager_id: number;
  content: string;
  file_url?: string;
  created_at: Date;
}

export interface SubProjectComment {
  comment_id: number;
  sub_project_id: number;
  manager_id: number;
  content: string;
  file_url?: string;
  created_at: Date;
}

export interface SubProjectProduct {
  sub_project_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
}

export interface SubProjectService {
  sub_project_id: number;
  service_id: number;
  created_at: Date;
}

export interface ProjectManager {
  project_id: number;
  manager_id: number;
}

export interface CounterpartyType {
  counterparty_type_id: number;
  name: string;
  created_at: Date;
}

export interface SaleStatusType {
  sale_status_id: number;
  name: string;
  created_at: Date;
}

export interface SubProjectStatusType {
  sub_project_status_id: number;
  name: string;
  created_at: Date;
}

// Extended types with relationships
export interface ManagerWithRelations extends Manager {
  supervisors?: Manager[];
  subordinates?: Manager[];
  counterparties?: Counterparty[];
  sales?: Sale[];
  projects_as_main?: Project[];
  projects_as_secondary?: ProjectManager[];
  tasks_as_responsible?: Task[];
  tasks_as_creator?: Task[];
  project_comments?: ProjectComment[];
  subproject_comments?: SubProjectComment[];
}

export interface CounterpartyWithRelations extends Counterparty {
  responsible_manager?: Manager;
  sales?: Sale[];
  projects?: Project[];
}

export interface ProductWithRelations extends Product {
  unit?: Unit;
  stocks?: ProductStock[];
  total_stock?: number;
}

export interface ProductStockWithRelations extends ProductStock {
  warehouse?: Warehouse;
}

export interface SaleWithRelations extends Sale {
  counterparty?: Counterparty;
  responsible_manager?: Manager;
  project?: Project;
  products?: { product: Product; quantity: number }[];
  services?: Service[];
  total_price?: number;
}

export interface ProjectWithRelations extends Project {
  main_responsible_manager?: Manager;
  secondary_responsible_managers?: Manager[];
  counterparty?: Counterparty;
  funnel?: Funnel;
  funnel_stage?: FunnelStage;
  subprojects?: SubProject[];
  tasks?: Task[];
  sales?: SaleWithRelations[];
  project_products?: ProjectProductWithRelations[];
  project_services?: ProjectServiceWithRelations[];
  comments?: ProjectCommentWithRelations[];
}

export interface SubProjectWithRelations extends SubProject {
  project?: ProjectWithRelations;
  tasks?: Task[];
  comments?: SubProjectCommentWithRelations[];
  subproject_products?: SubProjectProductWithRelations[];
  subproject_services?: SubProjectServiceWithRelations[];
}

export interface TaskWithRelations extends Task {
  responsible_manager?: Manager;
  creator_manager?: Manager;
  project?: Project;
  subproject?: SubProject;
}

export interface ProjectProductWithRelations extends ProjectProduct {
  product?: Product;
}

export interface ProjectServiceWithRelations extends ProjectService {
  service?: Service;
}

export interface ProjectCommentWithRelations extends ProjectComment {
  manager?: Manager;
}

export interface SubProjectCommentWithRelations extends SubProjectComment {
  manager?: Manager;
}

export interface SubProjectProductWithRelations extends SubProjectProduct {
  product?: Product;
}

export interface SubProjectServiceWithRelations extends SubProjectService {
  service?: Service;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<Manager, 'password_hash'>;
  token: string;
}

export interface AuthUser {
  manager_id: number;
  email: string;
  role: string;
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
  sale_date: Date;
  status: string;
  deferred_payment_date?: Date;
  project_id?: number;
  products?: { product_id: number; quantity: number }[];
  services?: { service_id: number }[];
}

export interface UpdateSaleRequest {
  counterparty_id?: number;
  responsible_manager_id?: number;
  sale_date?: Date;
  status?: string;
  deferred_payment_date?: Date;
  project_id?: number;
  products?: { product_id: number; quantity: number }[];
  services?: { service_id: number }[];
}

// File upload types
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
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
