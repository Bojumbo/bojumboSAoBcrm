import { SubProjectFunnel, SubProjectFunnelStage } from '@/types/projects';
import { getAuthToken, redirectToLogin, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class SubProjectFunnelService {
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

  async getAll(): Promise<SubProjectFunnel[]> {
    return this.fetchWithAuth('/sub-project-funnels');
  }

  async getById(id: number): Promise<SubProjectFunnel> {
    return this.fetchWithAuth(`/sub-project-funnels/${id}`);
  }

  async create(name: string): Promise<SubProjectFunnel> {
    return this.fetchWithAuth('/sub-project-funnels', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async update(id: number, name: string): Promise<SubProjectFunnel> {
    return this.fetchWithAuth(`/sub-project-funnels/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`/sub-project-funnels/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllStages(): Promise<SubProjectFunnelStage[]> {
    return this.fetchWithAuth('/sub-project-funnels/stages/all');
  }

  async getStageById(id: number): Promise<SubProjectFunnelStage> {
    return this.fetchWithAuth(`/sub-project-funnels/stages/${id}`);
  }

  async getStagesByFunnelId(funnelId: number): Promise<SubProjectFunnelStage[]> {
    const funnel = await this.getById(funnelId);
    return funnel.stages || [];
  }

  async createStage(funnelId: number, name: string, order?: number): Promise<SubProjectFunnelStage> {
    return this.fetchWithAuth('/sub-project-funnels/stages', {
      method: 'POST',
      body: JSON.stringify({
        sub_project_funnel_id: funnelId,
        name,
        order: order || 999, // Додаємо в кінець, якщо порядок не вказано
      }),
    });
  }

  async updateStage(stageId: number, data: Partial<Pick<SubProjectFunnelStage, 'name' | 'order'>>): Promise<SubProjectFunnelStage> {
    console.log('Updating subproject stage:', stageId, 'with data:', data);
    const result = await this.fetchWithAuth(`/sub-project-funnels/stages/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    console.log('Subproject stage update result:', result);
    return result;
  }

  async deleteStage(stageId: number): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`/sub-project-funnels/stages/${stageId}`, {
      method: 'DELETE',
    });
  }

  async reorderStages(funnelId: number, stageOrders: { stage_id: number; order: number }[]): Promise<SubProjectFunnelStage[]> {
    return this.fetchWithAuth(`/sub-project-funnels/${funnelId}/reorder-stages`, {
      method: 'PUT',
      body: JSON.stringify({ stage_orders: stageOrders }),
    });
  }
}

export const subProjectFunnelService = new SubProjectFunnelService();