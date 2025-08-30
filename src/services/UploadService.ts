import api from '../api/httpClient';

export type UploadedFileInfo = {
  fileName: string;
  fileUrl: string;
  fileType: string;
};

export const UploadService = {
  async upload(file: File): Promise<UploadedFileInfo> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data ?? data;
  },
  async delete(fileUrl: string): Promise<boolean> {
    const { data } = await api.delete('/upload', { data: { fileUrl } });
    return !!(data.success ?? true);
  }
};
