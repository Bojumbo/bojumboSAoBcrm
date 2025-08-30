import api from '../api/httpClient';

export type LoginResponse = { token: string; user: any };

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    // Backend returns { success: boolean, data: { token, user } }
    return data.data;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    // Backend returns { success: boolean, data: user }
    return data.data;
  },
  async logout() {
    await api.post('/auth/logout');
  }
};
