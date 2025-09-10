import api from '../api/httpClient';

export type ProjectComment = {
  comment_id: number;
  content: string;
  created_at: string;
  file_name?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  is_deleted?: boolean;
  manager?: {
    manager_id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
};

export const CommentService = {
  async getProjectComments(projectId: number): Promise<ProjectComment[]> {
    const { data } = await api.get(`/comments/projects/${projectId}`);
    return data.data ?? data;
  },
  async createProjectComment(projectId: number, content: string, file?: { name: string; url: string; type: string }): Promise<ProjectComment> {
    const payload: any = { content };
    if (file) payload.file = { name: file.name, url: file.url, type: file.type };
    const { data } = await api.post(`/comments/projects/${projectId}`, payload);
    return data.data ?? data;
  },
  async deleteProjectComment(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },
  async getSubProjectComments(subprojectId: number): Promise<ProjectComment[]> {
    const { data } = await api.get(`/comments/subprojects/${subprojectId}`);
    return data.data ?? data;
  },
  async createSubProjectComment(subprojectId: number, content: string, file?: { name: string; url: string; type: string }): Promise<ProjectComment> {
    const payload: any = { content };
    if (file) payload.file = { name: file.name, url: file.url, type: file.type };
    const { data } = await api.post(`/comments/subprojects/${subprojectId}`, payload);
    return data.data ?? data;
  },
  async deleteSubProjectComment(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },
};
