import { 
  Product, 
  ProductWithRelations,
  Unit, 
  Warehouse,
  CreateProductRequest, 
  UpdateProductRequest,
  ProductsResponse,
  ProductResponse,
  UnitsResponse,
  WarehousesResponse
} from '@/types/products';
import { getAuthToken, redirectToLogin, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ProductService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    if (!token || isTokenExpired(token)) {
      redirectToLogin();
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      redirectToLogin();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Перевіряємо чи API повертає дані у форматі {success: true, data: ...}
    if (result.success && result.data) {
      return result.data;
    }
    
    // Якщо дані у звичайному форматі, повертаємо як є
    return result;
  }

  async getAll(): Promise<ProductWithRelations[]> {
    return this.fetchWithAuth('/products');
  }

  async getById(id: number): Promise<ProductWithRelations> {
    return this.fetchWithAuth(`/products/${id}`);
  }

  async create(product: CreateProductRequest): Promise<Product> {
    return this.fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async update(id: number, product: Partial<CreateProductRequest>): Promise<Product> {
    return this.fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async delete(id: number): Promise<void> {
    return this.fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getUnits(): Promise<Unit[]> {
    return this.fetchWithAuth('/units');
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return this.fetchWithAuth('/warehouses');
  }

  async setProductStocks(productId: number, stocks: { warehouse_id: number, quantity: number }[]): Promise<void> {
    return this.fetchWithAuth(`/products/${productId}/stock`, {
      method: 'POST',
      body: JSON.stringify({ stocks }),
    });
  }

  async getProductStocks(productId: number): Promise<any[]> {
    return this.fetchWithAuth(`/products/${productId}/stock`);
  }
}

export const productService = new ProductService();