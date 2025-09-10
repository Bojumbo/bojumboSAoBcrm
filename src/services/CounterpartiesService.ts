import api from '../api/httpClient';
import type { Manager } from './ManagersService';

export type Counterparty = {
  counterparty_id: number;
  name: string;
  counterparty_type?: 'INDIVIDUAL' | 'LEGAL_ENTITY' | string;
  responsible_manager_id?: number | null;
  responsible_manager?: Manager | null;
  phone?: string | null;
  email?: string | null;
};

export const CounterpartiesService = {
  async getAll(): Promise<Counterparty[]> {
    const { data } = await api.get('/counterparties');
    return data.data ?? data;
  },
  async create(payload: { name: string; counterparty_type: 'INDIVIDUAL' | 'LEGAL_ENTITY'; responsible_manager_id?: number | null; phone?: string | null; email?: string | null; }): Promise<Counterparty> {
    const { data } = await api.post('/counterparties', payload);
    return data.data ?? data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/counterparties/${id}`);
  }
};
