import { apiClient } from '../../api/core/client';

export interface Report {
  id: string;
  title: string;
  type: 'PROGRESS' | 'PARENT' | 'TERM' | 'YEAR_END' | 'IEP' | 'ASSESSMENT_SUMMARY';
  studentId?: string;
  content: any;
  format: 'PDF' | 'HTML' | 'CSV';
  generatedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateReportDto {
  title: string;
  type: 'PROGRESS' | 'PARENT' | 'TERM' | 'YEAR_END' | 'IEP' | 'ASSESSMENT_SUMMARY';
  studentId?: string;
  startDate?: string;
  endDate?: string;
  subjects?: string[];
  includeArtifacts?: boolean;
  format: 'PDF' | 'HTML' | 'CSV';
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: any;
}

export const reportsApi = {
  async getAll(studentId?: string): Promise<Report[]> {
    const params = studentId ? `?studentId=${studentId}` : '';
    const response = await apiClient.get<Report[]>(`/api/reports${params}`);
    return response.data;
  },

  async getById(id: string): Promise<Report> {
    const response = await apiClient.get<Report>(`/api/reports/${id}`);
    return response.data;
  },

  async generate(data: GenerateReportDto): Promise<Report> {
    const response = await apiClient.post<Report>('/api/reports/generate', data);
    return response.data;
  },

  async download(id: string): Promise<Blob> {
    const response = await apiClient.get(`/api/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/reports/${id}`);
  },

  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get<ReportTemplate[]>('/api/reports/templates');
    return response.data;
  },

  async preview(data: GenerateReportDto): Promise<string> {
    const response = await apiClient.post<{ preview: string }>('/api/reports/preview', data);
    return response.data.preview;
  },

  async emailReport(id: string, recipients: string[]): Promise<void> {
    await apiClient.post(`/api/reports/${id}/email`, { recipients });
  },
};