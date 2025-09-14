import { Manager } from '@/types/projects';
import { getAuthToken, redirectToLogin, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ManagerService {
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

  async getAll(): Promise<Manager[]> {
    return this.fetchWithAuth('/managers');
  }

  async getById(id: number): Promise<Manager> {
    return this.fetchWithAuth(`/managers/${id}`);
  }
}

export const managerService = new ManagerService();