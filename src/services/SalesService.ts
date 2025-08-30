import api from '../api/httpClient';

export const SalesService = {
  async create(payload: any): Promise<any> {
    const { data } = await api.post('/sales', payload);
    return data.data ?? data;
  }
};