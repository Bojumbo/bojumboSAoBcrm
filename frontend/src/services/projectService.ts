import { Project } from '@/types/projects';
import { getAuthToken, redirectToLogin, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ProjectService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    if (!token) {
      redirectToLogin();
      throw new Error('No authentication token found');
    }
    
    // Перевіряємо чи токен не закінчився
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
      // Якщо токен недійсний, перенаправляємо на логін
      redirectToLogin();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Перевіряємо чи API повертає дані у форматі {success: true, data: ...}
    if (result.success && result.data) {
      return result.data;
    }
    
    // Якщо дані у звичайному форматі, повертаємо як є
    return result;
  }

  async getAll(): Promise<Project[]> {
    return this.fetchWithAuth('/projects');
  }

  async getById(id: number): Promise<Project> {
    return this.fetchWithAuth(`/projects/${id}`);
  }

  async create(project: Partial<Project>): Promise<Project> {
    return this.fetchWithAuth('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async update(id: number, project: Partial<Project>): Promise<Project> {
    return this.fetchWithAuth(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async delete(id: number): Promise<void> {
    return this.fetchWithAuth(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getProducts(id: number): Promise<any[]> {
    return this.fetchWithAuth(`/projects/${id}/products`);
  }

  async addProduct(id: number, productData: any): Promise<any> {
    return this.fetchWithAuth(`/projects/${id}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async removeProduct(id: number, projectProductId: number): Promise<void> {
    return this.fetchWithAuth(`/projects/${id}/products/${projectProductId}`, {
      method: 'DELETE',
    });
  }

  async addService(id: number, serviceData: any): Promise<any> {
    return this.fetchWithAuth(`/projects/${id}/services`, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async removeService(id: number, projectServiceId: number): Promise<void> {
    return this.fetchWithAuth(`/projects/${id}/services/${projectServiceId}`, {
      method: 'DELETE',
    });
  }

  async addSecondaryManager(projectId: number, managerId: number): Promise<any> {
    return this.fetchWithAuth(`/projects/${projectId}/managers`, {
      method: 'POST',
      body: JSON.stringify({ manager_id: managerId }),
    });
  }

  async removeSecondaryManager(projectId: number, managerId: number): Promise<void> {
    return this.fetchWithAuth(`/projects/${projectId}/managers/${managerId}`, {
      method: 'DELETE',
    });
  }
}

export const projectService = new ProjectService();