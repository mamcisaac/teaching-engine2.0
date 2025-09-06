import { apiClient } from '../../api/core/client';

export interface ClassPerformance {
  subject: string;
  averageLevel: number;
  distribution: {
    NOT_YET: number;
    APPROACHING: number;
    MEETING: number;
    EXCEEDING: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

export interface StudentAnalyticsProgress {
  studentId: string;
  studentName: string;
  overallProgress: number;
  subjects: {
    [subject: string]: {
      currentLevel: string;
      trend: 'improving' | 'stable' | 'declining';
      assessmentCount: number;
      lastAssessment: string;
    };
  };
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsDashboard {
  classPerformance: ClassPerformance[];
  studentProgress: StudentAnalyticsProgress[];
  evidenceBalance: {
    observation: number;
    conversation: number;
    product: number;
  };
  assessmentTrends: TrendData[];
  recentActivity: {
    assessments: number;
    artifacts: number;
    reports: number;
  };
}

export interface ExpectationCoverage {
  expectationId: string;
  expectationCode: string;
  description: string;
  coverageCount: number;
  totalStudents: number;
  coveragePercentage: number;
  avgMasteryLevel: number;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  subjects?: string[];
  studentIds?: string[];
  groupBy?: 'day' | 'week' | 'month';
}

export const analyticsApi = {
  async getDashboard(params?: AnalyticsParams): Promise<AnalyticsDashboard> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    const response = await apiClient.get<AnalyticsDashboard>(`/api/analytics/dashboard?${queryParams.toString()}`);
    return response.data;
  },

  async getClassPerformance(subject?: string): Promise<ClassPerformance[]> {
    const params = subject ? `?subject=${subject}` : '';
    const response = await apiClient.get<ClassPerformance[]>(`/api/analytics/class-performance${params}`);
    return response.data;
  },

  async getStudentProgress(studentId: string): Promise<StudentAnalyticsProgress> {
    const response = await apiClient.get<StudentAnalyticsProgress>(`/api/analytics/student-progress/${studentId}`);
    return response.data;
  },

  async getTrends(params: AnalyticsParams): Promise<TrendData[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    const response = await apiClient.get<TrendData[]>(`/api/analytics/trends?${queryParams.toString()}`);
    return response.data;
  },

  async getExpectationCoverage(subject: string): Promise<ExpectationCoverage[]> {
    const response = await apiClient.get<ExpectationCoverage[]>(`/api/analytics/expectation-coverage/${subject}`);
    return response.data;
  },

  async exportAnalytics(params: AnalyticsParams, format: 'CSV' | 'PDF'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    queryParams.append('format', format);
    
    const response = await apiClient.get(`/api/analytics/export?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};