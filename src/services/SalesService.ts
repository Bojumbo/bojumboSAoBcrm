import api from '../api/httpClient';

export const SalesService = {
  async create(payload: any): Promise<any> {
    const { data } = await api.post('/sales', payload);
    return data.data ?? data;
  },
  
  async delete(saleId: number): Promise<any> {
    const { data } = await api.delete(`/sales/${saleId}`);
    return data;
  }
};