import { api } from '@/api';

export interface ExportOptions {
  type: string;
  format: 'pdf' | 'csv' | 'png';
  data: Record<string, any>;
}

class ExportService {
  async exportData(options: ExportOptions): Promise<void> {
    try {
      const response = await api.post('/api/analytics/export', options, {
        responseType: 'blob',
      });

      // Create a download link
      const blob = new Blob([response.data], {
        type: this.getMimeType(options.format),
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${options.type}-${timestamp}.${options.format}`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      png: 'image/png',
    };
    return mimeTypes[format] || 'application/octet-stream';
  }
}

export const exportService = new ExportService();
