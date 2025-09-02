import { SubProject, SubProjectWithRelations } from '../types/index.js';
interface SubProjectInput {
    name: string;
    description?: string | null;
    project_id: number;
    status?: string | null;
    cost: number;
}
export declare class SubProjectService {
    static getAll(userRole: string, userId: number): Promise<SubProjectWithRelations[]>;
    static getById(id: number, userRole: string, userId: number): Promise<SubProjectWithRelations | null>;
    static create(data: SubProjectInput): Promise<SubProject>;
    static update(id: number, data: Partial<SubProjectInput>): Promise<SubProject | null>;
    static delete(id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=subProjectService.d.ts.map