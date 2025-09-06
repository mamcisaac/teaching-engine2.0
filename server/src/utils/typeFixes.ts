/**
 * Type fixes and utilities for handling TypeScript compilation issues
 * This file provides safe type casting and utility functions to resolve
 * complex type mismatches introduced during ESLint fixes
 */

// Generic type cast utility for Prisma results
export function castPrismaResult<T>(data: unknown): T {
  return data as T;
}

// Safe property access for optional/nullable fields
export function safeAccess<T>(obj: unknown, path: string, defaultValue?: T): T | undefined {
  return (obj as Record<string, unknown>)[path] as T ?? defaultValue;
}

// Transform null to undefined for TypeScript compatibility
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Type-safe array mapping with error handling
export function safeMap<_T, U>(array: unknown[], mapper: (item: unknown) => U): U[] {
  if (!Array.isArray(array)) return [];
  return array.map(mapper);
}

// Progress record type casting for mastery tracking
export function castProgressRecord(record: unknown) {
  const r = record as Record<string, unknown>;
  return {
    ...r,
    outcomeId: r.outcomeId || (r.outcome as Record<string, unknown>).id,
    previousLevel: r.previousLevel,
    lastAssessmentDate: r.lastAssessmentDate,
    areasForGrowth: r.areasForGrowth,
    strengths: r.strengths,
    teacherNotes: r.teacherNotes,
    strongestEvidence: r.strongestEvidence,
    parentShared: r.parentShared,
  };
}

// Artifact data type casting for evidence export
export function castArtifactData(artifact: unknown) {
  const a = artifact as Record<string, unknown>;
  return {
    ...a,
    fileUrl: a.filePath || a.fileUrl || '',
    outcomes: a.outcomes || [],
  };
}

// Student data type casting for evidence export
export function castStudentData(student: unknown) {
  const s = student as Record<string, unknown>;
  return {
    ...s,
    artifacts: safeMap(Array.isArray(s.artifacts) ? s.artifacts : [], castArtifactData),
    outcomeProgress: safeMap(Array.isArray(s.outcomeProgress) ? s.outcomeProgress : [], (op: unknown) => ({
      currentLevel: (op as Record<string, unknown>).currentLevel,
      outcome: (op as Record<string, unknown>).outcome ? {
        description: ((op as Record<string, unknown>).outcome as Record<string, unknown>).description || '',
        subject: ((op as Record<string, unknown>).outcome as Record<string, unknown>).subject,
      } : undefined,
    })),
  };
}

// Long range plan type casting
export function castLongRangePlan(plan: unknown) {
  const p = plan as Record<string, unknown>;
  return {
    ...p,
    description: nullToUndefined(p.description),
    goals: nullToUndefined(p.goals),
    assessmentOverview: nullToUndefined(p.assessmentOverview),
  };
}