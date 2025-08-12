import type { AIServiceRequestData } from '../../types/routes';
import { BaseService } from '../base/BaseService';
import { LongRangePedagogicalPlanningService, type YearlyPlanRequest } from '../LongRangePedagogicalPlanningService';
import { prisma } from '../../prisma';

interface LongRangePlanDraftRequest {
  title: string;
  subject: string;
  grade: number;
  academicYear: string;
  term?: string;
  themes?: string[];
  expectationIds?: string[];
  // Enhanced fields for pedagogical optimization
  userId?: number;
  teacherExperienceLevel?: 'beginning' | 'experienced' | 'expert';
  frenchImmersionCertified?: boolean;
  studentProfile?: {
    totalStudents?: number;
    englishLanguageLearners?: number;
    specialEducation?: number;
    giftedStudents?: number;
    culturalBackgrounds?: string[];
  };
  availableResources?: string[];
  usePedagogicalOptimization?: boolean; // Flag to use new optimization vs legacy
}

interface DraftResult {
  title: string;
  description: string;
  goals: string;
  overarchingQuestions: string;
  assessmentOverview: string;
  resourceNeeds: string;
  professionalGoals: string;
  // Enhanced optimization data
  optimizationScore?: number;
  pedagogicalCertification?: string;
  pedagogicalData?: any; // Full optimization data for saving to database
  isOptimized?: boolean;
}

export class AIDraftService extends BaseService {
  private static instance: AIDraftService | undefined;
  private pedagogicalPlanning: LongRangePedagogicalPlanningService;

  private constructor() {
    super('AIDraftService');
    this.pedagogicalPlanning = new LongRangePedagogicalPlanningService(prisma);
  }

  public static getInstance(): AIDraftService {
    if (!AIDraftService.instance) {
      AIDraftService.instance = new AIDraftService();
    }
    return AIDraftService.instance;
  }

  async generateLongRangePlanDraft(request: LongRangePlanDraftRequest): Promise<DraftResult> {
    this.logger.info('Generating long-range plan draft', { 
      subject: request.subject, 
      grade: request.grade,
      optimized: request.usePedagogicalOptimization 
    });

    // Use pedagogical optimization if requested and user context is available
    if (request.usePedagogicalOptimization && request.userId && request.expectationIds?.length) {
      try {
        return await this.generateOptimizedLongRangePlan(request);
      } catch (error) {
        this.logger.warn('Failed to generate optimized plan, falling back to template-based:', error);
        // Fall back to template-based if optimization fails
      }
    }

    // Legacy template-based generation for backward compatibility
    const draft: DraftResult = {
      title: request.title || `${request.subject} Long-Range Plan - Grade ${request.grade}`,
      description: `This long-range plan outlines learning goals and key themes for ${request.subject} in Grade ${request.grade} during the ${request.academicYear} academic year. The plan aligns with Prince Edward Island Department of Education curriculum expectations while incorporating ETFO best practices for effective teaching and learning.`,
      goals: this.generateGoals(request),
      overarchingQuestions: this.generateOverarchingQuestions(request),
      assessmentOverview: this.generateAssessmentOverview(request),
      resourceNeeds: this.generateResourceNeeds(request),
      professionalGoals: this.generateProfessionalGoals(request),
      isOptimized: false
    };

    return draft;
  }

  /**
   * Generate pedagogically optimized long range plan using research-based frameworks
   */
  private async generateOptimizedLongRangePlan(request: LongRangePlanDraftRequest): Promise<DraftResult> {
    this.logger.info('🎯 Generating pedagogically optimized long range plan');

    // Convert request to YearlyPlanRequest format
    const optimizationRequest: YearlyPlanRequest = {
      teacher: {
        user_id: request.userId!,
        grade: request.grade,
        academic_year: request.academicYear,
        experience_level: request.teacherExperienceLevel || 'experienced',
        french_immersion_certified: request.frenchImmersionCertified || (request.subject === 'Français langue première')
      },
      plan_specs: {
        subject: request.subject,
        curriculum_expectations: request.expectationIds!,
        themes: request.themes
      },
      student_profile: {
        total_students: request.studentProfile?.totalStudents || 20,
        demographic_overview: {
          english_language_learners: request.studentProfile?.englishLanguageLearners || 3,
          special_education: request.studentProfile?.specialEducation || 2,
          gifted_students: request.studentProfile?.giftedStudents || 1,
          cultural_backgrounds: request.studentProfile?.culturalBackgrounds || []
        },
        predicted_needs: {
          readiness_predictions: { 'below_grade': 2, 'at_grade': 15, 'above_grade': 3 },
          interest_themes: request.themes || [],
          learning_preferences: ['visual', 'kinesthetic', 'collaborative']
        }
      },
      constraints: {
        school_calendar: {
          term_dates: {
            term1: { start: new Date(`${request.academicYear.split('-')[0]}-09-01`), end: new Date(`${request.academicYear.split('-')[1]}-01-31`) },
            term2: { start: new Date(`${request.academicYear.split('-')[1]}-02-01`), end: new Date(`${request.academicYear.split('-')[1]}-06-30`) }
          },
          holidays: [],
          special_events: []
        },
        available_resources: request.availableResources || [],
        assessment_requirements: []
      },
      optimization_priorities: {
        engagement_focus: 'high',
        differentiation_depth: 'comprehensive',
        cross_curricular_integration: 'moderate',
        french_immersion_emphasis: request.frenchImmersionCertified ? 'intensive' : 'standard',
        data_driven_adjustments: 'predictive'
      }
    };

    // Generate perfect yearly plan using pedagogical optimization
    const perfectPlan = await this.pedagogicalPlanning.generatePerfectYearlyPlan(optimizationRequest);

    // Convert back to DraftResult format with optimization enhancements
    const optimizedDraft: DraftResult = {
      title: perfectPlan.plan_metadata.title,
      description: this.generateOptimizedDescription(perfectPlan, request),
      goals: this.convertOptimizedGoals(perfectPlan),
      overarchingQuestions: perfectPlan.desired_results.yearly_transfer_goals.essential_questions.join('\n\n'),
      assessmentOverview: this.convertOptimizedAssessment(perfectPlan),
      resourceNeeds: this.convertOptimizedResources(perfectPlan),
      professionalGoals: this.convertOptimizedProfessionalGoals(perfectPlan),
      // Optimization metadata
      optimizationScore: perfectPlan.plan_metadata.optimization_score,
      pedagogicalCertification: perfectPlan.plan_metadata.pedagogical_certification,
      pedagogicalData: perfectPlan, // Full optimization data for database storage
      isOptimized: true
    };

    this.logger.info(`✨ Optimized plan generated! Score: ${perfectPlan.plan_metadata.optimization_score}% (${perfectPlan.plan_metadata.pedagogical_certification})`);

    return optimizedDraft;
  }

  generateUnitPlanDraft(request: AIServiceRequestData): unknown {
    this.logger.info('Generating unit plan draft');
    
    return {
      title: request.title ?? 'Unit Plan',
      description: 'Generated unit plan description',
      bigIdeas: ['Key concepts and understanding'],
      essentialQuestions: ['What should students understand?'],
    };
  }

  generateLessonPlanDraft(request: AIServiceRequestData): unknown {
    this.logger.info('Generating lesson plan draft');
    
    return {
      title: request.title ?? 'Lesson Plan',
      objectives: ['Students will be able to...'],
      activities: ['Opening activity', 'Main activity', 'Closing activity'],
      materials: ['Required materials'],
      assessment: ['Assessment strategies'],
    };
  }

  generateDaybookDraft(request: AIServiceRequestData): unknown {
    this.logger.info('Generating daybook draft');
    
    return {
      date: request.date ?? new Date().toISOString().split('T')[0],
      activities: ['Daily activities'],
      reflections: ['Teaching reflections'],
      nextSteps: ['Next steps for learning'],
    };
  }

  generatePlanSuggestions(planType: string, _existingContent: unknown): string[] {
    this.logger.info('Generating plan suggestions');

    const suggestions: Record<string, string[]> = {
      'long-range': [
        'Consider incorporating cross-curricular connections',
        'Add specific assessment strategies for each unit',
        'Include technology integration opportunities',
        'Plan for differentiated instruction approaches',
        'Connect to Prince Edward Island curriculum expectations',
      ],
      'unit': [
        'Develop clear success criteria for students',
        'Plan for formative assessment checkpoints',
        'Include hands-on learning activities',
        'Consider real-world applications',
        'Plan for student choice and voice',
      ],
      'lesson': [
        'Start with a clear learning intention',
        'Include a variety of teaching strategies',
        'Plan for student engagement and participation',
        'Build in reflection and consolidation time',
        'Consider different learning styles',
      ],
    };

    return suggestions[planType] ?? [
      'Focus on student-centered learning',
      'Align with curriculum expectations',
      'Include assessment for learning strategies',
    ];
  }

  private generateGoals(request: LongRangePlanDraftRequest): string {
    const baseGoals = [
      `Students will develop foundational knowledge and skills in ${request.subject}`,
      'Students will demonstrate critical thinking and problem-solving abilities',
      'Students will make connections between learning and real-world applications',
      'Students will develop confidence as learners and communicators',
    ];

    if (request.themes?.length !== undefined && request.themes.length > 0) {
      baseGoals.push(`Students will explore key themes including: ${request.themes.join(', ')}`);
    }

    return baseGoals.join('\n\n');
  }

  private generateOverarchingQuestions(request: LongRangePlanDraftRequest): string {
    const questions = [
      `How does ${request.subject} help us understand our world?`,
      'What connections can we make between past, present, and future learning?',
      'How can we apply our learning to solve real problems?',
      'What questions will guide our inquiry and discovery?',
    ];

    return questions.join('\n\n');
  }

  private generateAssessmentOverview(_request: LongRangePlanDraftRequest): string {
    return [
      'Assessment will be ongoing and varied, including:',
      '• Formative assessment through observation, questioning, and student self-reflection',
      '• Performance-based tasks that demonstrate understanding and application',
      '• Portfolio collections showing growth over time',
      '• Peer and self-assessment opportunities',
      '• Summative assessments aligned with curriculum expectations',
      '',
      'Assessment will focus on both process and product, providing feedback to support student learning and inform instruction.',
    ].join('\n');
  }

  private generateResourceNeeds(_request: LongRangePlanDraftRequest): string {
    const resources = [
      'Prince Edward Island Department of Education curriculum documents and resources',
      'ETFO lesson planning templates and best practice guides',
      'Digital tools and educational technology platforms',
      'Manipulatives and hands-on learning materials',
      'Community connections and guest speakers',
      'Library and online research resources',
    ];

    return resources.join('\n• ');
  }

  private generateProfessionalGoals(_request: LongRangePlanDraftRequest): string {
    return [
      'Professional goals for this long-range plan include:',
      '',
      '• Implementing effective assessment for learning strategies',
      '• Integrating technology to enhance student engagement',
      '• Building stronger connections with families and community',
      '• Developing culturally responsive teaching practices',
      '• Supporting student well-being and mental health',
      '• Collaborating with colleagues to share best practices',
    ].join('\n');
  }

  // Optimization conversion helpers
  private generateOptimizedDescription(perfectPlan: any, request: LongRangePlanDraftRequest): string {
    return `This pedagogically optimized long-range plan (Score: ${perfectPlan.plan_metadata.optimization_score}%, ${perfectPlan.plan_metadata.pedagogical_certification}) provides a research-based framework for ${request.subject} in Grade ${request.grade}. 

The plan integrates Understanding by Design (UbD) backward planning, ETFO best practices, WHERETO engagement framework, and comprehensive differentiation strategies. It includes year-long essential questions, authentic performance tasks, and data-driven instructional adjustments optimized for ${request.academicYear}.

Key pedagogical enhancements:
• ${perfectPlan.desired_results.yearly_transfer_goals.essential_questions.length} essential questions driving inquiry
• ${perfectPlan.integration_framework.thematic_connections.length} cross-curricular thematic connections  
• Comprehensive differentiation for ${perfectPlan.yearly_differentiation.readiness_accommodations.progression_pathways.length} learning pathways
• Year-long family engagement and cultural responsiveness plan
• Predictive analytics for proactive student support`;
  }

  private convertOptimizedGoals(perfectPlan: any): string {
    const transferGoals = perfectPlan.desired_results.yearly_transfer_goals;
    
    return [
      'Year-Long Learning Goals (Optimized):',
      '',
      'Enduring Understandings:',
      ...transferGoals.enduring_understandings.map((understanding: string) => `• ${understanding}`),
      '',
      'Transferable Skills:',
      ...transferGoals.transferable_skills.map((skill: string) => `• ${skill}`),
      '',
      'Learning Progressions:',
      `• September Foundation: ${perfectPlan.desired_results.learning_progressions.september_expectations.join(', ')}`,
      `• Midyear Benchmarks: ${perfectPlan.desired_results.learning_progressions.midyear_benchmarks.join(', ')}`,
      `• June Mastery: ${perfectPlan.desired_results.learning_progressions.june_mastery_targets.join(', ')}`
    ].join('\n');
  }

  private convertOptimizedAssessment(perfectPlan: any): string {
    const assessment = perfectPlan.assessment_evidence;
    
    return [
      'Comprehensive Assessment Framework (Research-Based):',
      '',
      'Diagnostic Assessments:',
      `• September baseline assessments focusing on ${assessment.diagnostic_assessments.september_baseline.join(', ')}`,
      `• ${assessment.diagnostic_assessments.ongoing_checkpoints.length} monthly checkpoints for continuous data collection`,
      '',
      'Formative Assessment Strategies:',
      '• Daily observational focuses aligned to learning progressions',
      '• Student self-reflection and peer assessment systems',
      '• Real-time feedback loops for instructional adjustments',
      '',
      'Summative Milestones:',
      `• ${assessment.summative_milestones.term_culminations.length} term culmination assessments`,
      '• Portfolio collections demonstrating growth over time',
      '• Authentic family sharing and celebration events',
      '',
      'All assessments designed using backward design principles, ensuring alignment with learning goals and authentic demonstration of understanding.'
    ].join('\n');
  }

  private convertOptimizedResources(perfectPlan: any): string {
    const resources = perfectPlan.implementation_package.resource_organization;
    
    return [
      'Comprehensive Resource Organization:',
      '',
      'Monthly Materials Timeline:',
      '• September-June resource planning with seasonal considerations',
      '• Technology integration opportunities aligned to learning goals',
      '• Community partnership resources and guest speakers',
      '',
      'Implementation Support:',
      '• Month-by-month preparation guides for teachers',
      '• Family engagement materials and communication templates', 
      '• Differentiation materials for multiple learning pathways',
      '',
      'Professional Resources:',
      '• ETFO planning templates and best practice guides',
      '• UbD planning frameworks and assessment tools',
      '• Research-based differentiation and engagement strategies',
      '• Prince Edward Island curriculum resources and expectations'
    ].join('\n');
  }

  private convertOptimizedProfessionalGoals(perfectPlan: any): string {
    const profDev = perfectPlan.implementation_package.professional_development;
    
    return [
      'Research-Based Professional Development Goals:',
      '',
      'Pedagogical Excellence:',
      '• Master Understanding by Design (UbD) backward planning principles',
      '• Implement WHERETO engagement framework across all lessons',
      '• Develop expertise in multi-tiered differentiation strategies',
      '• Apply data-driven instruction for responsive teaching',
      '',
      'Cultural Responsiveness & Inclusion:',
      '• Build authentic family and community partnerships',
      '• Integrate diverse cultural perspectives and celebrations',
      '• Support English language learners with evidence-based strategies',
      '• Create inclusive learning environments for all students',
      '',
      'Assessment & Feedback Mastery:',
      '• Design authentic performance tasks and rubrics',
      '• Implement effective formative assessment strategies',
      '• Use student self-reflection and peer assessment systems',
      '• Provide timely, specific feedback to accelerate learning',
      '',
      'French Immersion Excellence:',
      '• Optimize language development through content integration',
      '• Balance oral communication and literacy skill development',
      '• Create authentic French communication opportunities',
      '• Support students transitioning between languages'
    ].join('\n');
  }
}

// Export singleton instance
export const aiDraftService = AIDraftService.getInstance();

// Export individual functions for backward compatibility  
export const generateLongRangePlanDraft = (request: LongRangePlanDraftRequest) => aiDraftService.generateLongRangePlanDraft(request);
export const generateUnitPlanDraft = aiDraftService.generateUnitPlanDraft.bind(aiDraftService);
export const generateLessonPlanDraft = aiDraftService.generateLessonPlanDraft.bind(aiDraftService);
export const generateDaybookDraft = aiDraftService.generateDaybookDraft.bind(aiDraftService);
export const generatePlanSuggestions = aiDraftService.generatePlanSuggestions.bind(aiDraftService);