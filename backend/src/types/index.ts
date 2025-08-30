import { 
  Manager as PrismaManager, 
  Counterparty as PrismaCounterparty, 
  Product as PrismaProduct, 
  Service as PrismaService, 
  Warehouse as PrismaWarehouse, 
  Sale as PrismaSale, 
  Project as PrismaProject, 
  SubProject as PrismaSubProject, 
  Task as PrismaTask, 
  Unit as PrismaUnit, 
  SaleStatusType as PrismaSaleStatusType, 
  SubProjectStatusType as PrismaSubProjectStatusType, 
  ProjectProduct as PrismaProjectProduct, 
  ProjectService as PrismaProjectService, 
  ProjectComment as PrismaProjectComment, 
  ProductStock as PrismaProductStock, 
  Funnel as PrismaFunnel, 
  FunnelStage as PrismaFunnelStage, 
  SubProjectComment as PrismaSubProjectComment, 
  SubProjectProduct as PrismaSubProjectProduct, 
  SubProjectService as PrismaSubProjectService,
  ProjectManager as PrismaProjectManager,
  CounterpartyType as PrismaCounterpartyType,
  SaleProduct as PrismaSaleProduct,
  SaleService as PrismaSaleService
} from '@prisma/client';

// Re-exporting enums if they are used elsewhere
export type { ManagerRole, CounterpartyType as CounterpartyTypeEnum } from '@prisma/client';

// Base model types aligned with schema.prisma
// Using Prisma's generated types is safer and more maintainable.
// We can create derivative types for properties that need transformation (e.g., Decimal -> number).

export type Manager = PrismaManager;
// The 'type' property in Counterparty model is an enum in the DB, but we treat it as a string in the app.
export type Counterparty = Omit<PrismaCounterparty, 'counterparty_type'> & { counterparty_type: string; };
export type Product = Omit<PrismaProduct, 'price'> & { price: number; };
export type Service = Omit<PrismaService, 'price'> & { price: number; };
export type Warehouse = PrismaWarehouse;
export type Sale = PrismaSale;
export type Project = Omit<PrismaProject, 'forecast_amount'> & { forecast_amount: number; };
export type SubProject = Omit<PrismaSubProject, 'cost'> & { cost: number; };
export type Task = PrismaTask;
export type Unit = PrismaUnit;
export type ProductStock = PrismaProductStock;
export type Funnel = PrismaFunnel;
export type FunnelStage = PrismaFunnelStage;
export type ProjectProduct = PrismaProjectProduct;
export type ProjectService = PrismaProjectService;
export type ProjectComment = PrismaProjectComment;
export type SubProjectComment = PrismaSubProjectComment;
export type SubProjectProduct = PrismaSubProjectProduct;
export type SubProjectService = PrismaSubProjectService;
export type ProjectManager = PrismaProjectManager;
export type CounterpartyType = PrismaCounterpartyType;
export type SaleStatusType = PrismaSaleStatusType;
export type SubProjectStatusType = PrismaSubProjectStatusType;


// Extended types with relationships for deep data fetching
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
  responsible_manager?: Manager | null;
  sales?: Sale[];
  projects?: Project[];
}

export interface ProductWithRelations extends Product {
  unit?: Unit | null;
  stocks?: ProductStockWithRelations[];
  total_stock?: number;
}

export interface ProductStockWithRelations extends ProductStock {
  warehouse?: Warehouse;
}

export interface SaleWithRelations extends Sale {
  counterparty?: Counterparty;
  responsible_manager?: Manager;
  project?: Project | null;
  products?: (PrismaSaleProduct & { product: Product })[];
  services?: (PrismaSaleService & { service: Service })[];
  total_price?: number;
}

export interface ProjectWithRelations extends Project {
  main_responsible_manager?: Manager | null;
  secondary_responsible_managers?: ProjectManagerWithRelations[];
  counterparty?: Counterparty | null;
  funnel?: Funnel | null;
  funnel_stage?: FunnelStage | null;
  subprojects?: SubProject[];
  tasks?: TaskWithRelations[];
  sales?: SaleWithRelations[];
  products?: ProjectProductWithRelations[];
  services?: ProjectServiceWithRelations[];
  comments?: ProjectCommentWithRelations[];
}

export interface SubProjectWithRelations extends SubProject {
  project?: Project;
  tasks?: TaskWithRelations[];
  comments?: SubProjectCommentWithRelations[];
  products?: SubProjectProductWithRelations[];
  services?: SubProjectServiceWithRelations[];
}

export interface TaskWithRelations extends Task {
  responsible_manager?: Manager | null;
  creator_manager?: Manager | null;
  project?: Project | null;
  subproject?: SubProject | null;
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

export interface ProjectManagerWithRelations extends ProjectManager {
  manager: Manager;
  project: Project;
}


// Request/Response types for API contracts
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
  description?: string | null;
  main_responsible_manager_id?: number | null;
  counterparty_id?: number | null;
  funnel_id?: number | null;
  funnel_stage_id?: number | null;
  forecast_amount: number;
  secondary_responsible_manager_ids?: number[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}


export interface CreateSaleRequest {
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: Date | string;
  status: string | number; // allow numeric id from client, convert server-side
  deferred_payment_date?: Date | string | null;
  project_id?: number | null;
  subproject_id?: number | null;
  products?: { product_id: number; quantity: number }[];
  services?: { service_id: number; quantity?: number }[];
}

export interface UpdateSaleRequest extends Partial<CreateSaleRequest> {}

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
