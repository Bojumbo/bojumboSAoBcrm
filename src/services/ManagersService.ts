import api from '../api/httpClient';

export type Manager = {
  manager_id: number;
  first_name: string;
  last_name: string;
  email?: string;
};

export const ManagersService = {
  async getAll(): Promise<Manager[]> {
    const { data } = await api.get('/managers');
    return data.data ?? data;
  }
};
