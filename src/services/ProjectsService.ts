import api from '../api/httpClient';

export const ProjectsService = {
  async getAll(params?: any): Promise<any> {
    const { data } = await api.get('/projects', { params });
    // Backend returns { data, pagination, total? } — pass through
    return data;
  },
  async getById(id: number): Promise<any> {
    const { data } = await api.get(`/projects/${id}`);
    return data.data ?? data;
  },
  async update(id: number, payload: any): Promise<any> {
    const { data } = await api.put(`/projects/${id}`, payload);
    return data.data ?? data;
  }
};
