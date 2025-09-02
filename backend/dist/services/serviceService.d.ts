import { Service } from '../types/index.js';
interface ServiceInput {
    name: string;
    description?: string | null;
    price: number;
}
export declare class ServiceService {
    static getAll(): Promise<Service[]>;
    static getById(id: number): Promise<Service | null>;
    static create(data: ServiceInput): Promise<Service>;
    static update(id: number, data: Partial<ServiceInput>): Promise<Service | null>;
    static delete(id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=serviceService.d.ts.map