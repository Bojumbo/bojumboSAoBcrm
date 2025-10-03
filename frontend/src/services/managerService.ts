import api from '@/lib/api';
import { Manager } from '@/types/users';

export const managerService = {
  async getAllForAssignment(): Promise<Manager[]> {
    const response = await api.get('/managers/assignment');
    return response.data.data;
  },
};
