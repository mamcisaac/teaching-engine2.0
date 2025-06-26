/**
 * Analytics Export Utilities
 *
 * Provides reusable functions for exporting analytics data and reports
 * in various formats (CSV, PDF, PNG) across different visualization components.
 */

import { api } from '../api';

export interface ExportOptions {
  title?: string;
  subtitle?: string;
  includeMetadata?: boolean;
  colorScheme?: 'default' | 'colorblind' | 'high-contrast';
  pageSize?: 'letter' | 'a4' | 'legal';
}

export type ExportFormat = 'csv' | 'pdf' | 'png';
export type ExportType =
  | 'curriculum-heatmap'
  | 'domain-radar'
  | 'theme-analytics'
  | 'vocabulary-growth';

/**
 * Export analytics data to specified format
 */
export async function exportAnalyticsData(
  type: ExportType,
  format: ExportFormat,
  data: any,
  options: ExportOptions = {},
): Promise<void> {
  try {
    const response = await api.post(
      '/api/analytics/export',
      {
        type,
        format,
        data,
        options,
      },
      {
        responseType: 'blob',
      },
    );

    const mimeTypes = {
      csv: 'text/csv',
      pdf: 'application/pdf',
      png: 'image/png',
    };

    const extensions = {
      csv: 'csv',
      pdf: 'pdf',
      png: 'png',
    };

    const blob = new Blob([response.data], { type: mimeTypes[format] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${type}-${timestamp}.${extensions[format]}`;
    link.download = options.title
      ? `${options.title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${extensions[format]}`
      : filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export ${type} as ${format}`);
  }
}

/**
 * Export curriculum heatmap data
 */
export async function exportCurriculumHeatmap(
  data: any,
  format: ExportFormat,
  options: ExportOptions = {},
): Promise<void> {
  return exportAnalyticsData('curriculum-heatmap', format, data, {
    title: 'Curriculum Coverage Heatmap',
    ...options,
  });
}

/**
 * Export domain radar chart data
 */
export async function exportDomainRadar(
  data: any,
  format: ExportFormat,
  options: ExportOptions = {},
): Promise<void> {
  return exportAnalyticsData('domain-radar', format, data, {
    title: `Domain Strength Analysis - ${data.studentName || 'Student'}`,
    ...options,
  });
}

/**
 * Export theme analytics data
 */
export async function exportThemeAnalytics(
  data: any,
  format: ExportFormat,
  options: ExportOptions = {},
): Promise<void> {
  return exportAnalyticsData('theme-analytics', format, data, {
    title: 'Theme Usage Analytics',
    ...options,
  });
}

/**
 * Export vocabulary growth data
 */
export async function exportVocabularyGrowth(
  data: any,
  format: ExportFormat,
  options: ExportOptions = {},
): Promise<void> {
  return exportAnalyticsData('vocabulary-growth', format, data, {
    title: `Vocabulary Growth - ${data.studentName || 'Student'}`,
    ...options,
  });
}

/**
 * Show export success notification
 */
export function showExportSuccess(type: ExportType, format: ExportFormat): void {
  // TODO: Integrate with toast notification system
  // Successfully exported ${type} as ${format}
}

/**
 * Show export error notification
 */
export function showExportError(type: ExportType, format: ExportFormat, error: Error): void {
  // This could integrate with a toast notification system
  console.error(`Failed to export ${type} as ${format}:`, error.message);
}

/**
 * Export with error handling and notifications
 */
export async function exportWithNotifications(
  type: ExportType,
  format: ExportFormat,
  data: any,
  options: ExportOptions = {},
): Promise<void> {
  try {
    await exportAnalyticsData(type, format, data, options);
    showExportSuccess(type, format);
  } catch (error) {
    showExportError(type, format, error as Error);
    throw error;
  }
}
