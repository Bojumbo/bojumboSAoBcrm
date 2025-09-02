import { Project, ProjectWithRelations, SubProject, SubProjectWithRelations, Product, Sale } from '../types/index.js';
export declare class ProjectService {
    static getAll(userRole: string, userId: number): Promise<any[]>;
    static getById(id: number, userRole: string, userId: number): Promise<ProjectWithRelations | null>;
    static create(data: CreateProjectRequest): Promise<Project>;
    static update(id: number, data: UpdateProjectRequest): Promise<Project | null>;
    static delete(id: number): Promise<boolean>;
    static addProduct(project_id: number, data: {
        product_id: number;
        quantity: number;
    }): Promise<any>;
    static removeProduct(project_product_id: number): Promise<boolean>;
    static addService(project_id: number, data: {
        service_id: number;
        quantity?: number;
    }): Promise<any>;
    static removeService(project_service_id: number): Promise<boolean>;
    static removeServiceByServiceId(project_id: number, service_id: number): Promise<boolean>;
}
export declare class SubProjectService {
    static getAll(userRole: string, userId: number): Promise<any[]>;
    static getById(id: number): Promise<SubProjectWithRelations | null>;
    static create(data: Omit<SubProject, 'subproject_id' | 'created_at' | 'updated_at' | 'cost'> & {
        cost: number;
    }): Promise<SubProject>;
    static update(id: number, data: Partial<Omit<SubProject, 'subproject_id' | 'project_id'>>): Promise<SubProject | null>;
    static delete(id: number): Promise<boolean>;
}
export declare class ProductService {
    static getAll(): Promise<Product[]>;
    static update(id: number, data: Partial<Product>): Promise<Product | null>;
}
export declare class SaleService {
    static update(id: number, data: Partial<Sale>): Promise<Sale | null>;
}
interface CreateProjectRequest {
    name: string;
    description?: string | null;
    main_responsible_manager_id?: number | null;
    counterparty_id?: number | null;
    funnel_id?: number | null;
    funnel_stage_id?: number | null;
    forecast_amount: number;
    secondary_responsible_manager_ids?: number[];
}
interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
}
export {};
//# sourceMappingURL=projectService.d.ts.map