export interface Product {
  product_id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  unit_id?: number;
  created_at: string;
  updated_at: string;
  unit?: Unit;
  stocks?: ProductStock[];
}

export interface Unit {
  unit_id: number;
  name: string;
  created_at: string;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  location: string;
  created_at: string;
}

export interface ProductStock {
  product_stock_id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  warehouse: Warehouse;
}

export interface ProductWithRelations extends Product {
  unit?: Unit;
  stocks: ProductStock[];
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  price: number;
  unit_id?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  product_id: number;
}

export interface ProductsResponse {
  success: boolean;
  data?: Product[];
  error?: string;
}

export interface ProductResponse {
  success: boolean;
  data?: Product;
  error?: string;
}

export interface UnitsResponse {
  success: boolean;
  data?: Unit[];
  error?: string;
}

export interface WarehousesResponse {
  success: boolean;
  data?: Warehouse[];
  error?: string;
}