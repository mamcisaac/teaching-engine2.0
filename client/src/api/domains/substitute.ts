/**
 * Substitute Plan API
 * Handles all API calls related to substitute teacher information and plan generation
 */

import { apiClient } from '../apiClient';

export interface ScheduleItem {
  time: string;
  activity: string;
  notes?: string;
}

export interface LessonInfo {
  id: string;
  title: string;
  subject: string;
  time: string;
  duration: number;
  instructions: string;
  materials: string[];
}

export interface EmergencyInfo {
  officePhone: string;
  procedures: string;
}

export interface SubstitutePlan {
  title: string;
  dateFor: Date;
  grade: number | string;
  subject: string;
  schedule: ScheduleItem[];
  lessons: LessonInfo[];
  generalNotes: string;
  emergencyInfo: EmergencyInfo;
}

export interface SubstituteInfo {
  id?: string;
  classroomNumber?: string | null;
  gradeLevel?: string | null;
  classSize?: number | null;
  officePhone?: string | null;
  principalName?: string | null;
  vicePrincipalName?: string | null;
  nearbyTeacher?: string | null;
  nearbyTeacherRoom?: string | null;
  emergencyProcedures?: string | null;
  fireExitRoute?: string | null;
  allergies?: string | null;
  medicalNeeds?: string | null;
  behaviorNotes?: string | null;
  specialNeeds?: string | null;
  studentHelpers?: string | null;
  classroomRules?: string | null;
  rewardSystem?: string | null;
  consequenceSystem?: string | null;
  attentionSignal?: string | null;
  morningRoutine?: string | null;
  attendanceProcedure?: string | null;
  bathroomPolicy?: string | null;
  lunchProcedure?: string | null;
  dismissalProcedure?: string | null;
  materialsLocation?: string | null;
  technologyAccess?: string | null;
  copiesLocation?: string | null;
  extraActivities?: string | null;
  specialSchedule?: string | null;
  importantInfo?: string | null;
}

class SubstituteApi {
  /**
   * Get substitute information for the current user
   */
  async getSubstituteInfo(): Promise<SubstituteInfo> {
    const response = await apiClient.get<SubstituteInfo>('/substitute-plans/info');
    return response.data;
  }

  /**
   * Save or update substitute information
   */
  async saveSubstituteInfo(info: SubstituteInfo): Promise<SubstituteInfo> {
    const response = await apiClient.post<SubstituteInfo>('/substitute-plans/info', info);
    return response.data;
  }

  /**
   * Generate substitute plan for a specific date
   */
  async generateSubPlan(date: Date | string): Promise<SubstitutePlan> {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await apiClient.get<SubstitutePlan>(`/substitute-plans/plan/${dateStr}`);
    return response.data;
  }

  /**
   * Generate PDF/HTML version of substitute plan
   */
  async generateSubPlanPDF(date: Date | string): Promise<string> {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await apiClient.get<string>(`/substitute-plans/plan/${dateStr}/pdf`, {
      responseType: 'text'
    });
    return response.data;
  }
}

export const substituteApi = new SubstituteApi();