import { Funnel, FunnelStage } from '@/types/projects';
import { getAuthToken, redirectToLogin, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class FunnelService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    if (!token) {
      redirectToLogin();
      throw new Error('No authentication token found');
    }
    
    if (isTokenExpired(token)) {
      redirectToLogin();
      throw new Error('Authentication token expired');
    }
    
    const fullUrl = `${API_BASE_URL}${url}`;
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401 || response.status === 403) {
      redirectToLogin();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return result;
  }

  async getAll(): Promise<Funnel[]> {
    return this.fetchWithAuth('/funnels');
  }

  async getById(id: number): Promise<Funnel> {
    return this.fetchWithAuth(`/funnels/${id}`);
  }

  async getAllStages(): Promise<FunnelStage[]> {
    return this.fetchWithAuth('/funnels/stages/all');
  }

  async getStageById(id: number): Promise<FunnelStage> {
    return this.fetchWithAuth(`/funnels/stages/${id}`);
  }

  async getStagesByFunnelId(funnelId: number): Promise<FunnelStage[]> {
    const funnel = await this.getById(funnelId);
    return funnel.stages || [];
  }
}

export const funnelService = new FunnelService();