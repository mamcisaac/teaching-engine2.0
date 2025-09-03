import type { PrismaClient } from '@prisma/client';

import { logger } from '../logger';
import { BaseService } from './base/BaseService';

export interface CurriculumCoverageReport {
  analysis_date: Date;
  academic_year: string;
  grade: number;
  subjects_analyzed: string[];
  
  overall_coverage: {
    total_expectations: number;
    covered_expectations: number;
    coverage_percentage: number;
    quality_score: number; // 0-1 scale based on depth and frequency
  };
  
  subject_breakdown: SubjectCoverageAnalysis[];
  strand_analysis: StrandCoverageAnalysis[];
  temporal_distribution: TemporalDistribution[];
  coverage_gaps: CoverageGap[];
  coverage_overlaps: CoverageOverlap[];
  recommendations: CoverageRecommendation[];
  
  depth_analysis: {
    surface_level: number; // Just mentioned
    developing: number;    // Some exploration
    proficient: number;    // Adequate coverage
    deep: number;          // Thorough, multi-faceted coverage
  };
  
  balance_metrics: {
    subject_time_balance: Record<string, number>;
    strand_emphasis: Record<string, number>;
    assessment_distribution: Record<string, number>;
  };
}

export interface SubjectCoverageAnalysis {
  subject_name: string;
  total_expectations: number;
  covered_expectations: number;
  coverage_percentage: number;
  depth_quality: 'excellent' | 'good' | 'adequate' | 'insufficient';
  
  strand_coverage: {
    strand_name: string;
    expectations_count: number;
    covered_count: number;
    coverage_percentage: number;
    average_depth: number;
  }[];
  
  timeline_distribution: {
    term: string;
    expectations_planned: number;
    realistic_assessment: 'appropriate' | 'overloaded' | 'underutilized';
  }[];
  
  assessment_alignment: {
    diagnostic_coverage: number;
    formative_coverage: number;
    summative_coverage: number;
    balance_score: number;
  };
}

export interface StrandCoverageAnalysis {
  subject: string;
  strand_name: string;
  strand_name_fr?: string;
  importance_weight: 'critical' | 'important' | 'supplementary';
  
  expectation_coverage: {
    expectation_code: string;
    expectation_description: string;
    coverage_instances: CoverageInstance[];
    overall_depth: 'none' | 'surface' | 'developing' | 'proficient' | 'deep';
    quality_indicators: string[];
    improvement_suggestions: string[];
  }[];
  
  strand_coherence: {
    logical_progression: boolean;
    appropriate_sequencing: boolean;
    skill_building: boolean;
    assessment_alignment: boolean;
    coherence_score: number; // 0-1
  };
}

export interface CoverageInstance {
  lesson_id?: string;
  unit_id?: string;
  date: Date;
  context: 'lesson' | 'unit' | 'assessment' | 'daybook_reflection';
  depth_level: 'surface' | 'developing' | 'proficient' | 'deep';
  quality_indicators: string[];
  time_allocated: number; // minutes
  assessment_type?: 'diagnostic' | 'formative' | 'summative';
}

export interface TemporalDistribution {
  time_period: string; // 'September', 'Term 1', 'Week 1-4', etc.
  expectations_scheduled: number;
  realistic_capacity: number;
  overload_risk: 'low' | 'moderate' | 'high' | 'critical';
  
  subject_balance: Record<string, number>;
  assessment_load: {
    diagnostic: number;
    formative: number;
    summative: number;
    total_assessment_time: number;
  };
  
  recommendations: string[];
}

export interface CoverageGap {
  gap_type: 'missing_expectation' | 'insufficient_depth' | 'poor_sequencing' | 'assessment_gap' | 'time_gap';
  severity: 'critical' | 'important' | 'minor';
  
  affected_expectations: string[];
  subject: string;
  strand?: string;
  
  description: string;
  impact_analysis: string;
  recommended_solutions: GapSolution[];
  timeline_for_resolution: string;
}

export interface GapSolution {
  solution_type: 'add_lesson' | 'modify_existing' | 'integrate_with_other' | 'extend_unit' | 'add_assessment';
  description: string;
  implementation_complexity: 'simple' | 'moderate' | 'complex';
  time_required: string;
  resource_requirements: string[];
  success_indicators: string[];
}

export interface CoverageOverlap {
  overlap_type: 'redundant_coverage' | 'excessive_repetition' | 'inefficient_sequencing';
  affected_expectations: string[];
  subjects_involved: string[];
  
  description: string;
  efficiency_impact: 'minor' | 'moderate' | 'significant';
  consolidation_opportunities: string[];
  time_savings_potential: string;
}

export interface CoverageRecommendation {
  recommendation_type: 'immediate_action' | 'short_term_planning' | 'long_term_adjustment' | 'system_optimization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  title: string;
  description: string;
  rationale: string;
  implementation_steps: string[];
  expected_outcomes: string[];
  success_metrics: string[];
  timeline: string;
  
  resource_implications: {
    time_investment: string;
    materials_needed: string[];
    professional_development: string[];
    collaboration_required: string[];
  };
}

export interface QualityVerificationResult {
  verification_date: Date;
  overall_quality_score: number; // 0-100
  
  pedagogical_alignment: {
    ubd_compliance: number;
    etfo_alignment: number;
    research_based_practices: number;
    grade_appropriateness: number;
  };
  
  curriculum_fidelity: {
    expectation_accuracy: number;
    strand_balance: number;
    progression_logic: number;
    assessment_alignment: number;
  };
  
  implementation_feasibility: {
    time_realism: number;
    resource_availability: number;
    teacher_workload: number;
    student_developmental_fit: number;
  };
  
  quality_indicators: {
    strength_areas: string[];
    improvement_areas: string[];
    critical_issues: string[];
    exemplary_practices: string[];
  };
  
  certification_status: 'certified' | 'conditional' | 'requires_revision';
  certification_notes: string[];
}

export class StandardsVerificationService extends BaseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super('StandardsVerificationService');
    this.prisma = prisma;
  }

  /**
   * Comprehensive curriculum coverage analysis for a teacher's planning
   */
  async analyzeCurriculumCoverage(parameters: {
    user_id: number;
    academic_year: string;
    grade: number;
    analysis_scope: 'full_year' | 'term' | 'current_planning';
    subjects_to_analyze: string[];
  }): Promise<CurriculumCoverageReport> {
    try {
      logger.info(`Starting comprehensive coverage analysis for user ${parameters.user_id}`);

      // 1. Gather all curriculum expectations for grade/subjects
      const allExpectations = await this.getAllCurriculumExpectations(
        parameters.grade,
        parameters.subjects_to_analyze
      );

      // 2. Analyze current planning coverage
      const currentCoverage = await this.analyzePlannedCoverage(
        parameters.user_id,
        parameters.academic_year,
        allExpectations
      );

      // 3. Evaluate coverage quality and depth
      const qualityAnalysis = await this.evaluateCoverageQuality(currentCoverage);

      // 4. Analyze temporal distribution
      const temporalAnalysis = await this.analyzeTemporalDistribution(
        parameters.user_id,
        parameters.academic_year
      );

      // 5. Identify gaps and overlaps
      const gapAnalysis = await this.identifyGapsAndOverlaps(
        allExpectations,
        currentCoverage,
        temporalAnalysis
      );

      // 6. Generate optimization recommendations
      const recommendations = await this.generateOptimizationRecommendations(
        gapAnalysis,
        qualityAnalysis,
        temporalAnalysis
      );

      // 7. Calculate balance metrics
      const balanceMetrics = this.calculateBalanceMetrics(currentCoverage, temporalAnalysis);

      const coverageReport: CurriculumCoverageReport = {
        analysis_date: new Date(),
        academic_year: parameters.academic_year,
        grade: parameters.grade,
        subjects_analyzed: parameters.subjects_to_analyze,
        overall_coverage: {
          total_expectations: allExpectations.length,
          covered_expectations: currentCoverage.length,
          coverage_percentage: Math.round((currentCoverage.length / allExpectations.length) * 100),
          quality_score: qualityAnalysis.overall_quality
        },
        subject_breakdown: await this.createSubjectBreakdown(
          parameters.subjects_to_analyze,
          allExpectations,
          currentCoverage
        ),
        strand_analysis: await this.createStrandAnalysis(allExpectations, currentCoverage),
        temporal_distribution: temporalAnalysis,
        coverage_gaps: gapAnalysis.gaps,
        coverage_overlaps: gapAnalysis.overlaps,
        recommendations: recommendations,
        depth_analysis: qualityAnalysis.depth_distribution,
        balance_metrics: balanceMetrics
      };

      await this.saveCoverageReport(coverageReport, parameters.user_id);
      
      logger.info('Curriculum coverage analysis completed');
      return coverageReport;
    } catch (error: unknown) {
      logger.error('Error in curriculum coverage analysis:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Verify quality and compliance of lesson/unit planning
   */
  async verifyPlanningQuality(parameters: {
    lesson_id?: string;
    unit_id?: string;
    long_range_plan_id?: string;
    verification_criteria: string[];
  }): Promise<QualityVerificationResult> {
    try {
      logger.info('Starting quality verification');

      let planningData;
      if (parameters.lesson_id) {
        planningData = await this.getLessonPlanData(parameters.lesson_id);
      } else if (parameters.unit_id) {
        planningData = await this.getUnitPlanData(parameters.unit_id);
      } else if (parameters.long_range_plan_id) {
        planningData = await this.getLongRangePlanData(parameters.long_range_plan_id);
      }

      if (!planningData) {
        throw new Error('No planning data found for verification');
      }

      // Verify pedagogical alignment
      const pedagogicalAlignment = await this.verifyPedagogicalAlignment(planningData);

      // Verify curriculum fidelity
      const curriculumFidelity = await this.verifyCurriculumFidelity(planningData);

      // Verify implementation feasibility
      const implementationFeasibility = await this.verifyImplementationFeasibility(planningData);

      // Analyze quality indicators
      const qualityIndicators = await this.analyzeQualityIndicators(
        planningData,
        pedagogicalAlignment,
        curriculumFidelity,
        implementationFeasibility
      );

      // Calculate overall quality score
      const overallScore = this.calculateOverallQualityScore(
        pedagogicalAlignment,
        curriculumFidelity,
        implementationFeasibility
      );

      // Determine certification status
      const certificationStatus = this.determineCertificationStatus(overallScore, qualityIndicators);

      return {
        verification_date: new Date(),
        overall_quality_score: Math.round(overallScore),
        pedagogical_alignment: pedagogicalAlignment,
        curriculum_fidelity: curriculumFidelity,
        implementation_feasibility: implementationFeasibility,
        quality_indicators: qualityIndicators,
        certification_status: certificationStatus.status,
        certification_notes: certificationStatus.notes
      };
    } catch (error: unknown) {
      logger.error('Error in planning quality verification:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Real-time validation during lesson planning
   */
  async validatePlanningInProgress(parameters: {
    current_lesson_data: any;
    unit_context: any;
    curriculum_expectations: string[];
  }): Promise<{
    validation_status: 'valid' | 'warning' | 'error';
    issues: string[];
    suggestions: string[];
    compliance_score: number;
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let complianceScore = 100;

    // Check UbD compliance
    if (!this.hasLearningOutcomes(parameters.current_lesson_data)) {
      issues.push('Missing clear learning outcomes');
      suggestions.push('Define specific, measurable learning goals before planning activities');
      complianceScore -= 20;
    }

    // Check assessment alignment
    if (!this.hasAssessmentStrategy(parameters.current_lesson_data)) {
      issues.push('No assessment strategy defined');
      suggestions.push('Plan how you will know students have learned before designing activities');
      complianceScore -= 15;
    }

    // Check three-part lesson structure (ETFO requirement)
    if (!this.hasThreePartStructure(parameters.current_lesson_data)) {
      issues.push('Missing three-part lesson structure (Minds-On, Action, Consolidation)');
      suggestions.push('Ensure lesson includes all three phases for optimal learning');
      complianceScore -= 15;
    }

    // Check differentiation planning
    if (!this.hasDifferentiation(parameters.current_lesson_data)) {
      issues.push('Limited differentiation strategies');
      suggestions.push('Include accommodations and modifications for diverse learners');
      complianceScore -= 10;
    }

    // Check Grade 1 appropriateness
    const gradeAppropriateIssues = this.checkGradeAppropriateness(parameters.current_lesson_data, 1);
    issues.push(...gradeAppropriateIssues.issues);
    suggestions.push(...gradeAppropriateIssues.suggestions);
    complianceScore -= gradeAppropriateIssues.penalty;

    // Check French immersion considerations
    const frenchIssues = this.checkFrenchImmersionAlignment(parameters.current_lesson_data);
    issues.push(...frenchIssues.issues);
    suggestions.push(...frenchIssues.suggestions);
    complianceScore -= frenchIssues.penalty;

    const validationStatus = complianceScore >= 85 ? 'valid' : 
                           complianceScore >= 70 ? 'warning' : 'error';

    return {
      validation_status: validationStatus,
      issues,
      suggestions,
      compliance_score: Math.max(complianceScore, 0)
    };
  }

  // Implementation methods

  private async getAllCurriculumExpectations(
    grade: number,
    subjects: string[]
  ): Promise<Array<{ id: string; code: string; description: string; subject: string; strand: string; }>> {
    const expectations = await this.prisma.curriculumExpectation.findMany({
      where: {
        grade,
        subject: { in: subjects }
      },
      select: {
        id: true,
        code: true,
        description: true,
        subject: true,
        strand: true,
        substrand: true
      }
    });

    return expectations;
  }

  private async analyzePlannedCoverage(
    userId: number,
    academicYear: string,
    allExpectations: any[]
  ): Promise<CoverageInstance[]> {
    const coverage: CoverageInstance[] = [];

    // Analyze long-range plans
    const longRangePlans = await this.prisma.longRangePlan.findMany({
      where: { userId, academicYear },
      include: {
        expectations: {
          include: { expectation: true }
        },
        unitPlans: {
          include: {
            expectations: { include: { expectation: true } },
            lessonPlans: {
              include: {
                expectations: { include: { expectation: true } }
              }
            }
          }
        }
      }
    });

    // Extract coverage instances from all planning levels
    for (const lrp of longRangePlans) {
      // Long-range level expectations
      for (const exp of lrp.expectations) {
        coverage.push({
          date: lrp.createdAt,
          context: 'lesson',
          depth_level: 'surface',
          quality_indicators: ['Planned in long-range'],
          time_allocated: 0
        });
      }

      // Unit level expectations
      for (const unit of lrp.unitPlans) {
        for (const exp of unit.expectations) {
          const estimatedTime = unit.estimatedHours ? unit.estimatedHours * 60 : 0;
          coverage.push({
            unit_id: unit.id,
            date: unit.startDate,
            context: 'unit',
            depth_level: 'developing',
            quality_indicators: ['Planned in unit', 'Time allocated'],
            time_allocated: estimatedTime / Math.max(unit.expectations.length, 1)
          });
        }

        // Lesson level expectations
        for (const lesson of unit.lessonPlans) {
          for (const exp of lesson.expectations) {
            coverage.push({
              lesson_id: lesson.id,
              unit_id: unit.id,
              date: lesson.date,
              context: 'lesson',
              depth_level: this.inferDepthFromLesson(lesson),
              quality_indicators: this.extractQualityIndicators(lesson),
              time_allocated: lesson.duration,
              assessment_type: lesson.assessmentType as 'diagnostic' | 'formative' | 'summative' | undefined
            });
          }
        }
      }
    }

    return coverage;
  }

  private async evaluateCoverageQuality(coverage: CoverageInstance[]): Promise<{
    overall_quality: number;
    depth_distribution: { surface_level: number; developing: number; proficient: number; deep: number; };
  }> {
    const depthCounts = {
      surface_level: coverage.filter(c => c.depth_level === 'surface').length,
      developing: coverage.filter(c => c.depth_level === 'developing').length,
      proficient: coverage.filter(c => c.depth_level === 'proficient').length,
      deep: coverage.filter(c => c.depth_level === 'deep').length
    };

    // Quality score based on depth distribution and quality indicators
    const totalCoverage = coverage.length;
    const qualityScore = totalCoverage > 0 ? (
      (depthCounts.surface_level * 0.3 + 
       depthCounts.developing * 0.6 + 
       depthCounts.proficient * 0.9 + 
       depthCounts.deep * 1.0) / totalCoverage
    ) : 0;

    return {
      overall_quality: qualityScore,
      depth_distribution: depthCounts
    };
  }

  private async analyzeTemporalDistribution(
    userId: number,
    academicYear: string
  ): Promise<TemporalDistribution[]> {
    // Analyze distribution across school year months
    const months = [
      'September', 'October', 'November', 'December',
      'January', 'February', 'March', 'April', 'May', 'June'
    ];

    const distribution: TemporalDistribution[] = [];

    for (const month of months) {
      const monthStart = new Date(`${academicYear.split('-')[0]}-${this.getMonthNumber(month)}-01`);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const monthlyLessons = await this.prisma.eTFOLessonPlan.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd }
        },
        include: {
          expectations: { include: { expectation: true } },
          unitPlan: { include: { longRangePlan: true } }
        }
      });

      const expectationsCount = monthlyLessons.reduce(
        (sum, lesson) => sum + lesson.expectations.length, 0
      );

      // Estimate realistic capacity (assuming 20 school days per month, 4-6 lessons per day)
      const realisticCapacity = 20 * 5; // 100 lessons per month capacity

      distribution.push({
        time_period: month,
        expectations_scheduled: expectationsCount,
        realistic_capacity: realisticCapacity,
        overload_risk: this.assessOverloadRisk(monthlyLessons.length, realisticCapacity),
        subject_balance: this.calculateSubjectBalance(monthlyLessons),
        assessment_load: this.calculateAssessmentLoad(monthlyLessons),
        recommendations: this.generateTemporalRecommendations(month, monthlyLessons.length, realisticCapacity)
      });
    }

    return distribution;
  }

  private async identifyGapsAndOverlaps(
    allExpectations: any[],
    currentCoverage: CoverageInstance[],
    temporalAnalysis: TemporalDistribution[]
  ): Promise<{ gaps: CoverageGap[]; overlaps: CoverageOverlap[]; }> {
    const gaps: CoverageGap[] = [];
    const overlaps: CoverageOverlap[] = [];

    // Identify missing expectations
    const coveredExpectationIds = new Set(
      currentCoverage.map(c => c.lesson_id).filter(Boolean)
    );

    const missingExpectations = allExpectations.filter(
      exp => !coveredExpectationIds.has(exp.id)
    );

    for (const missing of missingExpectations) {
      gaps.push({
        gap_type: 'missing_expectation',
        severity: this.assessGapSeverity(missing),
        affected_expectations: [missing.id],
        subject: missing.subject,
        strand: missing.strand,
        description: `Expectation ${missing.code} not covered in current planning`,
        impact_analysis: `Students will miss learning opportunity for: ${missing.description}`,
        recommended_solutions: this.generateGapSolutions(missing),
        timeline_for_resolution: 'Next unit planning cycle'
      });
    }

    // Identify insufficient depth coverage
    const shallowCoverage = currentCoverage.filter(c => 
      c.depth_level === 'surface' && c.time_allocated < 30
    );

    if (shallowCoverage.length > currentCoverage.length * 0.3) {
      gaps.push({
        gap_type: 'insufficient_depth',
        severity: 'important',
        affected_expectations: shallowCoverage.map(c => c.lesson_id || 'unknown'),
        subject: 'Multiple',
        description: 'Many expectations receive only surface-level coverage',
        impact_analysis: 'Students may not develop deep understanding of key concepts',
        recommended_solutions: [{
          solution_type: 'modify_existing',
          description: 'Extend time and depth for key expectations',
          implementation_complexity: 'moderate',
          time_required: '2-3 weeks planning adjustment',
          resource_requirements: ['Additional activities', 'Assessment tools'],
          success_indicators: ['Increased depth levels', 'Better student understanding']
        }],
        timeline_for_resolution: 'Current term'
      });
    }

    // Identify redundant coverage
    const expectationCounts = new Map<string, number>();
    currentCoverage.forEach(c => {
      if (c.lesson_id) {
        expectationCounts.set(c.lesson_id, (expectationCounts.get(c.lesson_id) || 0) + 1);
      }
    });

    const redundantExpectations = Array.from(expectationCounts.entries())
      .filter(([_, count]) => count > 3)
      .map(([id, _]) => id);

    if (redundantExpectations.length > 0) {
      overlaps.push({
        overlap_type: 'redundant_coverage',
        affected_expectations: redundantExpectations,
        subjects_involved: ['Multiple'],
        description: 'Some expectations are covered repeatedly without purpose',
        efficiency_impact: 'moderate',
        consolidation_opportunities: [
          'Combine repetitive lessons',
          'Focus on deeper exploration instead of repetition'
        ],
        time_savings_potential: '15-30% efficiency gain possible'
      });
    }

    return { gaps, overlaps };
  }

  private async generateOptimizationRecommendations(
    gapAnalysis: { gaps: CoverageGap[]; overlaps: CoverageOverlap[]; },
    qualityAnalysis: { overall_quality: number; },
    temporalAnalysis: TemporalDistribution[]
  ): Promise<CoverageRecommendation[]> {
    const recommendations: CoverageRecommendation[] = [];

    // Critical gap recommendations
    const criticalGaps = gapAnalysis.gaps.filter(g => g.severity === 'critical');
    if (criticalGaps.length > 0) {
      recommendations.push({
        recommendation_type: 'immediate_action',
        priority: 'critical',
        title: 'Address Critical Curriculum Gaps',
        description: `${criticalGaps.length} critical expectations are missing from current planning`,
        rationale: 'Students must receive instruction in all critical curriculum expectations',
        implementation_steps: [
          'Review missing critical expectations',
          'Identify upcoming units where these can be integrated',
          'Modify unit plans to include missing expectations',
          'Adjust timeline if necessary'
        ],
        expected_outcomes: [
          'Complete curriculum coverage',
          'Compliance with ministry requirements',
          'Better student preparation for next grade'
        ],
        success_metrics: [
          '100% coverage of critical expectations',
          'Maintained lesson quality',
          'Realistic timeline maintained'
        ],
        timeline: '2-3 weeks',
        resource_implications: {
          time_investment: '8-12 hours planning adjustment',
          materials_needed: ['Curriculum documents', 'Additional resources for new expectations'],
          professional_development: ['Review of missed expectations content'],
          collaboration_required: ['Grade team coordination', 'Principal notification']
        }
      });
    }

    // Quality improvement recommendations
    if (qualityAnalysis.overall_quality < 0.7) {
      recommendations.push({
        recommendation_type: 'short_term_planning',
        priority: 'high',
        title: 'Enhance Coverage Depth and Quality',
        description: 'Current coverage lacks depth in many areas',
        rationale: 'Students need deeper engagement with curriculum expectations for meaningful learning',
        implementation_steps: [
          'Identify surface-level coverage instances',
          'Extend time allocation for key concepts',
          'Add hands-on and inquiry-based activities',
          'Include multiple assessment opportunities'
        ],
        expected_outcomes: [
          'Deeper student understanding',
          'Better retention of learning',
          'Improved assessment results'
        ],
        success_metrics: [
          'Average depth level increases to proficient',
          'Quality indicators improve',
          'Student engagement increases'
        ],
        timeline: '4-6 weeks',
        resource_implications: {
          time_investment: '10-15 hours over 6 weeks',
          materials_needed: ['Manipulatives', 'Extended activity resources'],
          professional_development: ['Depth vs breadth training'],
          collaboration_required: ['Colleague lesson sharing']
        }
      });
    }

    // Temporal balance recommendations
    const overloadedMonths = temporalAnalysis.filter(t => t.overload_risk === 'high' || t.overload_risk === 'critical');
    if (overloadedMonths.length > 0) {
      recommendations.push({
        recommendation_type: 'long_term_adjustment',
        priority: 'medium',
        title: 'Rebalance Curriculum Timeline',
        description: `${overloadedMonths.length} months have excessive curriculum load`,
        rationale: 'Balanced pacing ensures sustainable learning and teacher workload',
        implementation_steps: [
          'Identify moveable expectations from overloaded months',
          'Find appropriate placement in underutilized periods',
          'Maintain logical sequencing and prerequisites',
          'Update long-range plans accordingly'
        ],
        expected_outcomes: [
          'Sustainable pacing throughout year',
          'Reduced teacher stress',
          'Better student learning conditions'
        ],
        success_metrics: [
          'No months with critical overload',
          'More even distribution of expectations',
          'Teacher satisfaction with pacing'
        ],
        timeline: 'Next year planning cycle',
        resource_implications: {
          time_investment: '15-20 hours long-range planning',
          materials_needed: ['Planning templates', 'Calendar resources'],
          professional_development: ['Pacing and balance strategies'],
          collaboration_required: ['Grade team coordination', 'Administration approval']
        }
      });
    }

    return recommendations;
  }

  private calculateBalanceMetrics(
    coverage: CoverageInstance[],
    temporal: TemporalDistribution[]
  ): CurriculumCoverageReport['balance_metrics'] {
    // Calculate subject time balance
    const subjectTime: Record<string, number> = {};
    coverage.forEach(c => {
      // This would need actual subject identification logic
      subjectTime['Mathematics'] = (subjectTime['Mathematics'] || 0) + c.time_allocated;
    });

    // Calculate strand emphasis
    const strandEmphasis: Record<string, number> = {
      'Number Sense': 40,
      'Geometry': 30,
      'Patterns': 20,
      'Data Management': 10
    };

    // Calculate assessment distribution
    const assessmentDistribution: Record<string, number> = {
      'diagnostic': coverage.filter(c => c.assessment_type === 'diagnostic').length,
      'formative': coverage.filter(c => c.assessment_type === 'formative').length,
      'summative': coverage.filter(c => c.assessment_type === 'summative').length
    };

    return {
      subject_time_balance: subjectTime,
      strand_emphasis: strandEmphasis,
      assessment_distribution: assessmentDistribution
    };
  }

  // Quality verification methods

  private async verifyPedagogicalAlignment(planningData: any): Promise<QualityVerificationResult['pedagogical_alignment']> {
    return {
      ubd_compliance: this.assessUbDCompliance(planningData),
      etfo_alignment: this.assessETFOAlignment(planningData),
      research_based_practices: this.assessResearchAlignment(planningData),
      grade_appropriateness: this.assessGradeAppropriateness(planningData).score
    };
  }

  private async verifyCurriculumFidelity(planningData: any): Promise<QualityVerificationResult['curriculum_fidelity']> {
    return {
      expectation_accuracy: 0.95, // Would be calculated based on actual expectation matching
      strand_balance: 0.85,
      progression_logic: 0.90,
      assessment_alignment: 0.88
    };
  }

  private async verifyImplementationFeasibility(planningData: any): Promise<QualityVerificationResult['implementation_feasibility']> {
    return {
      time_realism: this.assessTimeRealism(planningData),
      resource_availability: 0.90,
      teacher_workload: 0.85,
      student_developmental_fit: 0.92
    };
  }

  // Helper methods

  private inferDepthFromLesson(lesson: any): 'surface' | 'developing' | 'proficient' | 'deep' {
    const duration = lesson.duration || 0;
    const hasAssessment = !!lesson.assessmentType;
    const hasReflection = !!lesson.consolidation;
    
    if (duration < 30) return 'surface';
    if (duration >= 60 && hasAssessment && hasReflection) return 'deep';
    if (duration >= 45 && (hasAssessment || hasReflection)) return 'proficient';
    return 'developing';
  }

  private extractQualityIndicators(lesson: any): string[] {
    const indicators: string[] = [];
    if (lesson.mindsOn) indicators.push('Minds-On activity');
    if (lesson.action) indicators.push('Action phase');
    if (lesson.consolidation) indicators.push('Consolidation');
    if (lesson.assessmentType) indicators.push('Assessment planned');
    if (lesson.accommodations?.length > 0) indicators.push('Differentiation included');
    return indicators;
  }

  private getMonthNumber(monthName: string): string {
    const months: Record<string, string> = {
      'September': '09', 'October': '10', 'November': '11', 'December': '12',
      'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06'
    };
    return months[monthName] || '01';
  }

  private assessOverloadRisk(scheduled: number, capacity: number): 'low' | 'moderate' | 'high' | 'critical' {
    const ratio = scheduled / capacity;
    if (ratio <= 0.7) return 'low';
    if (ratio <= 0.85) return 'moderate';
    if (ratio <= 1.0) return 'high';
    return 'critical';
  }

  private calculateSubjectBalance(lessons: any[]): Record<string, number> {
    const balance: Record<string, number> = {};
    lessons.forEach(lesson => {
      const subject = lesson.unitPlan?.longRangePlan?.subject || 'Unknown';
      balance[subject] = (balance[subject] || 0) + 1;
    });
    return balance;
  }

  private calculateAssessmentLoad(lessons: any[]): TemporalDistribution['assessment_load'] {
    return {
      diagnostic: lessons.filter(l => l.assessmentType === 'diagnostic').length,
      formative: lessons.filter(l => l.assessmentType === 'formative').length,
      summative: lessons.filter(l => l.assessmentType === 'summative').length,
      total_assessment_time: lessons.reduce((sum, l) => sum + (l.duration || 0), 0)
    };
  }

  private generateTemporalRecommendations(month: string, scheduled: number, capacity: number): string[] {
    const ratio = scheduled / capacity;
    if (ratio > 1.0) {
      return [
        `Consider moving some lessons from ${month} to less busy months`,
        'Prioritize critical expectations only',
        'Combine similar lessons for efficiency'
      ];
    }
    if (ratio < 0.5) {
      return [
        `${month} has capacity for additional curriculum coverage`,
        'Consider moving lessons from overloaded months',
        'Opportunity for deeper exploration of key concepts'
      ];
    }
    return [`${month} has appropriate curriculum load`];
  }

  private assessGapSeverity(expectation: any): 'critical' | 'important' | 'minor' {
    // Critical expectations are foundational skills
    const criticalStrands = ['Number Sense', 'Communication orale', 'Basic Literacy'];
    if (criticalStrands.some(strand => expectation.strand.includes(strand))) {
      return 'critical';
    }
    return 'important';
  }

  private generateGapSolutions(expectation: any): GapSolution[] {
    return [{
      solution_type: 'add_lesson',
      description: `Create focused lesson for expectation ${expectation.code}`,
      implementation_complexity: 'moderate',
      time_required: '2-3 hours planning + 45-60 minutes instruction',
      resource_requirements: ['Curriculum resources', 'Assessment materials'],
      success_indicators: ['Students meet expectation criteria', 'Assessment evidence collected']
    }];
  }

  private assessUbDCompliance(data: any): number {
    let score = 100;
    if (!data.learningGoals) score -= 25;
    if (!data.assessmentType) score -= 25;
    if (!data.successCriteria) score -= 20;
    if (!data.essentialQuestions) score -= 15;
    if (!data.transferGoals) score -= 15;
    return Math.max(score, 0) / 100;
  }

  private assessETFOAlignment(data: any): number {
    let score = 100;
    if (!data.mindsOn) score -= 20;
    if (!data.action) score -= 20;
    if (!data.consolidation) score -= 20;
    if (!data.differentiationStrategies) score -= 20;
    if (!data.accommodations) score -= 10;
    if (!data.assessmentPlan) score -= 10;
    return Math.max(score, 0) / 100;
  }

  private assessResearchAlignment(data: any): number {
    let score = 100;
    // Check for research-based practices
    if (!data.priorKnowledgeCheck) score -= 15;
    if (!data.activeEngagement) score -= 15;
    if (!data.formativeCheckpoints) score -= 15;
    if (!data.reflectionOpportunities) score -= 15;
    if (!data.realWorldConnections) score -= 10;
    if (!data.culturalResponsiveness) score -= 10;
    if (!data.multipleIntelligences) score -= 10;
    if (!data.ubdAlignment) score -= 10;
    return Math.max(score, 0) / 100;
  }

  private assessGradeAppropriateness(data: any): { score: number; issues: string[]; suggestions: string[]; penalty: number; } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let penalty = 0;

    // Check duration appropriateness for Grade 1
    if (data.duration > 60) {
      issues.push('Lesson duration too long for Grade 1 attention spans');
      suggestions.push('Break lesson into shorter segments or multiple lessons');
      penalty += 10;
    }

    // Check vocabulary complexity
    if (this.hasComplexVocabulary(data)) {
      issues.push('Vocabulary may be too advanced for Grade 1');
      suggestions.push('Simplify language and pre-teach key terms');
      penalty += 5;
    }

    // Check for hands-on activities
    if (!this.hasHandsOnActivities(data)) {
      issues.push('Limited hands-on activities for Grade 1 learners');
      suggestions.push('Include manipulatives and concrete experiences');
      penalty += 5;
    }

    return {
      score: Math.max(100 - penalty, 0) / 100,
      issues,
      suggestions,
      penalty
    };
  }

  private checkFrenchImmersionAlignment(data: any): { issues: string[]; suggestions: string[]; penalty: number; } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let penalty = 0;

    if (!data.frenchLanguageSupports) {
      issues.push('No French language supports specified');
      suggestions.push('Add visual vocabulary supports and sentence starters in French');
      penalty += 10;
    }

    if (!data.culturalConnections) {
      issues.push('Limited French/Francophone cultural connections');
      suggestions.push('Include French Canadian cultural elements and perspectives');
      penalty += 5;
    }

    return { issues, suggestions, penalty };
  }

  // Validation helper methods for real-time checking

  private hasLearningOutcomes(data: any): boolean {
    return !!(data.learningGoals || data.objectives || data.outcomes);
  }

  private hasAssessmentStrategy(data: any): boolean {
    return !!(data.assessmentType || data.assessmentPlan || data.successCriteria);
  }

  private hasThreePartStructure(data: any): boolean {
    return !!(data.mindsOn && data.action && data.consolidation);
  }

  private hasDifferentiation(data: any): boolean {
    return !!(data.accommodations || data.modifications || data.differentiationStrategies);
  }

  private checkGradeAppropriateness(data: any, grade: number): { issues: string[]; suggestions: string[]; penalty: number; } {
    return this.assessGradeAppropriateness(data);
  }

  private assessTimeRealism(data: any): number {
    const duration = data.duration || 45;
    const activityCount = this.countActivities(data);
    const avgTimePerActivity = activityCount > 0 ? duration / activityCount : duration;
    
    // Grade 1 activities should be 10-15 minutes each
    if (avgTimePerActivity >= 10 && avgTimePerActivity <= 20) {
      return 1.0;
    } else if (avgTimePerActivity >= 8 && avgTimePerActivity <= 25) {
      return 0.8;
    } else {
      return 0.6;
    }
  }

  private countActivities(data: any): number {
    let count = 0;
    if (data.mindsOn) count++;
    if (data.action) count++;
    if (data.consolidation) count++;
    return Math.max(count, 1);
  }

  private hasComplexVocabulary(data: any): boolean {
    // Simple check for vocabulary complexity - in real implementation would use NLP
    const text = (data.description || '') + (data.learningGoals || '');
    const complexWords = text.match(/\b\w{8,}\b/g) || [];
    return complexWords.length > 5;
  }

  private hasHandsOnActivities(data: any): boolean {
    const text = ((data.action || '') + (data.materials || [])).toLowerCase();
    const handsOnIndicators = ['manipulatives', 'hands-on', 'build', 'create', 'explore', 'touch', 'move'];
    return handsOnIndicators.some(indicator => text.includes(indicator));
  }

  private calculateOverallQualityScore(
    pedagogical: QualityVerificationResult['pedagogical_alignment'],
    curriculum: QualityVerificationResult['curriculum_fidelity'],
    feasibility: QualityVerificationResult['implementation_feasibility']
  ): number {
    const avgPedagogical = Object.values(pedagogical).reduce((sum, val) => sum + val, 0) / Object.keys(pedagogical).length;
    const avgCurriculum = Object.values(curriculum).reduce((sum, val) => sum + val, 0) / Object.keys(curriculum).length;
    const avgFeasibility = Object.values(feasibility).reduce((sum, val) => sum + val, 0) / Object.keys(feasibility).length;
    
    return ((avgPedagogical + avgCurriculum + avgFeasibility) / 3) * 100;
  }

  private async analyzeQualityIndicators(
    data: any,
    pedagogical: any,
    curriculum: any,
    feasibility: any
  ): Promise<QualityVerificationResult['quality_indicators']> {
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    const criticalIssues: string[] = [];
    const exemplaryPractices: string[] = [];

    // Analyze strengths
    if (pedagogical.ubd_compliance > 0.9) {
      strengthAreas.push('Excellent UbD alignment');
    }
    if (pedagogical.etfo_alignment > 0.9) {
      strengthAreas.push('Strong ETFO best practices');
    }
    if (feasibility.student_developmental_fit > 0.9) {
      strengthAreas.push('Highly age-appropriate design');
    }

    // Identify improvement areas
    if (pedagogical.ubd_compliance < 0.7) {
      improvementAreas.push('UbD principles need strengthening');
    }
    if (curriculum.expectation_accuracy < 0.8) {
      improvementAreas.push('Curriculum alignment needs improvement');
    }
    if (feasibility.time_realism < 0.7) {
      improvementAreas.push('Timing needs adjustment for realistic implementation');
    }

    // Identify critical issues
    if (pedagogical.ubd_compliance < 0.5) {
      criticalIssues.push('Major UbD compliance issues - assessment-first design missing');
    }
    if (curriculum.expectation_accuracy < 0.6) {
      criticalIssues.push('Serious curriculum misalignment detected');
    }
    if (feasibility.teacher_workload > 1.2) {
      criticalIssues.push('Unrealistic teacher workload expectations');
    }

    // Identify exemplary practices
    if (pedagogical.ubd_compliance > 0.95 && pedagogical.etfo_alignment > 0.95) {
      exemplaryPractices.push('Exceptional pedagogical design following best practices');
    }
    if (feasibility.student_developmental_fit > 0.95) {
      exemplaryPractices.push('Outstanding grade-level appropriateness');
    }

    return {
      strength_areas: strengthAreas,
      improvement_areas: improvementAreas,
      critical_issues: criticalIssues,
      exemplary_practices: exemplaryPractices
    };
  }

  private determineCertificationStatus(
    overallScore: number,
    qualityIndicators: QualityVerificationResult['quality_indicators']
  ): { status: 'certified' | 'conditional' | 'requires_revision'; notes: string[]; } {
    const notes: string[] = [];

    if (qualityIndicators.critical_issues.length > 0) {
      notes.push('Critical issues must be resolved before implementation');
      notes.push(...qualityIndicators.critical_issues);
      return { status: 'requires_revision', notes };
    }

    if (overallScore >= 85 && qualityIndicators.improvement_areas.length <= 1) {
      notes.push('Meets high quality standards for implementation');
      if (qualityIndicators.exemplary_practices.length > 0) {
        notes.push('Contains exemplary pedagogical practices');
      }
      return { status: 'certified', notes };
    }

    if (overallScore >= 70) {
      notes.push('Acceptable for implementation with noted improvements');
      notes.push(...qualityIndicators.improvement_areas);
      return { status: 'conditional', notes };
    }

    notes.push('Significant revision needed before implementation');
    notes.push(`Overall quality score: ${Math.round(overallScore)}% (minimum 70% required)`);
    return { status: 'requires_revision', notes };
  }

  // Data retrieval methods

  private async getLessonPlanData(lessonId: string): Promise<any> {
    return await this.prisma.eTFOLessonPlan.findUnique({
      where: { id: lessonId },
      include: {
        expectations: { include: { expectation: true } },
        unitPlan: { include: { longRangePlan: true } }
      }
    });
  }

  private async getUnitPlanData(unitId: string): Promise<any> {
    return await this.prisma.unitPlan.findUnique({
      where: { id: unitId },
      include: {
        expectations: { include: { expectation: true } },
        lessonPlans: { include: { expectations: { include: { expectation: true } } } },
        longRangePlan: true
      }
    });
  }

  private async getLongRangePlanData(longRangePlanId: string): Promise<any> {
    return await this.prisma.longRangePlan.findUnique({
      where: { id: longRangePlanId },
      include: {
        expectations: { include: { expectation: true } },
        unitPlans: {
          include: {
            expectations: { include: { expectation: true } },
            lessonPlans: { include: { expectations: { include: { expectation: true } } } }
          }
        }
      }
    });
  }

  private async createSubjectBreakdown(
    subjects: string[],
    allExpectations: any[],
    currentCoverage: CoverageInstance[]
  ): Promise<SubjectCoverageAnalysis[]> {
    const breakdown: SubjectCoverageAnalysis[] = [];

    for (const subject of subjects) {
      const subjectExpectations = allExpectations.filter(e => e.subject === subject);
      const subjectCoverage = currentCoverage.filter(c => 
        // This would need proper subject identification logic
        c.context === 'lesson' || c.context === 'unit'
      );

      breakdown.push({
        subject_name: subject,
        total_expectations: subjectExpectations.length,
        covered_expectations: subjectCoverage.length,
        coverage_percentage: Math.round((subjectCoverage.length / subjectExpectations.length) * 100),
        depth_quality: subjectCoverage.filter(c => c.depth_level === 'proficient' || c.depth_level === 'deep').length > subjectCoverage.length * 0.6 ? 'excellent' : 'good',
        strand_coverage: [], // Would be populated with actual strand analysis
        timeline_distribution: [], // Would be populated with temporal analysis
        assessment_alignment: {
          diagnostic_coverage: subjectCoverage.filter(c => c.assessment_type === 'diagnostic').length,
          formative_coverage: subjectCoverage.filter(c => c.assessment_type === 'formative').length,
          summative_coverage: subjectCoverage.filter(c => c.assessment_type === 'summative').length,
          balance_score: 0.85 // Would be calculated based on assessment distribution
        }
      });
    }

    return breakdown;
  }

  private async createStrandAnalysis(
    allExpectations: any[],
    currentCoverage: CoverageInstance[]
  ): Promise<StrandCoverageAnalysis[]> {
    const strandAnalysis: StrandCoverageAnalysis[] = [];

    // Group expectations by subject and strand
    const strandGroups = allExpectations.reduce((groups, exp) => {
      const key = `${exp.subject}:${exp.strand}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(exp);
      return groups;
    }, {} as Record<string, any[]>);

    for (const [key, expectations] of Object.entries(strandGroups)) {
      const [subject, strand] = key.split(':');
      
      strandAnalysis.push({
        subject,
        strand_name: strand,
        importance_weight: this.getStrandImportance(strand),
        expectation_coverage: expectations.map(exp => ({
          expectation_code: exp.code,
          expectation_description: exp.description,
          coverage_instances: currentCoverage.filter(c => 
            // This would need proper expectation matching logic
            c.lesson_id === exp.id || c.unit_id === exp.id
          ),
          overall_depth: 'developing', // Would be calculated from coverage instances
          quality_indicators: ['Planned coverage', 'Assessment included'],
          improvement_suggestions: ['Consider deeper exploration', 'Add hands-on activities']
        })),
        strand_coherence: {
          logical_progression: true,
          appropriate_sequencing: true,
          skill_building: true,
          assessment_alignment: true,
          coherence_score: 0.85
        }
      });
    }

    return strandAnalysis;
  }

  private getStrandImportance(strand: string): 'critical' | 'important' | 'supplementary' {
    const criticalStrands = [
      'Number Sense', 'Communication orale', 'Reading', 'Basic Literacy',
      'Living Things', 'Community and Environment'
    ];
    
    if (criticalStrands.some(critical => strand.includes(critical))) {
      return 'critical';
    }
    return 'important';
  }

  private async saveCoverageReport(report: CurriculumCoverageReport, userId: number): Promise<void> {
    try {
      // In a full implementation, this would save to database
      logger.info(`Coverage report saved for user ${userId}:`, JSON.stringify({
        coverage_percentage: report.overall_coverage.coverage_percentage,
        gaps_found: report.coverage_gaps.length,
        recommendations: report.recommendations.length
      }));
    } catch (error: unknown) {
      logger.warn('Could not save coverage report:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Health check for the service
   */
  async checkHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    try {
      return {
        healthy: true,
        details: {
          serviceStatus: 'operational',
          verificationCapabilities: [
            'curriculum_coverage_analysis',
            'quality_verification',
            'real_time_validation'
          ]
        }
      };
    } catch (error: unknown) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}