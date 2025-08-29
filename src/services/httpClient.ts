import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api';

// HTTP Client for API requests
export class HttpClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string | number>
  ): Promise<T> {
    const url = buildApiUrl(endpoint, params);
    const headers = {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...getAuthHeaders(),
      ...options.headers,
    };

    const config: RequestInit = {
      ...API_CONFIG.REQUEST_CONFIG,
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const data = await response.json();

      // Normalize common backend wrapper { success, data, message }
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        const payload = (data as any).data;

        // If the payload already matches requested shape, return it
        // If array and no pagination provided, synthesize a minimal PaginatedResponse
        if (Array.isArray(payload)) {
          if (!('pagination' in data)) {
            return {
              data: payload,
              pagination: {
                page: 1,
                limit: payload.length,
                total: payload.length,
                totalPages: 1,
              },
            } as unknown as T;
          }
        }

        // For non-array payloads (getById, create, update), return the inner object directly
        return payload as T;
      }

      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  static async get<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, params);
  }

  // POST request
  static async post<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, params);
  }

  // PUT request
  static async put<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, params);
  }

  // DELETE request
  static async delete<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, params);
  }

  // PATCH request
  static async patch<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, params);
  }

  // File upload
  static async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const url = buildApiUrl(endpoint);
    const headers = getAuthHeaders();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response wrapper for consistent API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
