/**
 * Assessment Aggregation Service
 * Aggregates student assessments across multiple lessons per expectation
 * Implements ETFO best practices for evidence triangulation
 */

import { PrismaClient } from '@teaching-engine/database';
import { prisma } from '../prisma';
import { logger } from '../logger';

export type EvidenceType = 'OBSERVATION' | 'CONVERSATION' | 'PRODUCT';
export type MasteryLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

interface AssessmentData {
  id: string;
  level: MasteryLevel;
  date: Date;
  evidenceType?: EvidenceType;
  lessonId: string;
  notes?: string;
}

interface AggregationResult {
  currentLevel: MasteryLevel;
  previousLevel?: MasteryLevel;
  totalEvidencePieces: number;
  evidenceBalance: {
    observation: number;
    conversation: number;
    product: number;
  };
  strongestEvidence: {
    level: MasteryLevel;
    date: Date;
    type?: EvidenceType;
  }[];
  trend: 'improving' | 'stable' | 'declining';
  lastAssessmentDate: Date;
}

export class AssessmentAggregationService {
  private readonly levelWeights: Record<MasteryLevel, number> = {
    'NOT_YET': 1,
    'APPROACHING': 2,
    'MEETING': 3,
    'EXCEEDING': 4
  };

  /**
   * Aggregate all assessments for a student-expectation pair across all lessons
   */
  async aggregateForExpectation(
    studentId: string,
    expectationId: string,
    userId: number
  ): Promise<AggregationResult | null> {
    try {
      // Fetch all assessments for this student-expectation pair
      const assessments = await prisma.studentAssessment.findMany({
        where: {
          studentId,
          expectationId,
          userId,
          isAnecdotal: false
        },
        orderBy: { date: 'asc' }
      });

      if (assessments.length === 0) {
        return null;
      }

      // Calculate evidence balance
      const evidenceBalance = this.calculateEvidenceBalance(assessments);

      // Calculate weighted average level (more recent assessments weighted higher)
      const currentLevel = this.calculateWeightedLevel(assessments);
      
      // Determine trend
      const trend = this.calculateTrend(assessments);

      // Get strongest evidence (highest level achievements)
      const strongestEvidence = this.getStrongestEvidence(assessments);

      // Get previous level (if multiple assessments exist)
      const previousLevel = assessments.length > 1 
        ? assessments[assessments.length - 2].level as MasteryLevel
        : undefined;

      return {
        currentLevel,
        previousLevel,
        totalEvidencePieces: assessments.length,
        evidenceBalance,
        strongestEvidence,
        trend,
        lastAssessmentDate: assessments[assessments.length - 1].date
      };
    } catch (error) {
      logger.error('Failed to aggregate assessments:', error);
      throw error;
    }
  }

  /**
   * Update StudentOutcomeProgress with aggregated data
   */
  async updateOutcomeProgress(
    studentId: string,
    expectationId: string,
    userId: number
  ): Promise<void> {
    const aggregation = await this.aggregateForExpectation(studentId, expectationId, userId);
    
    if (!aggregation) {
      return;
    }

    try {
      // Check if progress record exists
      const existing = await prisma.studentOutcomeProgress.findFirst({
        where: {
          studentId,
          outcomeId: expectationId,
          userId
        }
      });

      const progressData = {
        currentLevel: aggregation.currentLevel,
        previousLevel: aggregation.previousLevel,
        lastAssessmentDate: aggregation.lastAssessmentDate,
        totalEvidencePieces: aggregation.totalEvidencePieces,
        strongestEvidence: JSON.stringify(aggregation.strongestEvidence),
        evidenceBalance: aggregation.evidenceBalance,
        updatedAt: new Date()
      };

      if (existing) {
        // Update existing record
        await prisma.studentOutcomeProgress.update({
          where: { id: existing.id },
          data: progressData
        });
      } else {
        // Create new record
        await prisma.studentOutcomeProgress.create({
          data: {
            studentId,
            outcomeId: expectationId,
            userId,
            ...progressData
          }
        });
      }

      logger.info(`Updated outcome progress for student ${studentId}, expectation ${expectationId}`);
    } catch (error) {
      logger.error('Failed to update outcome progress:', error);
      throw error;
    }
  }

  /**
   * Batch update all outcome progress for a student
   */
  async updateAllOutcomesForStudent(studentId: string, userId: number): Promise<void> {
    try {
      // Get all unique expectations assessed for this student
      const assessedExpectations = await prisma.studentAssessment.findMany({
        where: {
          studentId,
          userId,
          expectationId: { not: null }
        },
        select: {
          expectationId: true
        },
        distinct: ['expectationId']
      });

      // Update progress for each expectation
      for (const { expectationId } of assessedExpectations) {
        if (expectationId) {
          await this.updateOutcomeProgress(studentId, expectationId, userId);
        }
      }

      logger.info(`Updated all outcome progress for student ${studentId}`);
    } catch (error) {
      logger.error('Failed to update all outcomes for student:', error);
      throw error;
    }
  }

  /**
   * Calculate evidence triangulation balance
   */
  private calculateEvidenceBalance(assessments: any[]): AggregationResult['evidenceBalance'] {
    const counts = {
      observation: 0,
      conversation: 0,
      product: 0
    };

    assessments.forEach(assessment => {
      // Use evidenceType field if available, otherwise infer from notes
      if (assessment.evidenceType) {
        switch (assessment.evidenceType) {
          case 'OBSERVATION':
            counts.observation++;
            break;
          case 'CONVERSATION':
            counts.conversation++;
            break;
          case 'PRODUCT':
            counts.product++;
            break;
        }
      } else if (assessment.notes?.toLowerCase().includes('observ')) {
        counts.observation++;
      } else if (assessment.notes?.toLowerCase().includes('discuss') || 
                 assessment.notes?.toLowerCase().includes('convers')) {
        counts.conversation++;
      } else if (assessment.notes?.toLowerCase().includes('work') || 
                 assessment.notes?.toLowerCase().includes('product')) {
        counts.product++;
      } else {
        // Default distribution if not specified
        const defaultType = assessments.indexOf(assessment) % 3;
        if (defaultType === 0) counts.observation++;
        else if (defaultType === 1) counts.conversation++;
        else counts.product++;
      }
    });

    return counts;
  }

  /**
   * Calculate weighted average level (recent assessments weighted more)
   */
  private calculateWeightedLevel(assessments: any[]): MasteryLevel {
    if (assessments.length === 0) return 'NOT_YET';
    if (assessments.length === 1) return assessments[0].level as MasteryLevel;

    // Apply recency weighting (exponential decay)
    let weightedSum = 0;
    let totalWeight = 0;
    const now = new Date();

    assessments.forEach((assessment, index) => {
      const daysSinceAssessment = Math.floor(
        (now.getTime() - new Date(assessment.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Recent assessments get higher weight
      const recencyWeight = Math.exp(-daysSinceAssessment / 30); // 30-day half-life
      const levelValue = this.levelWeights[assessment.level as MasteryLevel];
      
      weightedSum += levelValue * recencyWeight;
      totalWeight += recencyWeight;
    });

    const averageValue = weightedSum / totalWeight;
    
    // Round to nearest level
    if (averageValue <= 1.5) return 'NOT_YET';
    if (averageValue <= 2.5) return 'APPROACHING';
    if (averageValue <= 3.5) return 'MEETING';
    return 'EXCEEDING';
  }

  /**
   * Calculate trend based on recent assessments
   */
  private calculateTrend(assessments: any[]): 'improving' | 'stable' | 'declining' {
    if (assessments.length < 2) return 'stable';

    // Compare last 3 assessments (or all if fewer)
    const recentCount = Math.min(3, assessments.length);
    const recentAssessments = assessments.slice(-recentCount);
    
    let improvementScore = 0;
    for (let i = 1; i < recentAssessments.length; i++) {
      const prevLevel = this.levelWeights[recentAssessments[i - 1].level as MasteryLevel];
      const currLevel = this.levelWeights[recentAssessments[i].level as MasteryLevel];
      improvementScore += (currLevel - prevLevel);
    }

    if (improvementScore > 0) return 'improving';
    if (improvementScore < 0) return 'declining';
    return 'stable';
  }

  /**
   * Get strongest evidence pieces
   */
  private getStrongestEvidence(assessments: any[]): AggregationResult['strongestEvidence'] {
    // Sort by level (highest first) and take top 3
    const sorted = [...assessments].sort((a, b) => {
      const levelDiff = this.levelWeights[b.level as MasteryLevel] - 
                        this.levelWeights[a.level as MasteryLevel];
      if (levelDiff !== 0) return levelDiff;
      // If same level, prefer more recent
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return sorted.slice(0, 3).map(a => ({
      level: a.level as MasteryLevel,
      date: a.date,
      type: this.inferEvidenceType(a)
    }));
  }

  /**
   * Infer evidence type from assessment notes
   * (Temporary until we add proper evidenceType field)
   */
  private inferEvidenceType(assessment: any): EvidenceType | undefined {
    if (!assessment.notes) return undefined;
    
    const notes = assessment.notes.toLowerCase();
    if (notes.includes('observ')) return 'OBSERVATION';
    if (notes.includes('discuss') || notes.includes('convers')) return 'CONVERSATION';
    if (notes.includes('work') || notes.includes('product')) return 'PRODUCT';
    
    return undefined;
  }

  /**
   * Get aggregated progress for all expectations for a student
   */
  async getStudentProgressSummary(studentId: string, userId: number) {
    try {
      const progressRecords = await prisma.studentOutcomeProgress.findMany({
        where: {
          studentId,
          userId,
          isArchived: false
        },
        include: {
          outcome: {
            select: {
              code: true,
              description: true,
              subject: true
            }
          }
        },
        orderBy: { lastAssessmentDate: 'desc' }
      });

      return progressRecords.map(record => ({
        expectationCode: record.outcome.code,
        expectationDescription: record.outcome.description,
        subject: record.outcome.subject,
        currentLevel: record.currentLevel,
        previousLevel: record.previousLevel,
        trend: this.determineTrendFromLevels(
          record.previousLevel as MasteryLevel | null,
          record.currentLevel as MasteryLevel
        ),
        totalEvidence: record.totalEvidencePieces,
        lastAssessed: record.lastAssessmentDate
      }));
    } catch (error) {
      logger.error('Failed to get student progress summary:', error);
      throw error;
    }
  }

  private determineTrendFromLevels(
    previous: MasteryLevel | null,
    current: MasteryLevel
  ): 'improving' | 'stable' | 'declining' {
    if (!previous) return 'stable';
    
    const prevValue = this.levelWeights[previous];
    const currValue = this.levelWeights[current];
    
    if (currValue > prevValue) return 'improving';
    if (currValue < prevValue) return 'declining';
    return 'stable';
  }
}

export const assessmentAggregation = new AssessmentAggregationService();