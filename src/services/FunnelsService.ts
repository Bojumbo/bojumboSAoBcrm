import api from '../api/httpClient';

export type FunnelStage = {
  funnel_stage_id: number;
  name: string;
  order: number;
  funnel_id: number;
};

export type Funnel = {
  funnel_id: number;
  name: string;
  stages: FunnelStage[];
};

export const FunnelsService = {
  async getAll(): Promise<Funnel[]> {
    const { data } = await api.get('/funnels');
    return data.data;
  },
  async getById(id: number): Promise<Funnel> {
    const { data } = await api.get(`/funnels/${id}`);
    return data.data;
  },
  async create(payload: { name: string }): Promise<Funnel> {
    const { data } = await api.post('/funnels', payload);
    return data.data;
  },
  async update(id: number, payload: Partial<Pick<Funnel, 'name'>>): Promise<Funnel> {
    const { data } = await api.put(`/funnels/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/funnels/${id}`);
  },
  // Stages
  async createStage(payload: { name: string; funnel_id: number; order: number }): Promise<FunnelStage> {
    const { data } = await api.post('/funnels/stages', payload);
    return data.data;
  },
  async updateStage(id: number, payload: Partial<Pick<FunnelStage, 'name' | 'order'>>): Promise<FunnelStage> {
    const { data } = await api.put(`/funnels/stages/${id}`, payload);
    return data.data;
  },
  async removeStage(id: number): Promise<void> {
    await api.delete(`/funnels/stages/${id}`);
  }
};
