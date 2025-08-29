# Підключення фронтенду до бекенду

Цей документ містить інструкції по налаштуванню існуючого React фронтенду для роботи з новим CRM Backend.

## Оновлення API URL

### 1. Зміна базового URL

В файлі `services/api.ts` замініть мок-сервер на реальний API:

```typescript
// services/api.ts

// Замініть цей рядок:
const API_BASE_URL = 'http://localhost:3001/api';

// Додайте функцію для отримання токена
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Оновіть функцію simulateNetwork
const simulateNetwork = async <T>(data: T): Promise<T> => {
  // В продакшні можна видалити затримку
  await new Promise(resolve => setTimeout(resolve, 100));
  return data;
};

// Оновіть функцію для HTTP запитів
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

### 2. Оновлення функцій API

Замініть мок-функції на реальні HTTP запити:

```typescript
// Приклад оновлення функції getAll для менеджерів
export const getAll = async <T>(
  entity: EntityType,
  currentUser: Manager | null = null
): Promise<T[]> => {
  try {
    const response = await apiRequest<ApiResponse<T[]>>(`/${entity}`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch data');
    }
  } catch (error) {
    console.error(`Error fetching ${entity}:`, error);
    throw error;
  }
};

// Приклад оновлення функції getById
export const getById = async <T>(
  entity: EntityType,
  id: number,
  currentUser: Manager | null = null
): Promise<T | null> => {
  try {
    const response = await apiRequest<ApiResponse<T>>(`/${entity}/${id}`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch data');
    }
  } catch (error) {
    console.error(`Error fetching ${entity} with id ${id}:`, error);
    throw error;
  }
};

// Приклад оновлення функції create
export const create = async <T>(
  entity: EntityType,
  data: any
): Promise<T> => {
  try {
    const response = await apiRequest<ApiResponse<T>>(`/${entity}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to create');
    }
  } catch (error) {
    console.error(`Error creating ${entity}:`, error);
    throw error;
  }
};

// Приклад оновлення функції update
export const update = async <T>(
  entity: EntityType,
  id: number,
  data: any
): Promise<T> => {
  try {
    const response = await apiRequest<ApiResponse<T>>(`/${entity}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to update');
    }
  } catch (error) {
    console.error(`Error updating ${entity} with id ${id}:`, error);
    throw error;
  }
};

// Приклад оновлення функції delete
export const deleteEntity = async (
  entity: EntityType,
  id: number
): Promise<boolean> => {
  try {
    const response = await apiRequest<ApiResponse<boolean>>(`/${entity}/${id}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to delete');
    }
  } catch (error) {
    console.error(`Error deleting ${entity} with id ${id}:`, error);
    throw error;
  }
};
```

## Оновлення аутентифікації

### 1. Оновлення AuthContext

```typescript
// contexts/AuthContext.tsx

import { apiRequest } from '../services/api';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        localStorage.setItem('authToken', token);
        return true;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  const getCurrentUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiRequest<ApiResponse<Manager>>('/auth/me');
      
      if (response.success) {
        setUser(response.data);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  // ... rest of the context
};
```

### 2. Оновлення Login компонента

```typescript
// pages/Login.tsx

import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component
};
```

## Оновлення компонентів для роботи з API

### 1. Оновлення Dashboard

```typescript
// pages/Dashboard.tsx

import { useEffect, useState } from 'react';
import { getAll, EntityType } from '../services/api';
import { Manager, Project, Sale } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    managers: 0,
    projects: 0,
    sales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [managers, projects, sales] = await Promise.all([
          getAll<Manager>(EntityType.MANAGERS),
          getAll<Project>(EntityType.PROJECTS),
          getAll<Sale>(EntityType.SALES),
        ]);

        setStats({
          managers: managers.length,
          projects: projects.length,
          sales: sales.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ... rest of the component
};
```

### 2. Оновлення Managers компонента

```typescript
// pages/Managers.tsx

import { useEffect, useState } from 'react';
import { getAll, create, update, deleteEntity, EntityType } from '../services/api';
import { Manager } from '../types';

export const Managers: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const data = await getAll<Manager>(EntityType.MANAGERS);
      setManagers(data);
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (managerData: Partial<Manager>) => {
    try {
      const newManager = await create<Manager>(EntityType.MANAGERS, managerData);
      setManagers(prev => [...prev, newManager]);
    } catch (error) {
      console.error('Error creating manager:', error);
    }
  };

  const handleUpdate = async (id: number, managerData: Partial<Manager>) => {
    try {
      const updatedManager = await update<Manager>(EntityType.MANAGERS, id, managerData);
      setManagers(prev => prev.map(m => m.id === id ? updatedManager : m));
      setEditingManager(null);
    } catch (error) {
      console.error('Error updating manager:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEntity(EntityType.MANAGERS, id);
      setManagers(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting manager:', error);
    }
  };

  // ... rest of the component
};
```

## Оновлення завантаження файлів

### 1. Оновлення UploadService

```typescript
// services/uploadService.ts

export class UploadService {
  private static API_BASE_URL = 'http://localhost:3001/api';

  static async uploadFile(file: File): Promise<{ fileName: string; fileUrl: string; fileType: string }> {
    const token = localStorage.getItem('authToken');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  }

  static async deleteFile(fileUrl: string): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.API_BASE_URL}/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.success;
  }
}
```

### 2. Оновлення компонентів з файлами

```typescript
// Приклад використання в коментарях

const handleFileUpload = async (file: File) => {
  try {
    const fileInfo = await UploadService.uploadFile(file);
    
    // Збереження file_url в коментарі
    const commentData = {
      content: commentText,
      manager_id: currentUser.id,
      file_url: fileInfo.fileUrl,
    };

    await create<ProjectComment>(EntityType.PROJECT_COMMENTS, commentData);
    
    // Очищення форми
    setCommentText('');
    setSelectedFile(null);
    
    // Оновлення списку коментарів
    fetchComments();
  } catch (error) {
    console.error('File upload error:', error);
    // Показати помилку користувачу
  }
};
```

## Налаштування CORS

### 1. Перевірка CORS на бекенді

Переконайтеся, що в `src/index.ts` налаштований CORS:

```typescript
// src/index.ts

import cors from 'cors';

// Налаштування CORS для фронтенду
app.use(cors({
  origin: [
    'http://localhost:3000',  // React dev server
    'http://localhost:5173',  // Vite dev server
    'https://yourdomain.com'  // Production domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 2. Налаштування проксі для розробки

В `vite.config.ts` або `package.json` додайте проксі:

```typescript
// vite.config.ts

export default defineConfig({
  // ... other config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

Або в `package.json`:

```json
{
  "proxy": "http://localhost:3001"
}
```

## Обробка помилок

### 1. Створення ErrorBoundary

```typescript
// components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Глобальна обробка помилок API

```typescript
// utils/errorHandler.ts

export const handleApiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  if (error.message === 'Unauthorized') {
    // Token expired, redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    return;
  }
  
  // Показати помилку користувачу
  // Можна використовувати toast або alert
  alert(`Error: ${error.message}`);
};
```

## Тестування інтеграції

### 1. Перевірка підключення

```bash
# Перевірка health endpoint
curl http://localhost:3001/health

# Перевірка CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/auth/login
```

### 2. Тестування аутентифікації

```bash
# Тест login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Тест захищеного endpoint
curl -X GET http://localhost:3001/api/managers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Тестування з фронтенду

1. Запустіть бекенд: `npm run dev`
2. Запустіть фронтенд: `npm run dev`
3. Спробуйте залогінитися
4. Перевірте роботу різних сторінок

## Оптимізація продуктивності

### 1. Кешування даних

```typescript
// hooks/useApiCache.ts

import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function useApiCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFunction();
      setData(result);
      
      // Збереження в кеш
      const cacheItem: CacheItem<T> = {
        data: result,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, ttl]);

  useEffect(() => {
    // Перевірка кешу
    const cached = localStorage.getItem(`cache_${key}`);
    if (cached) {
      const cacheItem: CacheItem<T> = JSON.parse(cached);
      if (Date.now() - cacheItem.timestamp < cacheItem.ttl) {
        setData(cacheItem.data);
        return;
      }
    }
    
    fetchData();
  }, [key, fetchData]);

  return { data, loading, refetch: fetchData };
}
```

### 2. Оптимізація запитів

```typescript
// Використання useMemo для оптимізації
const filteredManagers = useMemo(() => {
  return managers.filter(manager => 
    manager.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [managers, searchTerm]);

// Використання useCallback для стабільних функцій
const handleDelete = useCallback(async (id: number) => {
  try {
    await deleteEntity(EntityType.MANAGERS, id);
    setManagers(prev => prev.filter(m => m.id !== id));
  } catch (error) {
    console.error('Error deleting manager:', error);
  }
}, []);
```

## Розгортання

### 1. Оновлення API URL для продакшну

```typescript
// services/api.ts

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api'
  : 'http://localhost:3001/api';
```

### 2. Налаштування змінних середовища

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3001/api

# .env.production
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### 3. Використання змінних середовища

```typescript
// services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

## Troubleshooting

### Поширені проблеми

1. **CORS помилки:**
   - Перевірте налаштування CORS на бекенді
   - Переконайтеся, що origin додано в список дозволених

2. **401 Unauthorized:**
   - Перевірте, чи зберігається токен в localStorage
   - Перевірте термін дії JWT токена

3. **Помилки підключення:**
   - Перевірте, чи запущений бекенд
   - Перевірте правильність API URL

4. **Помилки завантаження файлів:**
   - Перевірте розмір файлу
   - Перевірте права доступу до папки uploads

### Логування для діагностики

```typescript
// Додайте детальне логування в API запити
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  console.log(`API Request: ${endpoint}`, {
    method: options.method || 'GET',
    headers: options.headers,
    hasToken: !!token,
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    console.log(`API Response: ${endpoint}`, {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${endpoint}`, errorText);
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`API Success: ${endpoint}`, result);
    return result;
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
};
```
