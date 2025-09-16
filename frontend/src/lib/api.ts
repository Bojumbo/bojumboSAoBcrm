import axios from 'axios';
import { LoginRequest, LoginResponse } from '@/types/auth';
import { 
  Project, 
  Funnel, 
  ProjectsResponse, 
  FunnelsResponse, 
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  SubProject,
  SubProjectFunnel,
  Task,
  Manager
} from '@/types/projects';
import { Counterparty, CounterpartyWithRelations } from '@/types/counterparties';

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

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        error: 'Помилка підключення до сервера',
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Видаляємо cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
};

export const projectsAPI = {
  getAll: async (): Promise<ProjectsResponse> => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження проектів',
      };
    }
  },

  getById: async (id: number): Promise<ProjectResponse> => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження проекту',
      };
    }
  },

  create: async (projectData: CreateProjectRequest): Promise<ProjectResponse> => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка створення проекту',
      };
    }
  },

  update: async (id: number, projectData: Partial<UpdateProjectRequest>): Promise<ProjectResponse> => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка оновлення проекту',
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/projects/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка видалення проекту',
      };
    }
  },

  updateStage: async (projectId: number, stageId: number): Promise<ProjectResponse> => {
    try {
      const response = await api.put(`/projects/${projectId}`, {
        funnel_stage_id: stageId
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка оновлення етапу проекту',
      };
    }
  },
};

export const funnelsAPI = {
  getAll: async (): Promise<FunnelsResponse> => {
    try {
      const response = await api.get('/funnels');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження воронок',
      };
    }
  },

  getById: async (id: number): Promise<{ success: boolean; data?: Funnel; error?: string }> => {
    try {
      const response = await api.get(`/funnels/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження воронки',
      };
    }
  },
};

export const counterpartiesAPI = {
  createCounterparty: async (data: Partial<Counterparty>) => {
    try {
      const response = await fetch('/api/counterparties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка створення контрагента');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Помилка створення контрагента');
    }
  },

  updateCounterparty: async (id: number, data: Partial<Counterparty>) => {
    try {
      const response = await fetch(`/api/counterparties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка оновлення контрагента');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Помилка оновлення контрагента');
    }
  },

  getCounterparty: async (id: number) => {
    try {
      const response = await fetch(`/api/counterparties/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка отримання контрагента');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Помилка отримання контрагента');
    }
  },
};

// Типи для відповідей API підпроектів
export interface SubProjectsResponse {
  success: boolean;
  data?: SubProject[];
  error?: string;
}

export interface SubProjectResponse {
  success: boolean;
  data?: SubProject;
  error?: string;
}

export interface SubProjectFunnelsResponse {
  success: boolean;
  data?: SubProjectFunnel[];
  error?: string;
}

export const subprojectsAPI = {
  getAll: async (projectId?: number): Promise<SubProjectsResponse> => {
    try {
      const url = projectId 
        ? `/subprojects?project_id=${projectId}`
        : '/subprojects';
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження підпроектів',
      };
    }
  },

  getById: async (id: number): Promise<SubProjectResponse> => {
    try {
      const response = await api.get(`/subprojects/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження підпроекту',
      };
    }
  },

  update: async (id: number, subprojectData: Partial<SubProject>): Promise<SubProjectResponse> => {
    try {
      const response = await api.put(`/subprojects/${id}`, subprojectData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка оновлення підпроекту',
      };
    }
  },

  updateStage: async (subprojectId: number, stageId: number): Promise<SubProjectResponse> => {
    try {
      const response = await api.put(`/subprojects/${subprojectId}`, {
        sub_project_funnel_stage_id: stageId
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка оновлення етапу підпроекту',
      };
    }
  },
};

export const subprojectFunnelsAPI = {
  getAll: async (): Promise<SubProjectFunnelsResponse> => {
    try {
      const response = await api.get('/sub-project-funnels');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження воронок підпроектів',
      };
    }
  },
};

// API для менеджерів
export const managersAPI = {
  getAll: async (): Promise<{ success: boolean; data?: Manager[]; error?: string }> => {
    try {
      const response = await api.get('/managers');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження менеджерів',
      };
    }
  },

  getAllForAssignment: async (): Promise<{ success: boolean; data?: Manager[]; error?: string }> => {
    try {
      const response = await api.get('/managers/assignment');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження менеджерів для призначення',
      };
    }
  },
};

// API для завдань
export const tasksAPI = {
  getAll: async (): Promise<{ success: boolean; data?: Task[]; error?: string }> => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження завдань',
      };
    }
  },

  getById: async (id: number): Promise<{ success: boolean; data?: Task; error?: string }> => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка завантаження завдання',
      };
    }
  },

  create: async (taskData: Partial<Task>): Promise<{ success: boolean; data?: Task; error?: string }> => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка створення завдання',
      };
    }
  },

  update: async (id: number, taskData: Partial<Task>): Promise<{ success: boolean; data?: Task; error?: string }> => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка оновлення завдання',
      };
    }
  },

  partialUpdate: async (id: number, taskData: Partial<Task>): Promise<{ success: boolean; data?: Task; error?: string }> => {
    try {
      const response = await api.patch(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка оновлення завдання',
      };
    }
  },

  updateStatus: async (id: number, status: string): Promise<{ success: boolean; data?: Task; error?: string }> => {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка оновлення статусу завдання',
      };
    }
  },

  delete: async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка видалення завдання',
      };
    }
  },
};

export default api;
