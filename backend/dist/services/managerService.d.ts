import { Manager, ManagerWithRelations, ManagerRole } from '../types/index.js';
interface ManagerInput {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: ManagerRole;
    password_hash: string;
    supervisor_ids?: number[];
}
export declare class ManagerService {
    static getAll(userRole: string, userId: number): Promise<ManagerWithRelations[]>;
    static getById(id: number, userRole: string, userId: number): Promise<ManagerWithRelations | null>;
    static create(data: ManagerInput): Promise<Manager>;
    static update(id: number, data: Partial<ManagerInput>): Promise<Manager | null>;
    static delete(id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=managerService.d.ts.map