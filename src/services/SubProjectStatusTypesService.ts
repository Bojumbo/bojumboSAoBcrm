import api from '../api/httpClient';

export type SubProjectStatusType = {
  sub_project_status_id: number;
  name: string;
};

export const SubProjectStatusTypesService = {
  async getAll(): Promise<SubProjectStatusType[]> {
    const { data } = await api.get('/sub-project-status-types');
    return data.data ?? data;
  },
};
