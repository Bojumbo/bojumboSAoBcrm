export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      manager_id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      is_active: boolean;
    };
    token: string;
  };
  error?: string;
}

export interface AuthUser {
  manager_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}
