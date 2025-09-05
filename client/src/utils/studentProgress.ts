/**
 * Student Progress Utility Functions
 * Core functions for managing student progress data and reports
 */

import type { Student } from '../services/api/students';

export type AchievementLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

export interface Assessment {
  id: string;
  studentId: string;
  expectation: string;
  subject: string;
  level: AchievementLevel;
  notes?: string;
  date: Date;
  isAnecdotal?: boolean;
}

export interface QuickProgressData {
  oneLiner: string;
  safeToShare: boolean;
  strengths: string[];
  growthAreas: string[];
  recentNotes: string[];
  loadTimeMs?: number;
}

export interface ProgressPrivacyData {
  publicInfo: string;
  privateInfo?: {
    sensitiveTopics: string[];
    requiresMeeting: boolean;
  };
}

export interface ParentCommunicationHistory {
  previousReports: Array<{
    date: Date;
    summary: string;
  }>;
  lastToldThem: string;
  contradictions: string[];
}

export interface ParentAccess {
  canSeeGrades: boolean;
  canSeeBehavior: boolean;
  custodyNotes: string;
  restrictions?: string[];
}

export interface ImprovementEvidence {
  subject: string;
  then: string;
  now: string;
  proof: Array<{
    date: Date;
    description: string;
  }>;
  trajectory: 'improving' | 'stable' | 'declining';
}

export interface ComparativeProgress {
  response: string;
  classAverage?: never; // Never expose this
}

// Cache for quick access
const progressCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Get quick progress summary for a student
 * Must return in under 2 seconds
 */
export async function getQuickProgress(studentName: string): Promise<QuickProgressData> {
  const startTime = Date.now();
  
  // Check cache first
  const cacheKey = `quick-${studentName}`;
  const cached = progressCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { ...cached.data, loadTimeMs: Date.now() - startTime };
  }

  // Simulate fetching from API (in real implementation, would use actual API)
  const data: QuickProgressData = {
    oneLiner: `${studentName} is doing well in French oral communication and counting, working on letter formation.`,
    safeToShare: true,
    strengths: ['French oral communication', 'Counting to 20', 'Pattern recognition'],
    growthAreas: ['Letter formation', 'Skip counting by 2s'],
    recentNotes: [
      'Improving in reading comprehension',
      'Great participation in math activities',
      'Shows enthusiasm for learning'
    ],
    loadTimeMs: Date.now() - startTime
  };

  // Cache the result
  progressCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

/**
 * Get progress data with privacy filters
 */
export function getProgressWithPrivacy(
  studentName: string,
  privacyLevel: 'public' | 'private'
): ProgressPrivacyData {
  if (privacyLevel === 'public') {
    return {
      publicInfo: `${studentName} is progressing well in several areas and we're supporting their continued growth.`
    };
  }

  return {
    publicInfo: `${studentName} is making progress in math and reading.`,
    privateInfo: {
      sensitiveTopics: ['Working on emotional regulation', 'Speech therapy support'],
      requiresMeeting: false
    }
  };
}

/**
 * Get parent communication history
 */
export function getParentCommunicationHistory(studentName: string): ParentCommunicationHistory {
  // In real implementation, would fetch from database
  return {
    previousReports: [
      {
        date: new Date('2024-09-15'),
        summary: 'Strong in math, developing reading skills'
      },
      {
        date: new Date('2024-10-01'),
        summary: 'Improvement in reading, continued strength in math'
      }
    ],
    lastToldThem: 'Improvement in reading, continued strength in math',
    contradictions: [] // No contradictions with current assessment
  };
}

/**
 * Get parent access permissions
 */
export function getParentAccess(studentName: string, parent: 'mother' | 'father'): ParentAccess {
  // In real implementation, would fetch from database
  if (parent === 'mother') {
    return {
      canSeeGrades: true,
      canSeeBehavior: true,
      custodyNotes: 'Primary custody, all information access'
    };
  }

  return {
    canSeeGrades: true,
    canSeeBehavior: false,
    custodyNotes: 'Weekends only, academic information only',
    restrictions: ['No behavioral information', 'No medical information']
  };
}

/**
 * Get evidence of improvement
 */
export function getImprovementEvidence(studentName: string, subject: string): ImprovementEvidence {
  // In real implementation, would analyze historical data
  return {
    subject,
    then: 'September: Could not count past 10',
    now: 'October: Counting to 20 independently',
    proof: [
      { date: new Date('2024-09-05'), description: 'Counted to 7 with assistance' },
      { date: new Date('2024-09-20'), description: 'Counted to 12 independently' },
      { date: new Date('2024-10-15'), description: 'Counted to 20 with confidence' }
    ],
    trajectory: 'improving'
  };
}

/**
 * Get comparative progress without revealing other students' data
 */
export function getComparativeProgress(studentName: string): ComparativeProgress {
  return {
    response: 'This level of progress is typical for this age group. Many students are working on similar skills at this time of year.'
  };
}

/**
 * Categorize assessments into strengths and growth areas
 */
export function categorizeAssessments(assessments: Assessment[]): {
  strengths: Assessment[];
  growthAreas: Assessment[];
} {
  const strengths = assessments.filter(a => 
    !a.isAnecdotal && (a.level === 'MEETING' || a.level === 'EXCEEDING')
  );
  const growthAreas = assessments.filter(a => 
    !a.isAnecdotal && (a.level === 'NOT_YET' || a.level === 'APPROACHING')
  );

  return { strengths, growthAreas };
}

/**
 * Generate a parent-friendly summary
 */
export function generateParentSummary(
  studentName: string,
  strengths: string[],
  growthAreas: string[],
  recentNotes: string[]
): string {
  let summary = `${studentName}'s Progress Report\n\n`;

  if (strengths.length > 0) {
    summary += `Strengths:\n${strengths.map(s => `• ${s}`).join('\n')}\n\n`;
  } else {
    summary += 'Strengths: Assessment in progress\n\n';
  }

  if (growthAreas.length > 0) {
    summary += `Areas for Growth:\n${growthAreas.map(g => `• ${g}`).join('\n')}\n\n`;
  } else {
    summary += 'Areas for Growth: Meeting all assessed expectations\n\n';
  }

  if (recentNotes.length > 0) {
    summary += `Recent Observations:\n${recentNotes.map(n => `• ${n}`).join('\n')}`;
  }

  return summary;
}

/**
 * Format assessment data for quick verbal communication
 */
export function getVerbalSummary(studentName: string, assessments: Assessment[]): string {
  const { strengths, growthAreas } = categorizeAssessments(assessments);
  
  if (strengths.length === 0 && growthAreas.length === 0) {
    return `${studentName} is settling in well and we're still completing initial assessments.`;
  }

  const strengthSubjects = strengths.slice(0, 2).map(a => a.expectation);
  const growthSubjects = growthAreas.slice(0, 2).map(a => a.expectation);

  let summary = `${studentName} is `;
  
  if (strengthSubjects.length > 0) {
    summary += `doing well in ${strengthSubjects.join(' and ')}`;
  }
  
  if (growthSubjects.length > 0) {
    if (strengthSubjects.length > 0) {
      summary += ', and we\'re working on ';
    } else {
      summary += 'working on ';
    }
    summary += growthSubjects.join(' and ');
  }

  summary += '.';
  return summary;
}

/**
 * Check if information is safe to share in public
 */
export function isSafeToSharePublicly(content: string): boolean {
  const sensitiveTerms = [
    'iep', 'special needs', 'disability', 'disorder',
    'therapy', 'medication', 'diagnosis', 'behavioral',
    'struggling', 'behind', 'delayed', 'difficulty',
    'custody', 'divorce', 'separated', 'family issue'
  ];

  const lowerContent = content.toLowerCase();
  return !sensitiveTerms.some(term => lowerContent.includes(term));
}

/**
 * Get time-appropriate greeting for reports
 */
export function getReportGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format date for parent-friendly display
 */
export function formatDateForParents(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}