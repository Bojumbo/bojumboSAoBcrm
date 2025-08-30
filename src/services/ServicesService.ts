import api from '../api/httpClient';

export type Service = { service_id: number; name: string; price: number };

export const ServicesService = {
  async getAll(): Promise<Service[]> {
    const { data } = await api.get('/services');
    return data.data ?? data;
  },
  async create(payload: { name: string; price: number; description?: string | null }): Promise<Service> {
    const { data } = await api.post('/services', payload);
    return data.data ?? data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  }
};
