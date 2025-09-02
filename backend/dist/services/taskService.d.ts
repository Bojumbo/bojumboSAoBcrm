import { Task, TaskWithRelations } from '../types/index.js';
interface TaskInput {
    title: string;
    description?: string | null;
    responsible_manager_id?: number | null;
    creator_manager_id?: number | null;
    project_id?: number | null;
    subproject_id?: number | null;
    due_date?: Date | null;
    status?: string;
}
export declare class TaskService {
    static getAll(userRole: string, userId: number): Promise<TaskWithRelations[]>;
    static getById(id: number, userRole: string, userId: number): Promise<TaskWithRelations | null>;
    static create(data: TaskInput): Promise<Task>;
    static update(id: number, data: Partial<TaskInput>): Promise<Task | null>;
    static updateStatus(id: number, status: string): Promise<Task | null>;
    static delete(id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=taskService.d.ts.map