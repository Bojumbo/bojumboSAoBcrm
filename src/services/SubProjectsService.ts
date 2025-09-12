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
  },

  // Products management
  async addProduct(subprojectId: number, productId: number, quantity: number = 1): Promise<any> {
    const { data } = await api.post(`/subprojects/${subprojectId}/products`, {
      product_id: productId,
      quantity
    });
    return data.data ?? data;
  },

  async removeProduct(subprojectId: number, productId: number): Promise<void> {
    await api.delete(`/subprojects/${subprojectId}/products/${productId}`);
  },

  // Services management
  async addService(subprojectId: number, serviceId: number, quantity: number = 1.0): Promise<any> {
    const { data } = await api.post(`/subprojects/${subprojectId}/services`, {
      service_id: serviceId,
      quantity
    });
    return data.data ?? data;
  },

  async removeService(subprojectId: number, serviceId: number): Promise<void> {
    await api.delete(`/subprojects/${subprojectId}/services/${serviceId}`);
  }
};
