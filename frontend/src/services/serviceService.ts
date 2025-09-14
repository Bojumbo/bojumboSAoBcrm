import { 
  Service, 
  ServiceWithRelations,
  ServiceInput,
  ServiceResponse,
  ServicesResponse,
  DeleteServiceResponse
} from '@/types/services';
import { getAuthToken, redirectToLogin, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ServiceService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    if (!token || isTokenExpired(token)) {
      redirectToLogin();
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      redirectToLogin();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorText = await response.text();
      
      // Спочатку перевіряємо, чи це статус 400 (валідація)
      const isValidationError = response.status === 400;
      
      try {
        const errorData = JSON.parse(errorText);
        
        // Якщо успішно парсили JSON і є поле error
        if (errorData && typeof errorData === 'object' && errorData.error) {
          // Не логуємо помилки валідації
          if (!isValidationError) {
            console.error('API Error:', errorText);
          }
          throw new Error(errorData.error);
        }
        
        // Якщо JSON парсився, але немає поля error
        console.error('API Error (no error field):', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
        
      } catch (parseError) {
        // Перевіряємо, чи це помилка парсингу, чи помилка що ми кинули вище
        if (parseError instanceof Error && parseError.message.includes('послуг')) {
          // Це наша кинута помилка, передаємо далі
          throw parseError;
        }
        
        // Це справжня помилка парсингу JSON
        console.error('API Error (JSON parse failed):', errorText, 'Parse error:', parseError);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const result = await response.json();
    
    // Перевіряємо чи API повертає дані у форматі {success: true, data: ...}
    if (result.success && result.data) {
      return result.data;
    }
    
    // Якщо дані у звичайному форматі, повертаємо як є
    return result;
  }

  async getAll(searchQuery?: string): Promise<ServiceWithRelations[]> {
    const url = searchQuery ? `/services?search=${encodeURIComponent(searchQuery)}` : '/services';
    return this.fetchWithAuth(url);
  }

  async getById(id: number): Promise<ServiceWithRelations> {
    return this.fetchWithAuth(`/services/${id}`);
  }

  async create(service: ServiceInput): Promise<Service> {
    return this.fetchWithAuth('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  }

  async update(id: number, service: Partial<ServiceInput>): Promise<Service> {
    return this.fetchWithAuth(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
  }

  async delete(id: number): Promise<void> {
    return this.fetchWithAuth(`/services/${id}`, {
      method: 'DELETE',
    });
  }
}

export const serviceService = new ServiceService();