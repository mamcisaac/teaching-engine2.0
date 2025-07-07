import { apiClient } from '../../core/client';

export interface SubstitutePlan {
  id: number;
  userId: number;
  title: string;
  date: string;
  grade: number;
  subject?: string;
  period?: string;
  duration: number; // in minutes
  status: 'draft' | 'ready' | 'in-use' | 'completed';
  instructions: {
    general: string;
    emergency?: string;
    classroom?: string;
    behavior?: string;
  };
  schedule: {
    time: string;
    activity: string;
    materials?: string[];
    notes?: string;
  }[];
  materials: string[];
  importantNotes?: string;
  emergencyContacts: {
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }[];
  classroomInfo: {
    roomNumber?: string;
    keyLocation?: string;
    supplies?: string;
    technology?: string;
  };
  studentInfo?: {
    totalStudents: number;
    specialNeeds?: string;
    behaviorNotes?: string;
    medicalAlerts?: string;
  };
  substituteNotes?: string;
  completedActivities?: string[];
  feedback?: {
    rating?: number;
    comments?: string;
    issues?: string;
    suggestions?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubstitutePlanInput {
  title: string;
  date: string;
  grade: number;
  subject?: string;
  period?: string;
  duration: number;
  instructions: {
    general: string;
    emergency?: string;
    classroom?: string;
    behavior?: string;
  };
  schedule: {
    time: string;
    activity: string;
    materials?: string[];
    notes?: string;
  }[];
  materials: string[];
  importantNotes?: string;
  emergencyContacts: {
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }[];
  classroomInfo: {
    roomNumber?: string;
    keyLocation?: string;
    supplies?: string;
    technology?: string;
  };
  studentInfo?: {
    totalStudents: number;
    specialNeeds?: string;
    behaviorNotes?: string;
    medicalAlerts?: string;
  };
}

export interface SubstituteTemplate {
  id: number;
  userId: number;
  name: string;
  description?: string;
  grade: number;
  subject?: string;
  duration: number;
  isPublic: boolean;
  template: Omit<SubstitutePlanInput, 'title' | 'date'>;
  tags: string[];
  usageCount: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubstituteFilters {
  grade?: number;
  subject?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
}

export interface SubstituteStats {
  totalPlans: number;
  plansByStatus: Record<string, number>;
  plansByGrade: Record<number, number>;
  plansBySubject: Record<string, number>;
  averageRating: number;
  mostUsedTemplates: {
    id: number;
    name: string;
    usageCount: number;
  }[];
  recentActivity: {
    type: 'created' | 'used' | 'completed';
    date: string;
    count: number;
  }[];
}

// API endpoints
export const substituteApi = {
  // Substitute plans
  plans: {
    // Get all plans
    getAll: async (filters?: SubstituteFilters) => {
      const { data } = await apiClient.get<SubstitutePlan[]>('/api/substitute-plans', {
        params: filters,
      });
      return data;
    },

    // Get plan by ID
    getById: async (id: number) => {
      const { data } = await apiClient.get<SubstitutePlan>(`/api/substitute-plans/${id}`);
      return data;
    },

    // Create plan
    create: async (plan: SubstitutePlanInput) => {
      const { data } = await apiClient.post<SubstitutePlan>('/api/substitute-plans', plan);
      return data;
    },

    // Update plan
    update: async (id: number, updates: Partial<SubstitutePlanInput>) => {
      const { data } = await apiClient.put<SubstitutePlan>(`/api/substitute-plans/${id}`, updates);
      return data;
    },

    // Delete plan
    delete: async (id: number) => {
      await apiClient.delete(`/api/substitute-plans/${id}`);
    },

    // Duplicate plan
    duplicate: async (id: number, newDate?: string) => {
      const { data } = await apiClient.post<SubstitutePlan>(`/api/substitute-plans/${id}/duplicate`, {
        newDate,
      });
      return data;
    },

    // Mark plan as in use
    markInUse: async (id: number) => {
      const { data } = await apiClient.patch<SubstitutePlan>(`/api/substitute-plans/${id}/in-use`);
      return data;
    },

    // Mark plan as completed with feedback
    markCompleted: async (id: number, feedback: {
      rating?: number;
      comments?: string;
      issues?: string;
      suggestions?: string;
      completedActivities?: string[];
      substituteNotes?: string;
    }) => {
      const { data } = await apiClient.patch<SubstitutePlan>(`/api/substitute-plans/${id}/completed`, feedback);
      return data;
    },

    // Get plans for specific date
    getByDate: async (date: string) => {
      const { data } = await apiClient.get<SubstitutePlan[]>('/api/substitute-plans/by-date', {
        params: { date },
      });
      return data;
    },

    // Generate plan from template
    generateFromTemplate: async (templateId: number, planData: {
      title: string;
      date: string;
      customizations?: Partial<SubstitutePlanInput>;
    }) => {
      const { data } = await apiClient.post<SubstitutePlan>('/api/substitute-plans/from-template', {
        templateId,
        ...planData,
      });
      return data;
    },

    // Export plan as PDF
    exportPDF: async (id: number): Promise<Blob> => {
      const { data } = await apiClient.get<Blob>(`/api/substitute-plans/${id}/export`, {
        responseType: 'blob',
      });
      return data;
    },

    // Share plan with substitute
    share: async (id: number, email: string, message?: string) => {
      const { data } = await apiClient.post<{ shared: boolean; link: string }>(
        `/api/substitute-plans/${id}/share`,
        { email, message }
      );
      return data;
    },
  },

  // Templates
  templates: {
    // Get all templates
    getAll: async (includePublic = true) => {
      const { data } = await apiClient.get<SubstituteTemplate[]>('/api/substitute-plans/templates', {
        params: { includePublic },
      });
      return data;
    },

    // Get template by ID
    getById: async (id: number) => {
      const { data } = await apiClient.get<SubstituteTemplate>(`/api/substitute-plans/templates/${id}`);
      return data;
    },

    // Create template
    create: async (template: Omit<SubstituteTemplate, 'id' | 'userId' | 'usageCount' | 'rating' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post<SubstituteTemplate>('/api/substitute-plans/templates', template);
      return data;
    },

    // Update template
    update: async (id: number, updates: Partial<SubstituteTemplate>) => {
      const { data } = await apiClient.put<SubstituteTemplate>(`/api/substitute-plans/templates/${id}`, updates);
      return data;
    },

    // Delete template
    delete: async (id: number) => {
      await apiClient.delete(`/api/substitute-plans/templates/${id}`);
    },

    // Duplicate template
    duplicate: async (id: number) => {
      const { data } = await apiClient.post<SubstituteTemplate>(`/api/substitute-plans/templates/${id}/duplicate`);
      return data;
    },

    // Rate template
    rate: async (id: number, rating: number, comment?: string) => {
      const { data } = await apiClient.post<SubstituteTemplate>(`/api/substitute-plans/templates/${id}/rate`, {
        rating,
        comment,
      });
      return data;
    },

    // Get popular templates
    getPopular: async (limit = 10) => {
      const { data } = await apiClient.get<SubstituteTemplate[]>('/api/substitute-plans/templates/popular', {
        params: { limit },
      });
      return data;
    },

    // Search templates
    search: async (query: string, filters?: { grade?: number; subject?: string; tags?: string[] }) => {
      const { data } = await apiClient.get<SubstituteTemplate[]>('/api/substitute-plans/templates/search', {
        params: { q: query, ...filters },
      });
      return data;
    },

    // Import template from public library
    importFromPublic: async (templateId: number) => {
      const { data } = await apiClient.post<SubstituteTemplate>(`/api/substitute-plans/templates/import/${templateId}`);
      return data;
    },
  },

  // Statistics and analytics
  getStats: async () => {
    const { data } = await apiClient.get<SubstituteStats>('/api/substitute-plans/stats');
    return data;
  },

  // Quick actions
  quickActions: {
    // Create emergency plan
    createEmergencyPlan: async (grade: number, subject?: string) => {
      const { data } = await apiClient.post<SubstitutePlan>('/api/substitute-plans/emergency', {
        grade,
        subject,
      });
      return data;
    },

    // Get suggested activities for grade/subject
    getSuggestedActivities: async (grade: number, subject?: string, duration?: number) => {
      const { data } = await apiClient.get<{
        title: string;
        description: string;
        duration: number;
        materials: string[];
      }[]>('/api/substitute-plans/suggested-activities', {
        params: { grade, subject, duration },
      });
      return data;
    },

    // Generate plan suggestions based on curriculum
    generateSuggestions: async (planData: {
      grade: number;
      subject?: string;
      date: string;
      duration: number;
    }) => {
      const { data } = await apiClient.post<{
        suggestedActivities: {
          activity: string;
          time: string;
          materials: string[];
          notes: string;
        }[];
        generalInstructions: string;
        materials: string[];
      }>('/api/substitute-plans/generate-suggestions', planData);
      return data;
    },
  },

  // Import/Export
  import: async (file: File, format: 'csv' | 'json') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const { data } = await apiClient.post<{
      imported: number;
      failed: number;
      errors?: string[];
    }>('/api/substitute-plans/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  export: async (filters?: SubstituteFilters, format: 'csv' | 'pdf' | 'json' = 'csv'): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/api/substitute-plans/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return data;
  },

  // Feedback and collaboration
  feedback: {
    // Get feedback for plans
    getFeedback: async (planId: number) => {
      const { data } = await apiClient.get<{
        id: number;
        rating: number;
        comments: string;
        issues?: string;
        suggestions?: string;
        date: string;
        substituteName?: string;
      }[]>(`/api/substitute-plans/${planId}/feedback`);
      return data;
    },

    // Submit feedback as substitute
    submitFeedback: async (planId: number, feedback: {
      rating: number;
      comments: string;
      issues?: string;
      suggestions?: string;
      workingConditions?: string;
    }) => {
      const { data } = await apiClient.post<{ success: boolean }>(`/api/substitute-plans/${planId}/feedback`, feedback);
      return data;
    },
  },

  // Classroom management helpers
  classroom: {
    // Get classroom layout suggestions
    getLayoutSuggestions: async (grade: number, classSize: number) => {
      const { data } = await apiClient.get<{
        name: string;
        description: string;
        benefits: string[];
        setup: string[];
      }[]>('/api/substitute-plans/classroom/layouts', {
        params: { grade, classSize },
      });
      return data;
    },

    // Get behavior management strategies
    getBehaviorStrategies: async (grade: number, issues?: string[]) => {
      const { data } = await apiClient.get<{
        strategy: string;
        description: string;
        implementation: string[];
        ageAppropriate: boolean;
      }[]>('/api/substitute-plans/classroom/behavior', {
        params: { grade, issues: issues?.join(',') },
      });
      return data;
    },

    // Get emergency procedures
    getEmergencyProcedures: async () => {
      const { data } = await apiClient.get<{
        type: string;
        procedure: string[];
        contacts: {
          role: string;
          number: string;
        }[];
      }[]>('/api/substitute-plans/classroom/emergency');
      return data;
    },
  },

  // Legacy compatibility functions
  generateSubPlan: async (date: string, reason: string): Promise<SubstitutePlan> => {
    const { data } = await apiClient.post<SubstitutePlan>('/api/sub-plan', { date, reason });
    return data;
  },

  generateSubPlanPDF: async (date: string, days: number) => {
    const response = await apiClient.post(
      `/subplan/generate?date=${date}&days=${days}`,
      {},
      {
        responseType: 'blob',
      },
    );
    return response;
  },

  generateSubPlanWithOptions: async (options: { startDate: string; endDate?: string; includeResources?: boolean; format?: string }) => {
    const response = await apiClient.post(`/subplan/generate`, options, {
      responseType: 'blob',
    });
    return response;
  },

  getSubPlanRecords: async (userId?: number): Promise<SubstitutePlan[]> => {
    const response = await apiClient.get<SubstitutePlan[]>('/subplan/records', { params: { userId } });
    return response.data;
  },

  getClassRoutines: async (userId?: number): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>('/subplan/routines', { params: { userId } });
    return response.data;
  },

  saveClassRoutine: async (routine: { name: string; description?: string; activities: unknown[]; timeSlots?: unknown[] }): Promise<{ id: number; name: string }> => {
    const response = await apiClient.post<{ id: number; name: string }>('/subplan/routines', routine);
    return response.data;
  },

  deleteClassRoutine: async (id: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/subplan/routines/${id}`);
    return response.data;
  },

  extractWeeklyPlan: async (
    startDate: string,
    days = 5,
    options: {
      includeGoals?: boolean;
      includeRoutines?: boolean;
      includePlans?: boolean;
      anonymize?: boolean;
      userId?: number;
    } = {},
  ) => {
    const params = new URLSearchParams({
      startDate,
      days: days.toString(),
      ...(options.includeGoals !== undefined && { includeGoals: options.includeGoals.toString() }),
      ...(options.includeRoutines !== undefined && {
        includeRoutines: options.includeRoutines.toString(),
      }),
      ...(options.includePlans !== undefined && { includePlans: options.includePlans.toString() }),
      ...(options.anonymize !== undefined && { anonymize: options.anonymize.toString() }),
      ...(options.userId && { userId: options.userId.toString() }),
    });

    const response = await apiClient.get(`/subplan/extract/weekly?${params}`);
    return response.data;
  },

  extractScenarioTemplates: async (conditions?: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        if (value) {
params.append(key, value as string);
}
      });
    }

    const response = await apiClient.get(`/subplan/extract/scenarios?${params}`);
    return response.data;
  },

  autoDetectScenario: async (userId?: number) => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await apiClient.get(`/subplan/extract/scenarios/auto${params}`);
    return response.data;
  },

  getScenarioById: async (
    scenarioId: string,
    teacherName?: string,
    className?: string,
  ) => {
    const params = new URLSearchParams();
    if (teacherName) {
params.append('teacherName', teacherName);
}
    if (className) {
params.append('className', className);
}

    const response = await apiClient.get(`/subplan/extract/scenarios/${scenarioId}?${params}`);
    return response.data;
  },

  extractSchoolContacts: async (
    userId?: number,
    format: 'organized' | 'emergency' | 'card' | 'formatted' = 'organized',
  ) => {
    const params = new URLSearchParams();
    if (userId) {
params.append('userId', userId.toString());
}
    params.append('format', format);

    const response = await apiClient.get(`/subplan/extract/contacts?${params}`);
    return response.data;
  },

  extractDayMaterials: async (
    date: string,
    userId?: number,
  ) => {
    const params = new URLSearchParams({ date });
    if (userId) {
params.append('userId', userId.toString());
}

    const response = await apiClient.get(`/subplan/extract/materials/day?${params}`);
    return response.data;
  },

  extractWeeklyMaterials: async (
    startDate: string,
    days = 5,
    userId?: number,
  ) => {
    const params = new URLSearchParams({ startDate, days: days.toString() });
    if (userId) {
params.append('userId', userId.toString());
}

    const response = await apiClient.get(`/subplan/extract/materials/weekly?${params}`);
    return response.data;
  },

  extractComprehensiveSubPlan: async (request: { startDate: string; endDate: string; userId?: number; options?: Record<string, unknown> }) => {
    const response = await apiClient.post('/subplan/extract/comprehensive', request);
    return response.data;
  },
};