import axios from 'axios';

// Створюємо екземпляр axios з базовою конфігурацією
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додаємо інтерсептор для автоматичного додавання токену до запитів
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Додаємо інтерсептор для обробки відповідей
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Видаляємо токен при помилці 401
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Видаляємо cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      // Можна додати редірект на сторінку входу
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Sale {
  sale_id: number;
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: string;
  status: string;
  deferred_payment_date?: string;
  project_id?: number;
  created_at: string;
  updated_at: string;
  subproject_id?: number;
  counterparty?: {
    counterparty_id: number;
    name: string;
    counterparty_type: string;
  };
  responsible_manager?: {
    manager_id: number;
    first_name: string;
    last_name: string;
  };
  project?: {
    project_id: number;
    name: string;
  };
  subproject?: {
    subproject_id: number;
    name: string;
  };
  products?: Array<{
    product_id: number;
    quantity: number;
    product: {
      name: string;
      price: number;
      unit?: {
        name: string;
      };
    };
  }>;
  services?: Array<{
    service_id: number;
    quantity?: number;
    service: {
      name: string;
      price: number;
    };
  }>;
}

export interface CreateSaleData {
  counterparty_id: number;
  sale_date: string;
  status: string;
  deferred_payment_date?: string;
  project_id?: number;
  subproject_id?: number;
  products?: Array<{
    product_id: number;
    quantity: number;
  }>;
  services?: Array<{
    service_id: number;
    quantity?: number;
  }>;
}

export interface UpdateSaleData extends Partial<CreateSaleData> {}

export const salesService = {
  async getAll(): Promise<Sale[]> {
    const response = await api.get('/sales');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch sales');
  },

  async getById(id: number): Promise<Sale> {
    const response = await api.get(`/sales/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch sale');
  },

  async create(data: CreateSaleData): Promise<Sale> {
    console.log('Sending sale data to backend:', data);
    const response = await api.post('/sales', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create sale');
  },

  async update(id: number, data: UpdateSaleData): Promise<Sale> {
    const response = await api.put(`/sales/${id}`, data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update sale');
  },

  async delete(id: number): Promise<void> {
    const response = await api.delete(`/sales/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete sale');
    }
  }
};