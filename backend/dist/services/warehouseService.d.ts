import { Warehouse } from '../types/index.js';
interface WarehouseInput {
    name: string;
    location: string;
}
export declare class WarehouseService {
    static getAll(): Promise<Warehouse[]>;
    static getById(id: number): Promise<Warehouse | null>;
    static create(data: WarehouseInput): Promise<Warehouse>;
    static update(id: number, data: Partial<WarehouseInput>): Promise<Warehouse | null>;
    static delete(id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=warehouseService.d.ts.map