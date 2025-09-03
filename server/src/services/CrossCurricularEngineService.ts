import type { PrismaClient } from '@prisma/client';

import { logger } from '../logger';
import { BaseService } from './base/BaseService';

export interface CrossCurricularConnection {
  connection_id: string;
  primary_subject: string;
  connected_subjects: string[];
  connection_type: 'thematic' | 'skill_based' | 'concept_based' | 'assessment_based' | 'real_world_application';
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
  learning_objectives: string[];
  essential_questions: string[];
  shared_vocabulary: string[];
  integrated_activities: IntegratedActivity[];
  assessment_opportunities: CrossCurricularAssessment[];
  real_world_connections: RealWorldConnection[];
}

export interface IntegratedActivity {
  activity_name: string;
  subjects_integrated: string[];
  description: string;
  duration_minutes: number;
  materials_needed: string[];
  learning_outcomes: Record<string, string[]>; // Subject -> outcomes
  differentiation_strategies: string[];
  assessment_methods: string[];
  french_language_supports: string[];
}

export interface CrossCurricularAssessment {
  assessment_name: string;
  subjects_assessed: string[];
  assessment_type: 'performance_task' | 'portfolio' | 'observation' | 'project';
  description: string;
  success_criteria: Record<string, string[]>; // Subject -> criteria
  rubric_dimensions: string[];
  differentiation_options: string[];
}

export interface RealWorldConnection {
  connection_name: string;
  description: string;
  community_links: string[];
  family_engagement: string[];
  authentic_applications: string[];
  career_connections: string[];
  cultural_connections: string[];
}

export interface ThematicUnit {
  unit_id: string;
  theme_name: string;
  theme_name_fr: string;
  duration_weeks: number;
  grade_level: number;
  big_idea: string;
  big_idea_fr: string;
  essential_questions: string[];
  essential_questions_fr: string[];
  
  subject_integration: {
    subject_name: string;
    curriculum_expectations: string[];
    time_allocation_percentage: number;
    key_concepts: string[];
    vocabulary: string[];
    assessment_focus: string[];
  }[];
  
  culminating_activities: CulminatingActivity[];
  cross_curricular_connections: CrossCurricularConnection[];
  resource_requirements: string[];
  family_engagement_opportunities: string[];
  community_connections: string[];
}

export interface CulminatingActivity {
  activity_name: string;
  description: string;
  subjects_showcased: string[];
  audience: string;
  format: string;
  duration: string;
  preparation_requirements: string[];
  success_indicators: string[];
}

export interface ConnectionOpportunity {
  opportunity_type: 'natural_fit' | 'skill_transfer' | 'vocabulary_overlap' | 'thematic_link' | 'real_world_application';
  subjects_involved: string[];
  connection_strength: number; // 0-1 scale
  implementation_complexity: 'simple' | 'moderate' | 'complex';
  description: string;
  rationale: string;
  suggested_activities: string[];
  potential_challenges: string[];
  success_indicators: string[];
}

export class CrossCurricularEngineService extends BaseService {
  // Subject connection matrix - defines natural connections between subjects
  private readonly connectionMatrix = {
    'Français (Immersion)': {
      'Mathématiques': { strength: 'strong', types: ['vocabulary', 'communication', 'problem_solving'] },
      'Sciences et technologie': { strength: 'strong', types: ['vocabulary', 'observation', 'communication'] },
      'Études sociales': { strength: 'strong', types: ['communication', 'cultural', 'storytelling'] },
      'Arts': { strength: 'strong', types: ['creativity', 'expression', 'cultural'] },
      'English Language Arts': { strength: 'moderate', types: ['language_transfer', 'literacy_skills'] }
    },
    'Mathématiques': {
      'Sciences et technologie': { strength: 'strong', types: ['measurement', 'data', 'patterns'] },
      'Arts': { strength: 'moderate', types: ['patterns', 'symmetry', 'design'] },
      'Études sociales': { strength: 'moderate', types: ['data', 'graphs', 'time'] },
      'English Language Arts': { strength: 'moderate', types: ['communication', 'problem_solving'] }
    },
    'Sciences et technologie': {
      'Arts': { strength: 'moderate', types: ['observation', 'creativity', 'design'] },
      'Études sociales': { strength: 'moderate', types: ['environment', 'community', 'sustainability'] }
    },
    'Études sociales': {
      'Arts': { strength: 'strong', types: ['cultural', 'expression', 'identity'] }
    }
  };

  constructor(_prisma: PrismaClient) {
    super('CrossCurricularEngineService');
  }

  /**
   * Identify cross-curricular connection opportunities for a given set of learning objectives
   */
  async identifyConnectionOpportunities(parameters: {
    primary_subject: string;
    learning_objectives: string[];
    curriculum_expectations: string[];
    grade: number;
    time_frame: 'single_lesson' | 'multi_lesson' | 'unit' | 'term';
    available_subjects: string[];
    student_interests?: string[];
    cultural_contexts?: string[];
  }): Promise<ConnectionOpportunity[]> {
    try {
      logger.info(`Identifying cross-curricular connections for ${parameters.primary_subject}`);

      const opportunities: ConnectionOpportunity[] = [];

      // 1. Analyze natural subject connections
      const naturalConnections = this.analyzeNaturalConnections(
        parameters.primary_subject,
        parameters.available_subjects,
        parameters.learning_objectives
      );

      // 2. Identify skill transfer opportunities
      const skillTransfers = this.identifySkillTransferOpportunities(
        parameters.primary_subject,
        parameters.learning_objectives,
        parameters.grade
      );

      // 3. Find vocabulary and concept overlaps
      const vocabularyOverlaps = this.findVocabularyOverlaps(
        parameters.primary_subject,
        parameters.curriculum_expectations,
        parameters.available_subjects
      );

      // 4. Discover thematic connections
      const thematicLinks = await this.discoverThematicLinks(
        parameters.primary_subject,
        parameters.curriculum_expectations,
        parameters.student_interests || []
      );

      // 5. Identify real-world applications that span subjects
      const realWorldApplications = this.identifyRealWorldApplications(
        parameters.primary_subject,
        parameters.learning_objectives,
        parameters.cultural_contexts || []
      );

      opportunities.push(
        ...naturalConnections,
        ...skillTransfers,
        ...vocabularyOverlaps,
        ...thematicLinks,
        ...realWorldApplications
      );

      // Sort by connection strength and implementation feasibility
      return this.rankConnectionOpportunities(opportunities, parameters.time_frame);
    } catch (error: unknown) {
      logger.error('Error identifying cross-curricular connections:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Generate a comprehensive thematic unit plan with cross-curricular integration
   */
  async generateThematicUnit(parameters: {
    theme_name: string;
    theme_name_fr: string;
    primary_subjects: string[];
    grade: number;
    duration_weeks: number;
    curriculum_expectations: Record<string, string[]>; // Subject -> expectations
    student_interests: string[];
    cultural_contexts: string[];
  }): Promise<ThematicUnit> {
    try {
      logger.info(`Generating thematic unit: ${parameters.theme_name}`);

      // Generate big ideas and essential questions for the theme
      const bigIdea = this.generateThematicBigIdea(parameters.theme_name, parameters.primary_subjects);
      const bigIdeaFr = this.generateThematicBigIdea(parameters.theme_name_fr, parameters.primary_subjects, true);
      
      const essentialQuestions = this.generateThematicEssentialQuestions(
        parameters.theme_name,
        parameters.primary_subjects,
        parameters.grade
      );
      
      const essentialQuestionsFr = this.generateThematicEssentialQuestions(
        parameters.theme_name_fr,
        parameters.primary_subjects,
        parameters.grade,
        true
      );

      // Plan subject integration with time allocation
      const subjectIntegration = this.planSubjectIntegration(
        parameters.primary_subjects,
        parameters.curriculum_expectations,
        parameters.duration_weeks
      );

      // Design culminating activities
      const culminatingActivities = this.designCulminatingActivities(
        parameters.theme_name,
        parameters.primary_subjects,
        parameters.grade
      );

      // Create cross-curricular connections
      const crossCurricularConnections = await this.createCrossCurricularConnections(
        parameters.primary_subjects,
        parameters.curriculum_expectations,
        parameters.theme_name
      );

      // Plan family and community engagement
      const familyEngagement = this.planFamilyEngagement(
        parameters.theme_name,
        parameters.cultural_contexts
      );

      const communityConnections = this.planCommunityConnections(
        parameters.theme_name,
        parameters.primary_subjects
      );

      // Compile resource requirements
      const resourceRequirements = this.compileResourceRequirements(
        subjectIntegration,
        culminatingActivities,
        crossCurricularConnections
      );

      const thematicUnit: ThematicUnit = {
        unit_id: `thematic_${Date.now()}`,
        theme_name: parameters.theme_name,
        theme_name_fr: parameters.theme_name_fr,
        duration_weeks: parameters.duration_weeks,
        grade_level: parameters.grade,
        big_idea: bigIdea,
        big_idea_fr: bigIdeaFr,
        essential_questions: essentialQuestions,
        essential_questions_fr: essentialQuestionsFr,
        subject_integration: subjectIntegration,
        culminating_activities: culminatingActivities,
        cross_curricular_connections: crossCurricularConnections,
        resource_requirements: resourceRequirements,
        family_engagement_opportunities: familyEngagement,
        community_connections: communityConnections
      };

      return thematicUnit;
    } catch (error: unknown) {
      logger.error('Error generating thematic unit:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Create integrated activities that span multiple subjects
   */
  async createIntegratedActivity(parameters: {
    activity_theme: string;
    subjects_to_integrate: string[];
    learning_objectives: Record<string, string[]>;
    grade: number;
    duration_minutes: number;
    available_resources: string[];
    french_immersion_focus: boolean;
  }): Promise<IntegratedActivity> {
    try {
      const activityName = this.generateActivityName(parameters.activity_theme, parameters.subjects_to_integrate);
      
      const description = this.createActivityDescription(
        parameters.activity_theme,
        parameters.subjects_to_integrate,
        parameters.grade
      );

      const materialsNeeded = this.selectMaterialsForIntegration(
        parameters.available_resources,
        parameters.subjects_to_integrate,
        parameters.activity_theme
      );

      const differentiationStrategies = this.createIntegratedDifferentiation(
        parameters.subjects_to_integrate,
        parameters.grade
      );

      const assessmentMethods = this.createIntegratedAssessment(
        parameters.subjects_to_integrate,
        parameters.learning_objectives
      );

      const frenchLanguageSupports = this.createFrenchLanguageSupports(
        parameters.subjects_to_integrate,
        parameters.french_immersion_focus
      );

      return {
        activity_name: activityName,
        subjects_integrated: parameters.subjects_to_integrate,
        description: description,
        duration_minutes: parameters.duration_minutes,
        materials_needed: materialsNeeded,
        learning_outcomes: parameters.learning_objectives,
        differentiation_strategies: differentiationStrategies,
        assessment_methods: assessmentMethods,
        french_language_supports: frenchLanguageSupports
      };
    } catch (error: unknown) {
      logger.error('Error creating integrated activity:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Implementation methods

  private analyzeNaturalConnections(
    primarySubject: string,
    availableSubjects: string[],
    _objectives: string[]
  ): ConnectionOpportunity[] {
    const connections: ConnectionOpportunity[] = [];
    const subjectConnections = this.connectionMatrix[primarySubject as keyof typeof this.connectionMatrix];

    if (!subjectConnections) return connections;

    for (const subject of availableSubjects) {
      if (subject === primarySubject) continue;

      const connection = subjectConnections[subject as keyof typeof subjectConnections];
      if (connection) {
        connections.push({
          opportunity_type: 'natural_fit',
          subjects_involved: [primarySubject, subject],
          connection_strength: connection.strength === 'strong' ? 0.9 : 0.6,
          implementation_complexity: 'simple',
          description: `Natural connection between ${primarySubject} and ${subject}`,
          rationale: `These subjects share common ${connection.types.join(', ')} elements`,
          suggested_activities: this.generateConnectionActivities(primarySubject, subject, connection.types),
          potential_challenges: ['Time management', 'Curriculum coverage balance'],
          success_indicators: ['Students make connections between subjects', 'Learning is more meaningful']
        });
      }
    }

    return connections;
  }

  private identifySkillTransferOpportunities(
    primarySubject: string,
    _objectives: string[],
    grade: number
  ): ConnectionOpportunity[] {
    const transferableSkills = this.getTransferableSkills(primarySubject, grade);
    const opportunities: ConnectionOpportunity[] = [];

    for (const skill of transferableSkills) {
      const applicableSubjects = this.findSubjectsForSkill(skill, grade);
      
      if (applicableSubjects.length > 1) {
        opportunities.push({
          opportunity_type: 'skill_transfer',
          subjects_involved: applicableSubjects,
          connection_strength: 0.8,
          implementation_complexity: 'moderate',
          description: `Transfer ${skill.name} skill across subjects`,
          rationale: skill.rationale,
          suggested_activities: skill.activities,
          potential_challenges: ['Students may not recognize skill transfer', 'Need explicit connections'],
          success_indicators: ['Students apply skill in new contexts', 'Skill mastery improves across subjects']
        });
      }
    }

    return opportunities;
  }

  private findVocabularyOverlaps(
    primarySubject: string,
    expectations: string[],
    availableSubjects: string[]
  ): ConnectionOpportunity[] {
    const vocabularyConnections: ConnectionOpportunity[] = [];
    
    // Extract vocabulary from curriculum expectations
    const primaryVocabulary = this.extractVocabularyFromExpectations(expectations);
    
    for (const subject of availableSubjects) {
      if (subject === primarySubject) continue;
      
      const subjectVocabulary = this.getSubjectVocabulary(subject);
      const overlap = this.findVocabularyIntersection(primaryVocabulary, subjectVocabulary);
      
      if (overlap.length > 2) {
        vocabularyConnections.push({
          opportunity_type: 'vocabulary_overlap',
          subjects_involved: [primarySubject, subject],
          connection_strength: Math.min(overlap.length / 10, 1),
          implementation_complexity: 'simple',
          description: `Shared vocabulary between ${primarySubject} and ${subject}`,
          rationale: `${overlap.length} vocabulary words are common to both subjects`,
          suggested_activities: [
            `Create vocabulary connections chart`,
            `Use shared words in both subjects`,
            `Create bilingual vocabulary cards`
          ],
          potential_challenges: ['Different contexts for same words', 'Language complexity differences'],
          success_indicators: ['Students recognize word connections', 'Vocabulary retention improves']
        });
      }
    }

    return vocabularyConnections;
  }

  private async discoverThematicLinks(
    _primarySubject: string,
    expectations: string[],
    interests: string[]
  ): Promise<ConnectionOpportunity[]> {
    const thematicConnections: ConnectionOpportunity[] = [];
    
    // Common Grade 1 themes that naturally integrate subjects
    const commonThemes = [
      'Our Community',
      'Growing and Changing',
      'Seasons and Weather',
      'Families Around the World',
      'Animals and Their Homes',
      'Transportation',
      'Food and Nutrition',
      'Friendship and Cooperation'
    ];

    for (const theme of commonThemes) {
      const applicableSubjects = this.findSubjectsForTheme(theme, expectations);
      
      if (applicableSubjects.length >= 2) {
        const interestAlignment = interests.some(interest => 
          theme.toLowerCase().includes(interest.toLowerCase())
        );
        
        thematicConnections.push({
          opportunity_type: 'thematic_link',
          subjects_involved: applicableSubjects,
          connection_strength: interestAlignment ? 0.9 : 0.7,
          implementation_complexity: 'moderate',
          description: `Thematic integration around "${theme}"`,
          rationale: `This theme naturally connects multiple curriculum areas`,
          suggested_activities: this.generateThematicActivities(theme, applicableSubjects),
          potential_challenges: ['Time coordination', 'Assessment integration'],
          success_indicators: ['Students see bigger picture', 'Learning feels more connected']
        });
      }
    }

    return thematicConnections;
  }

  private identifyRealWorldApplications(
    primarySubject: string,
    _objectives: string[],
    _culturalContexts: string[]
  ): ConnectionOpportunity[] {
    const realWorldConnections: ConnectionOpportunity[] = [];
    
    // Real-world scenarios that integrate multiple subjects
    const realWorldScenarios = [
      {
        name: 'Planning a Class Garden',
        subjects: ['Sciences et technologie', 'Mathématiques', 'Français (Immersion)'],
        description: 'Students plan, plant, and maintain a class garden',
        cultural_connections: ['Traditional gardening practices', 'Cultural food preferences']
      },
      {
        name: 'Creating a Class Cookbook',
        subjects: ['Français (Immersion)', 'Mathématiques', 'Études sociales', 'Arts'],
        description: 'Students collect family recipes and create a multicultural cookbook',
        cultural_connections: ['Family traditions', 'Cultural foods', 'Celebration foods']
      },
      {
        name: 'Weather Station Project',
        subjects: ['Sciences et technologie', 'Mathématiques', 'Français (Immersion)'],
        description: 'Students create and maintain a weather monitoring station',
        cultural_connections: ['Traditional weather prediction', 'Cultural responses to weather']
      }
    ];

    for (const scenario of realWorldScenarios) {
      if (scenario.subjects.includes(primarySubject)) {
        realWorldConnections.push({
          opportunity_type: 'real_world_application',
          subjects_involved: scenario.subjects,
          connection_strength: 0.95,
          implementation_complexity: 'complex',
          description: scenario.description,
          rationale: 'Authentic, real-world application that naturally integrates subjects',
          suggested_activities: this.generateRealWorldActivities(scenario.name, scenario.subjects),
          potential_challenges: ['Resource requirements', 'Extended time commitment', 'Family engagement needed'],
          success_indicators: [
            'Students see learning relevance',
            'Family engagement increases',
            'Skills transfer to home/community'
          ]
        });
      }
    }

    return realWorldConnections;
  }

  private rankConnectionOpportunities(
    opportunities: ConnectionOpportunity[],
    timeFrame: string
  ): ConnectionOpportunity[] {
    return opportunities
      .sort((a, b) => {
        // Priority factors: strength, feasibility, time frame appropriateness
        let scoreA = a.connection_strength;
        let scoreB = b.connection_strength;

        // Adjust for implementation complexity
        const complexityScores = { 'simple': 1, 'moderate': 0.8, 'complex': 0.6 };
        scoreA *= complexityScores[a.implementation_complexity];
        scoreB *= complexityScores[b.implementation_complexity];

        // Adjust for time frame appropriateness
        if (timeFrame === 'single_lesson' && a.implementation_complexity === 'complex') {
          scoreA *= 0.3;
        }
        if (timeFrame === 'unit' && a.implementation_complexity === 'simple') {
          scoreA *= 1.1; // Slight boost for simple connections in longer timeframes
        }

        return scoreB - scoreA;
      })
      .slice(0, 10); // Return top 10 opportunities
  }

  // Helper methods for content generation

  private generateConnectionActivities(primarySubject: string, connectedSubject: string, types: string[]): string[] {
    const activities: string[] = [];
    
    types.forEach(type => {
      switch (type) {
        case 'vocabulary':
          activities.push(`Create bilingual vocabulary cards for ${primarySubject} and ${connectedSubject}`);
          break;
        case 'communication':
          activities.push(`Students explain ${connectedSubject} concepts in French`);
          break;
        case 'patterns':
          activities.push(`Find patterns in both ${primarySubject} and ${connectedSubject}`);
          break;
        case 'creativity':
          activities.push(`Create artistic representations of ${primarySubject} concepts`);
          break;
        case 'cultural':
          activities.push(`Explore cultural connections between ${primarySubject} and ${connectedSubject}`);
          break;
        default:
          activities.push(`Integrate ${type} across ${primarySubject} and ${connectedSubject}`);
      }
    });

    return activities;
  }

  private getTransferableSkills(subject: string, _grade: number): Array<{
    name: string;
    rationale: string;
    activities: string[];
  }> {
    const skillsBySubject: Record<string, any[]> = {
      'Français (Immersion)': [
        {
          name: 'Communication',
          rationale: 'Communication skills transfer to all subjects',
          activities: ['Explain math thinking in French', 'Describe science observations in French']
        },
        {
          name: 'Listening and Following Directions',
          rationale: 'Essential skill for all learning',
          activities: ['Multi-step instructions across subjects', 'Listening for key information']
        }
      ],
      'Mathématiques': [
        {
          name: 'Problem Solving',
          rationale: 'Problem-solving strategies apply to all subjects',
          activities: ['Use math strategies for science problems', 'Apply logical thinking to social studies']
        },
        {
          name: 'Pattern Recognition',
          rationale: 'Patterns exist in all subjects',
          activities: ['Find patterns in stories', 'Identify patterns in art and music']
        }
      ]
    };

    return skillsBySubject[subject] || [];
  }

  private findSubjectsForSkill(skill: { name: string; rationale: string; activities: string[]; }, _grade: number): string[] {
    const skillSubjectMap: Record<string, string[]> = {
      'Communication': ['Français (Immersion)', 'English Language Arts', 'Études sociales'],
      'Problem Solving': ['Mathématiques', 'Sciences et technologie'],
      'Pattern Recognition': ['Mathématiques', 'Arts', 'Français (Immersion)'],
      'Listening and Following Directions': ['All subjects']
    };

    return skillSubjectMap[skill.name] || [];
  }

  private extractVocabularyFromExpectations(expectations: string[]): string[] {
    // Simple vocabulary extraction - in a full implementation, this would be more sophisticated
    const vocabulary: string[] = [];
    
    expectations.forEach(exp => {
      const words = exp.toLowerCase().match(/\b\w{4,}\b/g) || [];
      vocabulary.push(...words);
    });

    // Return unique vocabulary words
    return Array.from(new Set(vocabulary));
  }

  private getSubjectVocabulary(subject: string): string[] {
    const subjectVocabulary: Record<string, string[]> = {
      'Mathématiques': ['number', 'count', 'pattern', 'shape', 'size', 'measure', 'compare', 'more', 'less', 'equal'],
      'Sciences et technologie': ['observe', 'predict', 'test', 'living', 'growth', 'change', 'material', 'property'],
      'Études sociales': ['family', 'community', 'culture', 'tradition', 'celebration', 'different', 'similar', 'respect'],
      'Arts': ['create', 'design', 'color', 'texture', 'express', 'imagine', 'beautiful', 'pattern']
    };

    return subjectVocabulary[subject] || [];
  }

  private findVocabularyIntersection(vocab1: string[], vocab2: string[]): string[] {
    return vocab1.filter(word => vocab2.includes(word));
  }

  private findSubjectsForTheme(theme: string, _expectations: string[]): string[] {
    const themeSubjectMap: Record<string, string[]> = {
      'Our Community': ['Études sociales', 'Français (Immersion)', 'Mathématiques'],
      'Growing and Changing': ['Sciences et technologie', 'Français (Immersion)', 'Arts'],
      'Seasons and Weather': ['Sciences et technologie', 'Mathématiques', 'Arts'],
      'Families Around the World': ['Études sociales', 'Français (Immersion)', 'Arts'],
      'Animals and Their Homes': ['Sciences et technologie', 'Français (Immersion)', 'Arts', 'Mathématiques'],
      'Transportation': ['Sciences et technologie', 'Mathématiques', 'Études sociales'],
      'Food and Nutrition': ['Sciences et technologie', 'Mathématiques', 'Études sociales', 'Français (Immersion)']
    };

    return themeSubjectMap[theme] || [];
  }

  private generateThematicActivities(theme: string, subjects: string[]): string[] {
    const activities = [
      `Create a ${theme.toLowerCase()} investigation across ${subjects.join(', ')}`,
      `Design a ${theme.toLowerCase()} presentation using multiple subjects`,
      `Build a ${theme.toLowerCase()} project that demonstrates learning in all areas`
    ];

    // Add theme-specific activities
    switch (theme) {
      case 'Our Community':
        activities.push('Map our community and interview community helpers');
        activities.push('Create a community guide in French and English');
        break;
      case 'Animals and Their Homes':
        activities.push('Research animals, create habitats, and write about them');
        activities.push('Count and sort animals, then create art representations');
        break;
      case 'Seasons and Weather':
        activities.push('Track weather data and create seasonal artwork');
        activities.push('Write weather reports and learn seasonal vocabulary');
        break;
    }

    return activities;
  }

  private generateRealWorldActivities(scenarioName: string, _subjects: string[]): string[] {
    const activitiesByScenario: Record<string, string[]> = {
      'Planning a Class Garden': [
        'Research plants that grow in our climate (Science)',
        'Measure garden plot and calculate planting space (Math)',
        'Write garden journal entries and plant labels (French)',
        'Create garden artwork and design layout (Arts)'
      ],
      'Creating a Class Cookbook': [
        'Interview family members about traditional recipes (Social Studies)',
        'Measure ingredients and calculate serving sizes (Math)',
        'Write recipes in French (French Language)',
        'Design cookbook cover and illustrations (Arts)'
      ],
      'Weather Station Project': [
        'Build weather instruments (Science & Technology)',
        'Collect and graph weather data (Math)',
        'Write daily weather reports (French)',
        'Create weather symbols and displays (Arts)'
      ]
    };

    return activitiesByScenario[scenarioName] || [
      `Plan and execute ${scenarioName.toLowerCase()}`,
      `Document learning process across all subjects`,
      `Share results with authentic audience`
    ];
  }

  // Methods for thematic unit generation

  private generateThematicBigIdea(themeName: string, _subjects: string[], french = false): string {
    if (french) {
      return `L'exploration du thème "${themeName}" nous aide à comprendre les connections dans notre monde et développer nos compétences à travers plusieurs matières.`;
    }
    return `Exploring "${themeName}" helps us understand connections in our world and develop skills across multiple subjects.`;
  }

  private generateThematicEssentialQuestions(
    themeName: string, 
    _subjects: string[], 
    _grade: number, 
    french = false
  ): string[] {
    if (french) {
      return [
        `Comment le thème "${themeName}" se connecte-t-il à notre vie quotidienne?`,
        `Que pouvons-nous apprendre en explorant "${themeName}" dans différentes matières?`,
        `Comment nos nouvelles connaissances sur "${themeName}" peuvent-elles nous aider?`
      ];
    }
    return [
      `How does "${themeName}" connect to our daily lives?`,
      `What can we learn by exploring "${themeName}" across different subjects?`,
      `How can our new knowledge about "${themeName}" help us and others?`
    ];
  }

  private planSubjectIntegration(
    subjects: string[],
    expectations: Record<string, string[]>,
    _durationWeeks: number
  ): ThematicUnit['subject_integration'] {
    return subjects.map(subject => ({
      subject_name: subject,
      curriculum_expectations: expectations[subject] || [],
      time_allocation_percentage: Math.floor(100 / subjects.length),
      key_concepts: this.getSubjectKeyConcepts(subject),
      vocabulary: this.getSubjectVocabulary(subject),
      assessment_focus: this.getSubjectAssessmentFocus(subject)
    }));
  }

  private getSubjectKeyConcepts(subject: string): string[] {
    const concepts: Record<string, string[]> = {
      'Français (Immersion)': ['Communication orale', 'Lecture', 'Écriture', 'Vocabulaire'],
      'Mathématiques': ['Numbers', 'Patterns', 'Measurement', 'Geometry'],
      'Sciences et technologie': ['Living things', 'Materials', 'Observation', 'Prediction'],
      'Études sociales': ['Community', 'Culture', 'Relationships', 'Environment'],
      'Arts': ['Expression', 'Creativity', 'Design', 'Cultural appreciation']
    };
    return concepts[subject] || ['Key concepts'];
  }

  private getSubjectAssessmentFocus(subject: string): string[] {
    const focus: Record<string, string[]> = {
      'Français (Immersion)': ['Oral communication', 'Reading comprehension', 'Writing expression'],
      'Mathématiques': ['Problem solving', 'Mathematical reasoning', 'Communication of thinking'],
      'Sciences et technologie': ['Inquiry skills', 'Scientific thinking', 'Communication of findings'],
      'Études sociales': ['Understanding of concepts', 'Application to real life', 'Respectful communication'],
      'Arts': ['Creative expression', 'Use of elements', 'Personal reflection']
    };
    return focus[subject] || ['Understanding', 'Application', 'Communication'];
  }

  private designCulminatingActivities(themeName: string, subjects: string[], _grade: number): CulminatingActivity[] {
    return [
      {
        activity_name: `${themeName} Showcase`,
        description: `Students present their learning about ${themeName} through multiple formats`,
        subjects_showcased: subjects,
        audience: 'Families and other classes',
        format: 'Learning fair with stations',
        duration: '2 hours',
        preparation_requirements: [
          'Create display materials',
          'Practice presentations',
          'Prepare interactive stations'
        ],
        success_indicators: [
          'Students confidently share learning',
          'Connections between subjects are evident',
          'Audience engagement is high'
        ]
      }
    ];
  }

  private async createCrossCurricularConnections(
    subjects: string[],
    expectations: Record<string, string[]>,
    themeName: string
  ): Promise<CrossCurricularConnection[]> {
    const connections: CrossCurricularConnection[] = [];

    // Create connections between each pair of subjects
    for (let i = 0; i < subjects.length; i++) {
      for (let j = i + 1; j < subjects.length; j++) {
        const connection = await this.createSubjectPairConnection(
          subjects[i],
          subjects[j],
          expectations,
          themeName
        );
        if (connection) {
          connections.push(connection);
        }
      }
    }

    return connections;
  }

  private async createSubjectPairConnection(
    subject1: string,
    subject2: string,
    _expectations: Record<string, string[]>,
    themeName: string
  ): Promise<CrossCurricularConnection | null> {
    const connectionData = (this.connectionMatrix as any)[subject1]?.[subject2];
    
    if (!connectionData) return null;

    const integratedActivities = await this.createIntegratedActivitiesForPair(subject1, subject2, themeName);
    const assessmentOpportunities = this.createCrossCurricularAssessments(subject1, subject2);
    const realWorldConnections = this.createRealWorldConnectionsForPair(subject1, subject2, themeName);

    return {
      connection_id: `${subject1}_${subject2}_${Date.now()}`,
      primary_subject: subject1,
      connected_subjects: [subject2],
      connection_type: 'thematic',
      strength: connectionData.strength as 'strong' | 'moderate' | 'weak',
      description: `Thematic integration of ${subject1} and ${subject2} through ${themeName}`,
      learning_objectives: [
        `Integrate ${subject1} and ${subject2} learning`,
        `Make connections between subject areas`,
        `Apply skills across contexts`
      ],
      essential_questions: [
        `How do ${subject1} and ${subject2} help us understand ${themeName}?`,
        `What connections can we make between these subjects?`
      ],
      shared_vocabulary: this.findVocabularyIntersection(
        this.getSubjectVocabulary(subject1),
        this.getSubjectVocabulary(subject2)
      ),
      integrated_activities: integratedActivities,
      assessment_opportunities: assessmentOpportunities,
      real_world_connections: realWorldConnections
    };
  }

  // Additional helper methods

  private async createIntegratedActivitiesForPair(
    subject1: string,
    subject2: string,
    themeName: string
  ): Promise<IntegratedActivity[]> {
    const activity = await this.createIntegratedActivity({
      activity_theme: themeName,
      subjects_to_integrate: [subject1, subject2],
      learning_objectives: {
        [subject1]: [`Apply ${subject1} skills in thematic context`],
        [subject2]: [`Apply ${subject2} skills in thematic context`]
      },
      grade: 1,
      duration_minutes: 45,
      available_resources: ['Basic classroom materials'],
      french_immersion_focus: true
    });

    return [activity];
  }

  private createCrossCurricularAssessments(subject1: string, subject2: string): CrossCurricularAssessment[] {
    return [{
      assessment_name: `Integrated ${subject1} and ${subject2} Assessment`,
      subjects_assessed: [subject1, subject2],
      assessment_type: 'performance_task',
      description: `Students demonstrate learning in both ${subject1} and ${subject2} through a single task`,
      success_criteria: {
        [subject1]: [`Shows understanding of key ${subject1} concepts`],
        [subject2]: [`Shows understanding of key ${subject2} concepts`]
      },
      rubric_dimensions: ['Understanding', 'Application', 'Communication', 'Connections'],
      differentiation_options: ['Multiple ways to demonstrate learning', 'Choice in format']
    }];
  }

  private createRealWorldConnectionsForPair(
    subject1: string,
    subject2: string,
    themeName: string
  ): RealWorldConnection[] {
    return [{
      connection_name: `Real-world application of ${subject1} and ${subject2}`,
      description: `How ${subject1} and ${subject2} work together in real life contexts`,
      community_links: ['Local businesses', 'Community organizations'],
      family_engagement: ['Family interviews', 'Home connections'],
      authentic_applications: [`${themeName} in daily life`],
      career_connections: ['Community helpers who use these subjects'],
      cultural_connections: ['Cultural practices involving both subjects']
    }];
  }

  // Implementation methods for integrated activities

  private generateActivityName(theme: string, subjects: string[]): string {
    return `${theme} Integration: ${subjects.join(' & ')}`;
  }

  private createActivityDescription(theme: string, subjects: string[], grade: number): string {
    return `Students explore ${theme} by integrating learning from ${subjects.join(', ')}, making connections between subject areas while developing understanding appropriate for Grade ${grade}.`;
  }

  private selectMaterialsForIntegration(
    availableResources: string[],
    subjects: string[],
    _theme: string
  ): string[] {
    const basicMaterials = ['Paper', 'Pencils', 'Markers', 'Chart paper'];
    const subjectSpecific = subjects.flatMap(subject => this.getSubjectMaterials(subject));
    
    return [...basicMaterials, ...subjectSpecific, ...availableResources].slice(0, 8);
  }

  private getSubjectMaterials(subject: string): string[] {
    const materials: Record<string, string[]> = {
      'Mathématiques': ['Counting materials', 'Measuring tools'],
      'Sciences et technologie': ['Magnifying glasses', 'Collection containers'],
      'Arts': ['Art supplies', 'Creation materials'],
      'Français (Immersion)': ['Books', 'Vocabulary cards']
    };
    return materials[subject] || [];
  }

  private createIntegratedDifferentiation(_subjects: string[], _grade: number): string[] {
    return [
      'Multiple ways to participate in each subject area',
      'Visual supports for all subjects',
      'Hands-on options for kinesthetic learners',
      'Choice in how to demonstrate learning',
      'Collaborative and individual work options'
    ];
  }

  private createIntegratedAssessment(
    _subjects: string[],
    _objectives: Record<string, string[]>
  ): string[] {
    return [
      'Observation of student work across all subjects',
      'Student self-reflection on connections made',
      'Portfolio documentation of integrated learning',
      'Peer sharing of discoveries and connections'
    ];
  }

  private createFrenchLanguageSupports(_subjects: string[], frenchImmersionFocus: boolean): string[] {
    if (!frenchImmersionFocus) return [];
    
    return [
      'Vocabulary cards in French for all subjects',
      'Sentence starters in French',
      'Visual supports with French labels',
      'Opportunities to explain thinking in French',
      'French language models and scaffolds',
      'Bilingual resources when needed'
    ];
  }

  // Remaining helper methods for thematic unit planning

  private planFamilyEngagement(themeName: string, _culturalContexts: string[]): string[] {
    return [
      `Share family experiences related to ${themeName}`,
      'Invite family members to share expertise',
      'Send home learning extensions related to theme',
      'Include cultural perspectives from all families',
      'Create opportunities for family participation in learning'
    ];
  }

  private planCommunityConnections(themeName: string, _subjects: string[]): string[] {
    return [
      `Invite community members related to ${themeName}`,
      'Plan field trips that connect to multiple subjects',
      'Create service learning opportunities',
      'Connect with local organizations',
      'Share student learning with community'
    ];
  }

  private compileResourceRequirements(
    subjectIntegration: ThematicUnit['subject_integration'],
    activities: CulminatingActivity[],
    _connections: CrossCurricularConnection[]
  ): string[] {
    const resources = new Set<string>();
    
    // Add basic resources
    resources.add('Chart paper and markers');
    resources.add('Art and craft supplies');
    resources.add('Technology for research and presentations');
    resources.add('Books and reference materials');
    
    // Add subject-specific resources
    subjectIntegration.forEach(subject => {
      this.getSubjectMaterials(subject.subject_name).forEach(material => {
        resources.add(material);
      });
    });

    // Add activity-specific resources
    activities.forEach(activity => {
      activity.preparation_requirements.forEach(req => {
        if (req.includes('materials') || req.includes('supplies')) {
          resources.add(req);
        }
      });
    });

    return Array.from(resources);
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
          connectionMatrixSize: Object.keys(this.connectionMatrix).length,
          supportedSubjects: Object.keys(this.connectionMatrix)
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