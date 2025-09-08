/**
 * Storage Quota Management
 * Tracks and enforces 5GB storage limit per student
 * Provides warnings and automatic cleanup for classroom management
 */

import { PrismaClient } from '@teaching-engine/database';
import { prisma } from '../prisma';

import { logger } from '../logger';


// 5GB limit per student
export const QUOTA_BYTES = 5 * 1024 * 1024 * 1024;
const WARNING_THRESHOLD = 0.8; // Warn at 80% usage
const CRITICAL_THRESHOLD = 0.95; // Critical at 95% usage

export interface StudentQuotaInfo {
  studentId: string;
  studentName: string;
  totalBytes: number;
  quotaBytes: number;
  usagePercent: number;
  artifactCount: number;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  oldestArtifact?: Date;
  largestFiles: Array<{
    id: string;
    title: string;
    size: number;
    type: string;
    date: Date;
  }>;
}

export interface QuotaReport {
  totalStudents: number;
  totalUsageBytes: number;
  averageUsagePercent: number;
  studentsOverWarning: number;
  studentsOverCritical: number;
  studentsOverQuota: number;
  students: StudentQuotaInfo[];
}

/**
 * Check quota usage for a specific student
 */
export const checkStudentQuota = async (
  studentId: string,
  userId: number
): Promise<StudentQuotaInfo> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      artifacts: {
        where: { isArchived: false },
        select: {
          id: true,
          title: true,
          fileSize: true,
          artifactType: true,
          dateCollected: true
        }
      }
    }
  });

  if (!student || student.userId !== userId) {
    throw new Error('Student not found or access denied');
  }

  const totalBytes = student.artifacts.reduce((sum, artifact) => 
    sum + (artifact.fileSize || 0), 0);
  
  const usagePercent = (totalBytes / QUOTA_BYTES) * 100;
  
  let status: StudentQuotaInfo['status'] = 'OK';
  if (totalBytes > QUOTA_BYTES) {
    status = 'EXCEEDED';
  } else if (usagePercent > CRITICAL_THRESHOLD * 100) {
    status = 'CRITICAL';
  } else if (usagePercent > WARNING_THRESHOLD * 100) {
    status = 'WARNING';
  }

  // Find largest files for cleanup suggestions
  const largestFiles = student.artifacts
    .sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0))
    .slice(0, 5)
    .map(artifact => ({
      id: artifact.id,
      title: artifact.title,
      size: artifact.fileSize || 0,
      type: artifact.artifactType,
      date: artifact.dateCollected
    }));

  // Find oldest artifact
  const oldestArtifact = student.artifacts.length > 0 
    ? new Date(Math.min(...student.artifacts.map(a => a.dateCollected.getTime())))
    : undefined;

  return {
    studentId,
    studentName: `${student.firstName} ${student.lastName}`,
    totalBytes,
    quotaBytes: QUOTA_BYTES,
    usagePercent: Math.round(usagePercent * 100) / 100,
    artifactCount: student.artifacts.length,
    status,
    oldestArtifact,
    largestFiles
  };
};

/**
 * Check quota usage for all students in a class
 */
export const checkClassQuota = async (userId: number): Promise<QuotaReport> => {
  const students = await prisma.student.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      artifacts: {
        where: { isArchived: false },
        select: {
          fileSize: true
        }
      }
    }
  });

  const studentQuotas: StudentQuotaInfo[] = [];
  let totalUsageBytes = 0;
  let studentsOverWarning = 0;
  let studentsOverCritical = 0;
  let studentsOverQuota = 0;

  for (const student of students) {
    const quota = await checkStudentQuota(student.id, userId);
    studentQuotas.push(quota);
    
    totalUsageBytes += quota.totalBytes;
    
    if (quota.status === 'WARNING') studentsOverWarning++;
    if (quota.status === 'CRITICAL') studentsOverCritical++;
    if (quota.status === 'EXCEEDED') studentsOverQuota++;
  }

  const averageUsagePercent = students.length > 0 
    ? (totalUsageBytes / (students.length * QUOTA_BYTES)) * 100 
    : 0;

  return {
    totalStudents: students.length,
    totalUsageBytes,
    averageUsagePercent: Math.round(averageUsagePercent * 100) / 100,
    studentsOverWarning,
    studentsOverCritical,
    studentsOverQuota,
    students: studentQuotas.sort((a, b) => b.usagePercent - a.usagePercent)
  };
};

/**
 * Enforce quota before upload
 */
export const checkQuotaBeforeUpload = async (
  studentId: string,
  userId: number,
  uploadSize: number
): Promise<{
  allowed: boolean;
  reason?: string;
  currentUsage?: StudentQuotaInfo;
}> => {
  try {
    const currentUsage = await checkStudentQuota(studentId, userId);
    
    if (currentUsage.totalBytes + uploadSize > QUOTA_BYTES) {
      return {
        allowed: false,
        reason: `Upload would exceed storage quota. Current usage: ${formatBytes(currentUsage.totalBytes)}, quota: ${formatBytes(QUOTA_BYTES)}`,
        currentUsage
      };
    }
    
    return { allowed: true };
    
  } catch (error: unknown) {
    logger.error('Quota check failed:', error instanceof Error ? error.message : String(error));
    // Fail open - allow upload if quota check fails
    return { allowed: true };
  }
};

/**
 * Suggest cleanup actions for students over quota
 */
export const getCleanupSuggestions = async (
  studentId: string,
  userId: number
): Promise<{
  canArchive: Array<{ id: string; title: string; size: number; age: number }>;
  canDelete: Array<{ id: string; title: string; size: number; reason: string }>;
  totalRecoverable: number;
}> => {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 months old

  const artifacts = await prisma.studentArtifact.findMany({
    where: {
      studentId,
      userId,
      isArchived: false
    },
    select: {
      id: true,
      title: true,
      fileSize: true,
      dateCollected: true,
      processingStatus: true,
      outcomes: true
    },
    orderBy: {
      dateCollected: 'desc'
    }
  });

  const canArchive = artifacts
    .filter(a => a.dateCollected < cutoffDate && a.outcomes.length === 0)
    .map(a => ({
      id: a.id,
      title: a.title,
      size: a.fileSize || 0,
      age: Math.floor((Date.now() - a.dateCollected.getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => b.size - a.size);

  const canDelete = artifacts
    .filter(a => 
      a.processingStatus === 'FAILED' || 
      (a.fileSize === 0) ||
      (a.title.toLowerCase().includes('duplicate'))
    )
    .map(a => ({
      id: a.id,
      title: a.title,
      size: a.fileSize || 0,
      reason: a.processingStatus === 'FAILED' ? 'Processing failed' : 
              a.fileSize === 0 ? 'Empty file' : 'Possible duplicate'
    }));

  const totalRecoverable = [...canArchive, ...canDelete].reduce((sum, item) => sum + item.size, 0);

  return {
    canArchive,
    canDelete,
    totalRecoverable
  };
};

/**
 * Auto-archive old artifacts when approaching quota
 */
export const autoArchiveOldArtifacts = async (
  studentId: string,
  userId: number,
  targetBytes: number
): Promise<{
  archivedCount: number;
  bytesFreed: number;
  artifacts: string[];
}> => {
  const suggestions = await getCleanupSuggestions(studentId, userId);
  
  let bytesFreed = 0;
  let archivedCount = 0;
  const artifacts: string[] = [];
  
  // Archive oldest unused artifacts first
  for (const item of suggestions.canArchive) {
    if (bytesFreed >= targetBytes) break;
    
    await prisma.studentArtifact.update({
      where: { id: item.id },
      data: { isArchived: true }
    });
    
    bytesFreed += item.size;
    archivedCount++;
    artifacts.push(item.id);
    
    logger.info(`Auto-archived artifact ${item.id} (${formatBytes(item.size)}) for student ${studentId}`);
  }
  
  return { archivedCount, bytesFreed, artifacts };
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const base = 1024;
  const decimals = 2;
  
  const i = Math.floor(Math.log(bytes) / Math.log(base));
  
  return `${parseFloat((bytes / Math.pow(base, i)).toFixed(decimals))} ${units[i]}`;
};

/**
 * Monitor and alert on quota usage (called by cron)
 */
export const monitorQuotaUsage = async (userId: number): Promise<void> => {
  try {
    const report = await checkClassQuota(userId);
    
    // Log summary
    logger.info(`Quota monitoring: ${report.totalStudents} students, ${formatBytes(report.totalUsageBytes)} total usage`);
    
    // Alert on students over thresholds
    if (report.studentsOverQuota > 0) {
      logger.error(`${report.studentsOverQuota} students over quota limit`);
    }
    
    if (report.studentsOverCritical > 0) {
      logger.warn(`${report.studentsOverCritical} students in critical usage range`);
    }
    
    // Auto-archive for students over critical threshold
    for (const student of report.students) {
      if (student.status === 'EXCEEDED' || student.status === 'CRITICAL') {
        const targetBytes = QUOTA_BYTES * 0.1; // Free up 10% of quota
        const result = await autoArchiveOldArtifacts(student.studentId, userId, targetBytes);
        
        if (result.archivedCount > 0) {
          logger.info(`Auto-archived ${result.archivedCount} artifacts for ${student.studentName}, freed ${formatBytes(result.bytesFreed)}`);
        }
      }
    }
    
  } catch (error: unknown) {
    logger.error('Quota monitoring failed:', error instanceof Error ? error.message : String(error));
  }
};

// Functions and constants already exported above as named exports
