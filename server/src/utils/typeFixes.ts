/**
 * Type fixes and utilities for handling TypeScript compilation issues
 * This file provides safe type casting and utility functions to resolve
 * complex type mismatches introduced during ESLint fixes
 */

// Generic type cast utility for Prisma results
export function castPrismaResult<T>(data: any): T {
  return data as T;
}

// Safe property access for optional/nullable fields
export function safeAccess<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  return obj?.[path] ?? defaultValue;
}

// Transform null to undefined for TypeScript compatibility
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Type-safe array mapping with error handling
export function safeMap<T, U>(array: any[], mapper: (item: any) => U): U[] {
  if (!Array.isArray(array)) return [];
  return array.map(mapper);
}

// Progress record type casting for mastery tracking
export function castProgressRecord(record: any) {
  return {
    ...record,
    outcomeId: record.outcomeId || record.outcome?.id,
    previousLevel: record.previousLevel,
    lastAssessmentDate: record.lastAssessmentDate,
    areasForGrowth: record.areasForGrowth,
    strengths: record.strengths,
    teacherNotes: record.teacherNotes,
    strongestEvidence: record.strongestEvidence,
    parentShared: record.parentShared,
  };
}

// Artifact data type casting for evidence export
export function castArtifactData(artifact: any) {
  return {
    ...artifact,
    fileUrl: artifact.filePath || artifact.fileUrl || '',
    outcomes: artifact.outcomes || [],
  };
}

// Student data type casting for evidence export
export function castStudentData(student: any) {
  return {
    ...student,
    artifacts: safeMap(student.artifacts || [], castArtifactData),
    outcomeProgress: safeMap(student.outcomeProgress || [], (op: any) => ({
      currentLevel: op.currentLevel,
      outcome: op.outcome ? {
        description: op.outcome.description || '',
        subject: op.outcome.subject,
      } : undefined,
    })),
  };
}

// Long range plan type casting
export function castLongRangePlan(plan: any) {
  return {
    ...plan,
    description: nullToUndefined(plan.description),
    goals: nullToUndefined(plan.goals),
    assessmentOverview: nullToUndefined(plan.assessmentOverview),
  };
}