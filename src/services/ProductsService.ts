import api from '../api/httpClient';

export type Product = { product_id: number; name: string; price: number; unit?: { name: string } | null };

export const ProductsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get('/products');
    return data.data ?? data;
  },
  async create(payload: { name: string; price: number; unit_id?: number | null; description?: string | null }): Promise<Product> {
    const { data } = await api.post('/products', payload);
    return data.data ?? data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
