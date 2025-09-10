import { SubProjectFunnel, SubProjectFunnelStage } from '../../backend/src/types';
import httpClient from '../api/httpClient';

const API_URL = 'sub-project-funnels';

class SubProjectFunnelsService {
  getAll(): Promise<SubProjectFunnel[]> {
    return httpClient.get(API_URL).then(res => res.data.data);
  }

  getById(id: number): Promise<SubProjectFunnel> {
    return httpClient.get(`${API_URL}/${id}`).then(res => res.data.data);
  }

  create(data: Partial<SubProjectFunnel>): Promise<SubProjectFunnel> {
    return httpClient.post(API_URL, data).then(res => res.data.data);
  }

  update(id: number, data: Partial<SubProjectFunnel>): Promise<SubProjectFunnel> {
    return httpClient.put(`${API_URL}/${id}`, data).then(res => res.data.data);
  }

  delete(id: number): Promise<void> {
    return httpClient.delete(`${API_URL}/${id}`);
  }

  // Stages
  createStage(data: Partial<SubProjectFunnelStage>): Promise<SubProjectFunnelStage> {
    return httpClient.post(`${API_URL}/stages`, data).then(res => res.data.data);
  }

  updateStage(id: number, data: Partial<SubProjectFunnelStage>): Promise<SubProjectFunnelStage> {
    return httpClient.put(`${API_URL}/stages/${id}`, data).then(res => res.data.data);
  }

  deleteStage(id: number): Promise<void> {
    return httpClient.delete(`${API_URL}/stages/${id}`);
  }
}

export default new SubProjectFunnelsService();
