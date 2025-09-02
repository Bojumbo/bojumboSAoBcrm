import { Product, ProductWithRelations, ProductStockWithRelations } from '../types/index.js';
interface ProductInput {
    name: string;
    description?: string | null;
    price: number;
    unit_id?: number | null;
}
export declare class ProductService {
    static getAll(): Promise<ProductWithRelations[]>;
    static getById(id: number): Promise<ProductWithRelations | null>;
    static create(data: ProductInput): Promise<Product>;
    static update(id: number, data: Partial<ProductInput>): Promise<Product | null>;
    static delete(id: number): Promise<boolean>;
    static setProductStocks(productId: number, stocks: {
        warehouse_id: number;
        quantity: number;
    }[]): Promise<boolean>;
    static getProductStocks(productId: number): Promise<ProductStockWithRelations[]>;
}
export {};
//# sourceMappingURL=productService.d.ts.map