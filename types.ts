
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
  INDIVIDUAL = 'Фізична особа',
  LEGAL_ENTITY = 'Юридична особа',
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
  created_at: string; // ISO string
  manager?: Manager;
  file?: {
    name: string;
    type: string; // MIME type
    url: string;  // data URL
  } | null;
}

export interface Project {
  project_id: number;
  name: string;
  description?: string;
  main_responsible_manager_id: number | null;
  secondary_responsible_manager_ids?: number[];
  counterparty_id: number | null;
  funnel_id?: number | null;
  funnel_stage_id?: number | null;
  forecast_amount: number;
  main_responsible_manager?: Manager;
  secondary_responsible_managers?: Manager[];
  counterparty?: Counterparty;
  subprojects?: SubProject[];
  tasks?: Task[];
  sales?: Sale[];
  project_products?: ProjectProduct[];
  project_services?: ProjectService[];
  comments?: ProjectComment[];
  funnel?: Funnel;
  funnel_stage?: FunnelStage;
}

export interface SubProjectComment {
  comment_id: number;
  subproject_id: number;
  manager_id: number;
  content: string;
  created_at: string; // ISO string
  manager?: Manager;
  file?: {
    name: string;
    type: string; // MIME type
    url: string;  // data URL
  } | null;
}

export interface SubProjectProduct {
  subproject_product_id: number;
  subproject_id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface SubProjectService {
  subproject_service_id: number;
  subproject_id: number;
  service_id: number;
  service?: Service;
}

export interface SubProject {
  subproject_id: number;
  name: string;
  description?: string;
  project_id: number;
  status?: string;
  cost: number;
  project?: Project;
  tasks?: Task[];
  comments?: SubProjectComment[];
  subproject_products?: SubProjectProduct[];
  subproject_services?: SubProjectService[];
}

export interface Task {
  task_id: number;
  title: string;
  description: string;
  responsible_manager_id: number | null;
  creator_manager_id: number | null;
  project_id: number | null;
  subproject_id: number | null;
  due_date: string | null;
  responsible_manager?: Manager;
  creator_manager?: Manager;
  project?: Project;
  subproject?: SubProject;
}