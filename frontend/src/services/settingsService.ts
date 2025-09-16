import { Manager } from '@/types/projects';
import { getAuthToken, redirectToLogin, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class SettingsService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    console.log('fetchWithAuth викликаний:', { url, hasToken: !!token });
    
    if (!token) {
      console.error('Токен аутентифікації відсутній');
      redirectToLogin();
      throw new Error('No authentication token found');
    }
    
    if (isTokenExpired(token)) {
      console.error('Токен аутентифікації прострочений');
      redirectToLogin();
      throw new Error('Authentication token expired');
    }
    
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('Виконання запиту:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('Відповідь від сервера:', { status: response.status, ok: response.ok });

    if (response.status === 401 || response.status === 403) {
      console.error('Помилка аутентифікації:', response.status);
      redirectToLogin();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', { status: response.status, errorText });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Результат від API:', result);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return result;
  }

  // Отримати поточні дані профілю
  async getCurrentProfile(): Promise<Manager> {
    console.log('Запит профілю користувача...');
    try {
      const result = await this.fetchWithAuth('/settings/profile');
      console.log('Профіль отримано:', result);
      return result;
    } catch (error) {
      console.error('Помилка при отриманні профілю:', error);
      throw error;
    }
  }

  // Оновити профіль користувача
  async updateProfile(data: UpdateProfileData): Promise<Manager> {
    return this.fetchWithAuth('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phoneNumber,
      }),
    });
  }

  // Змінити пароль
  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth('/settings/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      }),
    });
  }
}

export const settingsService = new SettingsService();