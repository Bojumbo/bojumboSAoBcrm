import { Sale, SaleWithRelations, CreateSaleRequest, UpdateSaleRequest } from '../types/index.js';
export declare class SaleService {
    static getAll(userRole: string, userId: number): Promise<SaleWithRelations[]>;
    static getById(id: number, userRole: string, userId: number): Promise<SaleWithRelations | null>;
    static create(data: CreateSaleRequest): Promise<Sale>;
    static update(id: number, data: UpdateSaleRequest): Promise<Sale | null>;
    static delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=saleService.d.ts.map