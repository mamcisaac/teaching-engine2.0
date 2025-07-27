/**
 * Assessment Calculation Services
 * 
 * Provides functions for calculating grades, averages, and achievement levels
 * based on Ontario curriculum assessment standards (Level 1-4)
 */

// Note: Using local AssessmentData interface instead of database Assessment type

export interface AssessmentWithRating {
  rating: number;
  weight?: number;
}

export interface AssessmentData {
  rating: number;
  date: Date;
  type: 'diagnostic' | 'formative' | 'summative';
  strand?: string;
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StrandAggregation {
  assessments: AssessmentData[];
  averageRating: number;
  assessmentCount: number;
}

export interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  strength: number; // 0-1 scale
  startRating: number;
  endRating: number;
  assessmentCount: number;
}

export interface ProgressReport {
  studentId: number;
  period: string;
  overallAverage: number;
  achievementLevel: string;
  strandBreakdown: Record<string, StrandAggregation>;
  trends: TrendAnalysis;
  recommendations: string[];
}

/**
 * Calculate GPA from assessment ratings (1-4 scale)
 */
export function calculateGPA(grades: AssessmentWithRating[]): number {
  if (grades === null || grades.length === 0) {
    return 0;
  }

  const totalWeight = grades.reduce((sum, grade) => sum + (grade.weight ?? 1), 0);
  const weightedSum = grades.reduce((sum, grade) => 
    sum + (grade.rating * (grade.weight ?? 1)), 0
  );

  return weightedSum / totalWeight;
}

/**
 * Calculate average rating from array of ratings
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings === null || ratings.length === 0) {
    return 0;
  }

  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return sum / ratings.length;
}

/**
 * Determine achievement level based on rating
 * Level 1: Below Standard (1.0-1.9)
 * Level 2: Approaching Standard (2.0-2.9)
 * Level 3: Meeting Standard (3.0-3.4)
 * Level 4: Exceeding Standard (3.5-4.0)
 */
export function determineAchievementLevel(rating: number): string {
  if (rating < 1.5) {
    return 'Below Standard';
  } else if (rating < 2.5) {
    return 'Approaching Standard';
  } else if (rating < 3.5) {
    return 'Meeting Standard';
  } 
    return 'Exceeding Standard';
  
}

/**
 * Validate assessment data
 */
export function validateAssessmentData(assessment: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (assessment === null || typeof assessment !== 'object') {
    return { isValid: false, errors: ['Assessment data is required'] };
  }

  const data = assessment as Record<string, unknown>;

  // Validate rating
  if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 4) {
    errors.push('Rating must be a number between 1 and 4');
  }

  // Validate date
  if (data.date === null || !(data.date instanceof Date) || isNaN(data.date.getTime())) {
    errors.push('Valid date is required');
  }

  // Validate type
  const validTypes = ['diagnostic', 'formative', 'summative'];
  if (data.type === null || !validTypes.includes(data.type as string)) {
    errors.push('Type must be diagnostic, formative, or summative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Aggregate assessments by strand
 */
export function aggregateAssessmentsByStrand(
  assessments: AssessmentData[]
): Record<string, StrandAggregation> {
  const aggregated: Record<string, StrandAggregation> = {};

  for (const assessment of assessments) {
    const strand = assessment.strand ?? 'General';
    
    if (aggregated[strand] === null) {
      aggregated[strand] = {
        assessments: [],
        averageRating: 0,
        assessmentCount: 0
      };
    }

    aggregated[strand].assessments.push(assessment);
  }

  // Calculate averages for each strand
  for (const strand in aggregated) {
    const strandData = aggregated[strand];
    const ratings = strandData.assessments.map(a => a.rating);
    strandData.averageRating = calculateAverageRating(ratings);
    strandData.assessmentCount = strandData.assessments.length;
  }

  return aggregated;
}

/**
 * Calculate trend analysis from assessments
 */
export function calculateTrendAnalysis(assessments: AssessmentData[]): TrendAnalysis {
  if (assessments === null || assessments === undefined || assessments.length === 0) {
    return {
      direction: 'stable',
      strength: 0,
      startRating: 0,
      endRating: 0,
      assessmentCount: 0
    };
  }

  if (assessments.length === 1) {
    return {
      direction: 'stable',
      strength: 0,
      startRating: assessments[0].rating,
      endRating: assessments[0].rating,
      assessmentCount: 1
    };
  }

  // Sort by date
  const sorted = [...assessments].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  const startRating = sorted[0].rating;
  const endRating = sorted[sorted.length - 1].rating;
  const difference = endRating - startRating;

  // Calculate trend direction
  let direction: 'improving' | 'declining' | 'stable';
  if (difference > 0.2) {
    direction = 'improving';
  } else if (difference < -0.2) {
    direction = 'declining';
  } else {
    direction = 'stable';
  }

  // Calculate trend strength (0-1 scale)
  const maxDifference = 3; // Maximum possible difference (4-1)
  const strength = Math.min(Math.abs(difference) / maxDifference, 1);

  return {
    direction,
    strength,
    startRating,
    endRating,
    assessmentCount: sorted.length
  };
}

/**
 * Generate comprehensive progress report
 */
export function generateProgressReport(data: {
  studentId: number;
  assessments: AssessmentData[];
  period: string;
}): ProgressReport {
  const { studentId, assessments, period } = data;

  // Calculate overall average
  const ratings = (assessments).map((a: AssessmentData) => a.rating);
  const overallAverage = calculateAverageRating(ratings);
  
  // Determine achievement level
  const achievementLevel = determineAchievementLevel(overallAverage);
  
  // Aggregate by strand
  const strandBreakdown = aggregateAssessmentsByStrand(assessments);
  
  // Calculate trends
  const trends = calculateTrendAnalysis(assessments);
  
  // Generate recommendations
  const recommendations = generateRecommendations(
    overallAverage,
    achievementLevel,
    trends,
    strandBreakdown
  );

  return {
    studentId,
    period,
    overallAverage,
    achievementLevel,
    strandBreakdown,
    trends,
    recommendations
  };
}

/**
 * Generate recommendations based on performance
 */
function generateRecommendations(
  _average: number,
  level: string,
  trends: TrendAnalysis,
  strandBreakdown: Record<string, StrandAggregation>
): string[] {
  const recommendations: string[] = [];

  // Level-based recommendations
  if (level === 'Below Standard') {
    recommendations.push('Consider additional support and intervention strategies');
    recommendations.push('Focus on foundational skills and concepts');
    recommendations.push('Provide more practice opportunities with immediate feedback');
  } else if (level === 'Approaching Standard') {
    recommendations.push('Continue current support strategies');
    recommendations.push('Target specific areas for improvement');
    recommendations.push('Encourage regular practice and review');
  } else if (level === 'Meeting Standard') {
    recommendations.push('Maintain current learning strategies');
    recommendations.push('Introduce enrichment activities');
    recommendations.push('Encourage peer tutoring opportunities');
  } else if (level === 'Exceeding Standard') {
    recommendations.push('Provide advanced enrichment opportunities');
    recommendations.push('Consider acceleration in strong subject areas');
    recommendations.push('Encourage leadership and mentoring roles');
  }

  // Trend-based recommendations
  if (trends.direction === 'declining' && trends.strength > 0.3) {
    recommendations.push('Investigate potential causes for declining performance');
    recommendations.push('Increase frequency of formative assessments');
  } else if (trends.direction === 'improving' && trends.strength > 0.3) {
    recommendations.push('Continue current strategies that are showing success');
    recommendations.push('Celebrate improvement to maintain motivation');
  }

  // Strand-specific recommendations
  for (const [strand, data] of Object.entries(strandBreakdown)) {
    if (data.averageRating < 2.5) {
      recommendations.push(`Focus additional support on ${strand} concepts`);
    }
  }

  return recommendations;
}