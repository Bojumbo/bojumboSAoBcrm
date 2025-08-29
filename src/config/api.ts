// API Configuration for Frontend-Backend Integration
export const API_CONFIG = {
  // Backend base URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    
    // Core entities
    MANAGERS: '/api/managers',
    PROJECTS: '/api/projects',
    SALES: '/api/sales',
    PRODUCTS: '/api/products',
    SERVICES: '/api/services',
    COUNTERPARTIES: '/api/counterparties',
    TASKS: '/api/tasks',
    SUBPROJECTS: '/api/subprojects',
    COMMENTS: '/api/comments',
    FUNNELS: '/api/funnels',
    FUNNEL_STAGES: '/api/funnels/stages', // updated to match backend
    FUNNEL_STAGES_ALL: '/api/funnels/stages/all',
    UNITS: '/api/units',
    WAREHOUSES: '/api/warehouses',
    
    // Special endpoints
    PRODUCT_STOCKS: '/api/products/:id/stock',
    UPLOAD: '/api/upload',
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
  },
  
  // File upload configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
