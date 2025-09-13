export interface Funnel {
  funnel_id: number;
  name: string;
  created_at: string;
  stages: FunnelStage[];
}

export interface FunnelStage {
  funnel_stage_id: number;
  name: string;
  funnel_id: number;
  order: number;
  created_at: string;
  funnel?: Funnel;
  projects?: Project[];
}

export interface Project {
  project_id: number;
  name: string;
  description?: string;
  main_responsible_manager_id?: number;
  counterparty_id?: number;
  funnel_id?: number;
  funnel_stage_id?: number;
  forecast_amount: string;
  created_at: string;
  updated_at: string;
  main_responsible_manager?: Manager;
  counterparty?: Counterparty;
  funnel?: Funnel;
  funnel_stage?: FunnelStage;
  secondary_responsible_managers?: ProjectManager[];
  subprojects?: SubProject[];
  tasks?: Task[];
  sales?: Sale[];
  products?: ProjectProduct[];
  services?: ProjectService[];
  comments?: ProjectComment[];
}

export interface ProjectManager {
  project_id: number;
  manager_id: number;
  created_at: string;
  manager: Manager;
}

export interface SubProject {
  subproject_id: number;
  name: string;
  description?: string;
  project_id: number;
  status?: string;
  cost: string;
  sub_project_funnel_id?: number;
  sub_project_funnel_stage_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  task_id: number;
  title: string;
  description?: string;
  responsible_manager_id?: number;
  creator_manager_id?: number;
  project_id?: number;
  subproject_id?: number;
  due_date?: string;
  status: 'new' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  created_at: string;
  updated_at: string;
  responsible_manager?: Manager;
  creator_manager?: Manager;
}

export interface Sale {
  sale_id: number;
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: string;
  status: string;
  deferred_payment_date?: string;
  project_id?: number;
  subproject_id?: number;
  created_at: string;
  updated_at: string;
  counterparty: Counterparty;
  responsible_manager: Manager;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: string;
  unit_id?: number;
  created_at: string;
  updated_at: string;
  unit?: Unit;
}

export interface Unit {
  unit_id: number;
  name: string;
  created_at: string;
}

export interface ProjectProduct {
  project_product_id: number;
  project_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  product: Product;
}

export interface ProjectService {
  project_service_id: number;
  project_id: number;
  service_id: number;
  created_at: string;
  service: Service;
}

export interface Service {
  service_id: number;
  name: string;
  description?: string;
  price: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectComment {
  comment_id: number;
  project_id: number;
  manager_id: number;
  content: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  is_deleted: boolean;
  created_at: string;
  manager: Manager;
}

export interface Manager {
  manager_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface Counterparty {
  counterparty_id: number;
  name: string;
  counterparty_type: string;
  phone?: string;
  email?: string;
  responsible_manager_id?: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  main_responsible_manager_id?: number;
  counterparty_id?: number;
  funnel_id?: number;
  funnel_stage_id?: number;
  forecast_amount: number;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  project_id: number;
}

export interface ProjectsResponse {
  success: boolean;
  data?: Project[];
  error?: string;
}

export interface FunnelsResponse {
  success: boolean;
  data?: Funnel[];
  error?: string;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project;
  error?: string;
}
