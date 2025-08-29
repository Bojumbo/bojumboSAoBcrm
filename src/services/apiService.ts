import { HttpClient, PaginationParams, PaginatedResponse } from './httpClient';
import { API_CONFIG } from '../config/api';
import { 
  Manager, 
  Counterparty, 
  Product, 
  Service, 
  Warehouse, 
  Sale, 
  Project, 
  SubProject, 
  Task,
  SaleStatusType,
  LoginRequest,
  LoginResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateSaleRequest,
  UpdateSaleRequest,
  Funnel,
  FunnelStage
} from '../types';

// Authentication Service
export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await HttpClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  static async logout(): Promise<void> {
    try {
      await HttpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  static async getCurrentUser(): Promise<Manager> {
    return HttpClient.get<Manager>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  static getCurrentUserFromStorage(): Manager | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Managers Service
export class ManagersService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Manager>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.MANAGERS}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Manager>>(endpoint);
  }

  static async getById(id: number): Promise<Manager> {
    return HttpClient.get<Manager>(`${API_CONFIG.ENDPOINTS.MANAGERS}/${id}`);
  }

  static async create(data: Omit<Manager, 'manager_id'>): Promise<Manager> {
    return HttpClient.post<Manager>(API_CONFIG.ENDPOINTS.MANAGERS, data);
  }

  static async update(id: number, data: Partial<Manager>): Promise<Manager> {
    return HttpClient.put<Manager>(`${API_CONFIG.ENDPOINTS.MANAGERS}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.MANAGERS}/${id}`);
  }
}

// Projects Service
export class ProjectsService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.PROJECTS}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Project>>(endpoint);
  }

  static async getById(id: number): Promise<Project> {
    return HttpClient.get<Project>(`${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`);
  }

  static async create(data: CreateProjectRequest): Promise<Project> {
    return HttpClient.post<Project>(API_CONFIG.ENDPOINTS.PROJECTS, data);
  }

  static async update(id: number, data: UpdateProjectRequest): Promise<Project> {
    return HttpClient.put<Project>(`${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.PROJECTS}/${id}`);
  }

  static async addComment(projectId: number, data: { manager_id: number; content: string; file?: { name: string; type: string; url: string } }): Promise<any> {
    const endpoint = `${API_CONFIG.ENDPOINTS.COMMENTS}/projects/${projectId}`;
    // Backend expects { content, manager_id, and optional file_{name,type,url} }
    const payload: any = {
      manager_id: data.manager_id,
      content: data.content,
    };
    if (data.file) {
      payload.file = {
        name: data.file.name,
        type: data.file.type,
        url: data.file.url,
      };
    }
    return HttpClient.post(endpoint, payload);
  }
}

// Sales Service
export class SalesService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Sale>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.SALES}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Sale>>(endpoint);
  }

  static async getById(id: number): Promise<Sale> {
    return HttpClient.get<Sale>(`${API_CONFIG.ENDPOINTS.SALES}/${id}`);
  }

  static async create(data: CreateSaleRequest): Promise<Sale> {
    return HttpClient.post<Sale>(API_CONFIG.ENDPOINTS.SALES, data);
  }

  static async update(id: number, data: UpdateSaleRequest): Promise<Sale> {
    return HttpClient.put<Sale>(`${API_CONFIG.ENDPOINTS.SALES}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.SALES}/${id}`);
  }
}

// Products Service
export class ProductsService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Product>>(endpoint);
  }

  static async getById(id: number): Promise<Product> {
    return HttpClient.get<Product>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }

  static async create(data: Omit<Product, 'product_id'>): Promise<Product> {
    return HttpClient.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS, data);
  }

  static async update(id: number, data: Partial<Product>): Promise<Product> {
    return HttpClient.put<Product>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }

  static async setProductStocks(id: number, stocks: Array<{ warehouse_id: number; quantity: number }>): Promise<void> {
    return HttpClient.post(`${API_CONFIG.ENDPOINTS.PRODUCT_STOCKS.replace(':id', id.toString())}`, { stocks });
  }
}

// Services Service
export class ServicesService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Service>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.SERVICES}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Service>>(endpoint);
  }

  static async getById(id: number): Promise<Service> {
    return HttpClient.get<Service>(`${API_CONFIG.ENDPOINTS.SERVICES}/${id}`);
  }

  static async create(data: Omit<Service, 'service_id'>): Promise<Service> {
    return HttpClient.post<Service>(API_CONFIG.ENDPOINTS.SERVICES, data);
  }

  static async update(id: number, data: Partial<Service>): Promise<Service> {
    return HttpClient.put<Service>(`${API_CONFIG.ENDPOINTS.SERVICES}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.SERVICES}/${id}`);
  }
}

// Counterparties Service
export class CounterpartiesService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Counterparty>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.COUNTERPARTIES}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Counterparty>>(endpoint);
  }

  static async getById(id: number): Promise<Counterparty> {
    return HttpClient.get<Counterparty>(`${API_CONFIG.ENDPOINTS.COUNTERPARTIES}/${id}`);
  }

  static async create(data: Omit<Counterparty, 'counterparty_id'>): Promise<Counterparty> {
    return HttpClient.post<Counterparty>(API_CONFIG.ENDPOINTS.COUNTERPARTIES, data);
  }

  static async update(id: number, data: Partial<Counterparty>): Promise<Counterparty> {
    return HttpClient.put<Counterparty>(`${API_CONFIG.ENDPOINTS.COUNTERPARTIES}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.COUNTERPARTIES}/${id}`);
  }
}

// Tasks Service
export class TasksService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.TASKS}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Task>>(endpoint);
  }

  static async getById(id: number): Promise<Task> {
    return HttpClient.get<Task>(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`);
  }

  static async create(data: Omit<Task, 'task_id'>): Promise<Task> {
    return HttpClient.post<Task>(API_CONFIG.ENDPOINTS.TASKS, data);
  }

  static async update(id: number, data: Partial<Task>): Promise<Task> {
    return HttpClient.put<Task>(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`);
  }
}

// SubProjects Service
export class SubProjectsService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<SubProject>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.SUBPROJECTS}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<SubProject>>(endpoint);
  }

  static async getById(id: number): Promise<SubProject> {
    return HttpClient.get<SubProject>(`${API_CONFIG.ENDPOINTS.SUBPROJECTS}/${id}`);
  }

  static async create(data: Omit<SubProject, 'sub_project_id'>): Promise<SubProject> {
    return HttpClient.post<SubProject>(API_CONFIG.ENDPOINTS.SUBPROJECTS, data);
  }

  static async update(id: number, data: Partial<SubProject>): Promise<SubProject> {
    return HttpClient.put<SubProject>(`${API_CONFIG.ENDPOINTS.SUBPROJECTS}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.SUBPROJECTS}/${id}`);
  }
}

// File Upload Service
export class FileUploadService {
  static async uploadFile(file: File, additionalData?: Record<string, any>): Promise<{ fileName: string; fileUrl: string; fileType: string }> {
    return HttpClient.upload(API_CONFIG.ENDPOINTS.UPLOAD, file, additionalData);
  }

  static async deleteFile(fileUrl: string): Promise<void> {
    return HttpClient.delete(API_CONFIG.ENDPOINTS.UPLOAD, { fileUrl });
  }
}

// Funnels Service
export class FunnelsService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Funnel>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.FUNNELS}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<Funnel>>(endpoint);
  }

  static async getById(id: number): Promise<Funnel> {
    return HttpClient.get<Funnel>(`${API_CONFIG.ENDPOINTS.FUNNELS}/${id}`);
  }

  static async create(data: Omit<Funnel, 'funnel_id'>): Promise<Funnel> {
    return HttpClient.post<Funnel>(API_CONFIG.ENDPOINTS.FUNNELS, data);
  }

  static async update(id: number, data: Partial<Funnel>): Promise<Funnel> {
    return HttpClient.put<Funnel>(`${API_CONFIG.ENDPOINTS.FUNNELS}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.FUNNELS}/${id}`);
  }
}

// Funnel Stages Service
export class FunnelStagesService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<FunnelStage>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.FUNNEL_STAGES_ALL}?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<FunnelStage>>(endpoint);
  }

  static async getById(id: number): Promise<FunnelStage> {
    return HttpClient.get<FunnelStage>(`${API_CONFIG.ENDPOINTS.FUNNEL_STAGES}/${id}`);
  }

  static async create(data: Omit<FunnelStage, 'funnel_stage_id'>): Promise<FunnelStage> {
    return HttpClient.post<FunnelStage>(API_CONFIG.ENDPOINTS.FUNNEL_STAGES, data);
  }

  static async update(id: number, data: Partial<FunnelStage>): Promise<FunnelStage> {
    return HttpClient.put<FunnelStage>(`${API_CONFIG.ENDPOINTS.FUNNEL_STAGES}/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`${API_CONFIG.ENDPOINTS.FUNNEL_STAGES}/${id}`);
  }

  static async getByFunnel(funnelId: number): Promise<PaginatedResponse<FunnelStage>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.FUNNEL_STAGES_ALL}?funnel_id=${funnelId}`;
    return HttpClient.get<PaginatedResponse<FunnelStage>>(endpoint);
  }
}

// Sale Status Types Service
export class SaleStatusTypeService {
  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<SaleStatusType>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `/api/sale-status-types?${queryParams.toString()}`;
    return HttpClient.get<PaginatedResponse<SaleStatusType>>(endpoint);
  }

  static async getById(id: number): Promise<SaleStatusType> {
    return HttpClient.get<SaleStatusType>(`/api/sale-status-types/${id}`);
  }

  static async create(data: Omit<SaleStatusType, 'sale_status_id'>): Promise<SaleStatusType> {
    return HttpClient.post<SaleStatusType>('/api/sale-status-types', data as any);
  }

  static async update(id: number, data: Partial<SaleStatusType>): Promise<SaleStatusType> {
    return HttpClient.put<SaleStatusType>(`/api/sale-status-types/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    return HttpClient.delete(`/api/sale-status-types/${id}`);
  }
}

// Export all services
export const apiService = {
  auth: AuthService,
  managers: ManagersService,
  projects: ProjectsService,
  sales: SalesService,
  products: ProductsService,
  services: ServicesService,
  counterparties: CounterpartiesService,
  tasks: TasksService,
  subprojects: SubProjectsService,
  fileUpload: FileUploadService,
  funnels: FunnelsService,
  funnelStages: FunnelStagesService,
};
