import api from '../api/httpClient';

export type SaleStatusType = { sale_status_id: number; name: string };

export const SaleStatusTypesService = {
  async getAll(): Promise<SaleStatusType[]> {
    const { data } = await api.get('/sale-status-types');
    return data.data ?? data;
  }
};
