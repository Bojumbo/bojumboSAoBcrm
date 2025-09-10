import api from '../api/httpClient';

export const SubProjectsService = {
  async getAll(params?: any): Promise<any> {
    const { data } = await api.get('/subprojects', { params });
    return data.data ?? data;
  },
  async getById(id: number): Promise<any> {
    const { data } = await api.get(`/subprojects/${id}`);
    return data.data ?? data;
  },
  async update(id: number, payload: any): Promise<any> {
    const { data } = await api.put(`/subprojects/${id}`, payload);
    return data.data ?? data;
  },
  async create(payload: { project_id: number; name: string; description?: string | null; status?: string | null; cost: number }): Promise<any> {
    const { data } = await api.post('/subprojects', payload);
    return data.data ?? data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/subprojects/${id}`);
  }
};
