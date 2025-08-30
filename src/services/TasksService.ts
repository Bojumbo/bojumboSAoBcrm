import api from '../api/httpClient';
import type { Manager } from './ManagersService';

export type Task = {
  task_id: number;
  title: string;
  description?: string | null;
  status?: 'new' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  responsible_manager_id?: number | null;
  responsible_manager?: Manager | null;
  creator_manager_id?: number | null;
  creator_manager?: Manager | null;
  project_id?: number | null;
  project?: { project_id: number; name: string } | null;
  subproject_id?: number | null;
  subproject?: { subproject_id: number; name: string } | null;
  due_date?: string | null;
};

export const TasksService = {
  async getAll(): Promise<Task[]> {
    const { data } = await api.get('/tasks');
    return data.data ?? data;
  },
  async create(payload: Partial<Omit<Task, 'task_id'>> & { title: string }): Promise<Task> {
    const { data } = await api.post('/tasks', payload);
    return data.data ?? data;
  },
  async update(id: number, payload: Partial<Omit<Task, 'task_id'>>): Promise<Task> {
    const { data } = await api.put(`/tasks/${id}`, payload);
    return data.data ?? data;
  },
  async updateStatus(id: number, status: Task['status']): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}/status`, { status });
    return data.data ?? data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
};
