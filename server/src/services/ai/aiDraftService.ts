import { BaseService } from '../base/BaseService';

interface LongRangePlanDraftRequest {
  title: string;
  subject: string;
  grade: number;
  academicYear: string;
  term?: string;
  themes?: string[];
  expectationIds?: string[];
}

interface DraftResult {
  title: string;
  description: string;
  goals: string;
  overarchingQuestions: string;
  assessmentOverview: string;
  resourceNeeds: string;
  professionalGoals: string;
}

export class AIDraftService extends BaseService {
  private static instance: AIDraftService;

  private constructor() {
    super('AIDraftService');
  }

  public static getInstance(): AIDraftService {
    if (!AIDraftService.instance) {
      AIDraftService.instance = new AIDraftService();
    }
    return AIDraftService.instance;
  }

  async generateLongRangePlanDraft(request: LongRangePlanDraftRequest): Promise<DraftResult> {
    this.logger.info('Generating long-range plan draft', { request });

    // Generate educational content for PEI teachers using ETFO resources
    const draft: DraftResult = {
      title: request.title || `${request.subject} Long-Range Plan - Grade ${request.grade}`,
      description: `This long-range plan outlines learning goals and key themes for ${request.subject} in Grade ${request.grade} during the ${request.academicYear} academic year. The plan aligns with Prince Edward Island Department of Education curriculum expectations while incorporating ETFO best practices for effective teaching and learning.`,
      goals: this.generateGoals(request),
      overarchingQuestions: this.generateOverarchingQuestions(request),
      assessmentOverview: this.generateAssessmentOverview(request),
      resourceNeeds: this.generateResourceNeeds(request),
      professionalGoals: this.generateProfessionalGoals(request),
    };

    return draft;
  }

  async generateUnitPlanDraft(request: unknown): Promise<unknown> {
    this.logger.info('Generating unit plan draft', { request });
    
    return {
      title: request.title || 'Unit Plan',
      description: 'Generated unit plan description',
      bigIdeas: ['Key concepts and understanding'],
      essentialQuestions: ['What should students understand?'],
    };
  }

  async generateLessonPlanDraft(request: unknown): Promise<unknown> {
    this.logger.info('Generating lesson plan draft', { request });
    
    return {
      title: request.title || 'Lesson Plan',
      objectives: ['Students will be able to...'],
      activities: ['Opening activity', 'Main activity', 'Closing activity'],
      materials: ['Required materials'],
      assessment: ['Assessment strategies'],
    };
  }

  async generateDaybookDraft(request: unknown): Promise<unknown> {
    this.logger.info('Generating daybook draft', { request });
    
    return {
      date: request.date || new Date().toISOString().split('T')[0],
      activities: ['Daily activities'],
      reflections: ['Teaching reflections'],
      nextSteps: ['Next steps for learning'],
    };
  }

  async generatePlanSuggestions(planType: string, existingContent: unknown): Promise<string[]> {
    this.logger.info('Generating plan suggestions', { planType, existingContent });

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

    return suggestions[planType] || [
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

    if (request.themes?.length) {
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

  private generateAssessmentOverview(request: LongRangePlanDraftRequest): string {
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

  private generateResourceNeeds(request: LongRangePlanDraftRequest): string {
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

  private generateProfessionalGoals(request: LongRangePlanDraftRequest): string {
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
}

// Export singleton instance
export const aiDraftService = AIDraftService.getInstance();

// Export individual functions for backward compatibility
export const generateLongRangePlanDraft = aiDraftService.generateLongRangePlanDraft.bind(aiDraftService);
export const generateUnitPlanDraft = aiDraftService.generateUnitPlanDraft.bind(aiDraftService);
export const generateLessonPlanDraft = aiDraftService.generateLessonPlanDraft.bind(aiDraftService);
export const generateDaybookDraft = aiDraftService.generateDaybookDraft.bind(aiDraftService);
export const generatePlanSuggestions = aiDraftService.generatePlanSuggestions.bind(aiDraftService);