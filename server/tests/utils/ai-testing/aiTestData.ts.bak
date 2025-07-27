/**
 * AI Test Data Generator for Teaching Engine 2.0
 * 
 * Provides deterministic test data and scenarios for AI endpoint testing
 * to ensure reproducible and consistent snapshot tests.
 */

import { CurriculumExpectation } from '../../../src/services/aiPromptTemplateService';
import { 
  LongRangePlanDraftInput,
  UnitPlanDraftInput,
  LessonPlanDraftInput,
  DaybookDraftInput
} from '../../../src/services/aiDraftService';
import { AITestScenario } from './aiTestUtils';

/**
 * Comprehensive test data for AI regression testing
 */
export class AITestDataGenerator {
  /**
   * Generate deterministic curriculum expectations for testing
   */
  static generateTestExpectations(): Record<string, CurriculumExpectation[]> {
    return {
      'grade-1-mathematics': [
        {
          id: 'test-m1-overall-1',
          code: 'M1.NS.A1',
          description: 'demonstrate understanding of whole numbers to 20 through a variety of tools and contexts',
          strand: 'Number Sense and Numeration',
          grade: 1,
          subject: 'Mathematics',
          type: 'overall',
          keywords: ['numbers', 'counting', 'whole numbers', 'grade-1'],
        },
        {
          id: 'test-m1-specific-1',
          code: 'M1.NS.S1',
          description: 'count forward by 1s, 2s, 5s, and 10s to 100 using a variety of tools',
          strand: 'Number Sense and Numeration',
          grade: 1,
          subject: 'Mathematics',
          type: 'specific',
          keywords: ['counting', 'skip counting', 'patterns'],
        },
        {
          id: 'test-m1-specific-2',
          code: 'M1.NS.S2',
          description: 'represent, compare, and order whole numbers to 20 using a variety of tools',
          strand: 'Number Sense and Numeration',
          grade: 1,
          subject: 'Mathematics',
          type: 'specific',
          keywords: ['representing', 'comparing', 'ordering'],
        },
      ],
      
      'grade-3-language-arts': [
        {
          id: 'test-la3-overall-1',
          code: 'LA3.R.A1',
          description: 'read and demonstrate comprehension of a variety of fiction, poetry, and non-fiction texts',
          strand: 'Reading',
          grade: 3,
          subject: 'Language Arts',
          type: 'overall',
          keywords: ['reading', 'comprehension', 'fiction', 'non-fiction'],
        },
        {
          id: 'test-la3-specific-1',
          code: 'LA3.R.S1',
          description: 'identify the main idea and supporting details in simple non-fiction texts',
          strand: 'Reading',
          grade: 3,
          subject: 'Language Arts',
          type: 'specific',
          keywords: ['main idea', 'supporting details', 'non-fiction'],
        },
        {
          id: 'test-la3-specific-2',
          code: 'LA3.R.S2',
          description: 'make inferences about characters\' feelings and actions in fiction texts',
          strand: 'Reading',
          grade: 3,
          subject: 'Language Arts',
          type: 'specific',
          keywords: ['inferences', 'characters', 'feelings', 'fiction'],
        },
      ],
      
      'grade-5-science': [
        {
          id: 'test-s5-overall-1',
          code: 'S5.LS.A1',
          description: 'demonstrate understanding of the basic needs of plants and their role in the environment',
          strand: 'Understanding Life Systems',
          grade: 5,
          subject: 'Science',
          type: 'overall',
          keywords: ['plants', 'environment', 'basic needs', 'life systems'],
        },
        {
          id: 'test-s5-specific-1',
          code: 'S5.LS.S1',
          description: 'identify the basic needs of plants including air, water, light, warmth, and nutrients',
          strand: 'Understanding Life Systems',
          grade: 5,
          subject: 'Science',
          type: 'specific',
          keywords: ['basic needs', 'air', 'water', 'light', 'nutrients'],
        },
        {
          id: 'test-s5-specific-2',
          code: 'S5.LS.S2',
          description: 'describe how plants get energy from the sun through photosynthesis',
          strand: 'Understanding Life Systems',
          grade: 5,
          subject: 'Science',
          type: 'specific',
          keywords: ['photosynthesis', 'energy', 'sun', 'plants'],
        },
      ],
    };
  }
  
  /**
   * Generate test scenarios for all supported grades and subjects
   */
  static generateTestScenarios(): AITestScenario[] {
    const expectations = this.generateTestExpectations();
    const scenarios: AITestScenario[] = [];
    
    // Grade 1 Mathematics scenarios
    scenarios.push(
      {
        id: 'grade-1-math-basic',
        name: 'Grade 1 Mathematics - Basic Number Sense',
        description: 'Basic number recognition and counting for Grade 1',
        grade: 1,
        subject: 'Mathematics',
        complexity: 'basic',
        expectations: expectations['grade-1-mathematics'].slice(0, 1),
        context: {
          academicYear: '2024-2025',
          term: 'Fall',
        },
      },
      {
        id: 'grade-1-math-intermediate',
        name: 'Grade 1 Mathematics - Skip Counting',
        description: 'Skip counting patterns and number representation',
        grade: 1,
        subject: 'Mathematics',
        complexity: 'intermediate',
        expectations: expectations['grade-1-mathematics'].slice(0, 2),
        context: {
          academicYear: '2024-2025',
          term: 'Winter',
          unitTitle: 'Number Patterns',
          duration: 30,
        },
      },
      {
        id: 'grade-1-math-advanced',
        name: 'Grade 1 Mathematics - Number Comparison',
        description: 'Advanced number comparison and ordering',
        grade: 1,
        subject: 'Mathematics',
        complexity: 'advanced',
        expectations: expectations['grade-1-mathematics'],
        context: {
          academicYear: '2024-2025',
          term: 'Spring',
          unitTitle: 'Comparing and Ordering Numbers',
          duration: 45,
          lessonNumber: 5,
        },
      }
    );
    
    // Grade 3 Language Arts scenarios
    scenarios.push(
      {
        id: 'grade-3-la-basic',
        name: 'Grade 3 Language Arts - Reading Comprehension',
        description: 'Basic reading comprehension strategies',
        grade: 3,
        subject: 'Language Arts',
        complexity: 'basic',
        expectations: expectations['grade-3-language-arts'].slice(0, 1),
        context: {
          academicYear: '2024-2025',
          term: 'Fall',
        },
      },
      {
        id: 'grade-3-la-intermediate',
        name: 'Grade 3 Language Arts - Main Ideas',
        description: 'Identifying main ideas and supporting details',
        grade: 3,
        subject: 'Language Arts',
        complexity: 'intermediate',
        expectations: expectations['grade-3-language-arts'].slice(0, 2),
        context: {
          academicYear: '2024-2025',
          term: 'Winter',
          unitTitle: 'Non-Fiction Reading Strategies',
          duration: 40,
        },
      },
      {
        id: 'grade-3-la-advanced',
        name: 'Grade 3 Language Arts - Character Analysis',
        description: 'Advanced character analysis and inference making',
        grade: 3,
        subject: 'Language Arts',
        complexity: 'advanced',
        expectations: expectations['grade-3-language-arts'],
        context: {
          academicYear: '2024-2025',
          term: 'Spring',
          unitTitle: 'Fiction Analysis and Comprehension',
          duration: 50,
          lessonNumber: 8,
        },
      }
    );
    
    // Grade 5 Science scenarios
    scenarios.push(
      {
        id: 'grade-5-science-basic',
        name: 'Grade 5 Science - Plant Basics',
        description: 'Basic understanding of plant needs',
        grade: 5,
        subject: 'Science',
        complexity: 'basic',
        expectations: expectations['grade-5-science'].slice(0, 1),
        context: {
          academicYear: '2024-2025',
          term: 'Fall',
        },
      },
      {
        id: 'grade-5-science-intermediate',
        name: 'Grade 5 Science - Plant Needs',
        description: 'Detailed study of plant basic needs',
        grade: 5,
        subject: 'Science',
        complexity: 'intermediate',
        expectations: expectations['grade-5-science'].slice(0, 2),
        context: {
          academicYear: '2024-2025',
          term: 'Winter',
          unitTitle: 'What Plants Need to Survive',
          duration: 60,
        },
      },
      {
        id: 'grade-5-science-advanced',
        name: 'Grade 5 Science - Photosynthesis',
        description: 'Advanced study of photosynthesis and energy transfer',
        grade: 5,
        subject: 'Science',
        complexity: 'advanced',
        expectations: expectations['grade-5-science'],
        context: {
          academicYear: '2024-2025',
          term: 'Spring',
          unitTitle: 'How Plants Make Food: Photosynthesis',
          duration: 75,
          lessonNumber: 12,
        },
      }
    );
    
    return scenarios;
  }
  
  /**
   * Generate test input for long-range plan AI endpoints
   */
  static generateLongRangePlanInput(scenario: AITestScenario): LongRangePlanDraftInput {
    return {
      expectations: scenario.expectations,
      subject: scenario.subject,
      grade: scenario.grade,
      academicYear: scenario.context?.academicYear || '2024-2025',
      termStructure: 'semester' as const,
    };
  }
  
  /**
   * Generate test input for unit plan AI endpoints
   */
  static generateUnitPlanInput(scenario: AITestScenario): UnitPlanDraftInput {
    return {
      unitTitle: scenario.context?.unitTitle || `${scenario.subject} Unit Study`,
      subject: scenario.subject,
      grade: scenario.grade,
      expectations: scenario.expectations,
      longRangePlanContext: `Grade ${scenario.grade} ${scenario.subject} long-range plan context`,
    };
  }
  
  /**
   * Generate test input for lesson plan AI endpoints
   */
  static generateLessonPlanInput(scenario: AITestScenario): LessonPlanDraftInput {
    return {
      unitTitle: scenario.context?.unitTitle || `${scenario.subject} Unit`,
      subject: scenario.subject,
      grade: scenario.grade,
      expectations: scenario.expectations,
      unitContext: `Unit context for ${scenario.subject} Grade ${scenario.grade}`,
      duration: scenario.context?.duration || 45,
      lessonNumber: scenario.context?.lessonNumber || 1,
    };
  }
  
  /**
   * Generate test input for daybook AI endpoints
   */
  static generateDaybookInput(scenario: AITestScenario): DaybookDraftInput {
    const baseTitle = scenario.context?.unitTitle || `${scenario.subject} Lesson`;
    
    return {
      lessons: [
        {
          title: `${baseTitle} - Introduction`,
          subject: scenario.subject,
          duration: scenario.context?.duration || 45,
          learningGoals: [
            `Students will understand basic concepts in ${scenario.subject}`,
            `Students will apply knowledge through hands-on activities`,
          ],
        },
        {
          title: `${baseTitle} - Practice`,
          subject: scenario.subject,
          duration: scenario.context?.duration || 45,
          learningGoals: [
            `Students will practice key skills`,
            `Students will demonstrate understanding`,
          ],
        },
        {
          title: `${baseTitle} - Assessment`,
          subject: scenario.subject,
          duration: scenario.context?.duration || 45,
          learningGoals: [
            `Students will be assessed on their learning`,
            `Students will reflect on their progress`,
          ],
        },
      ],
      weekStartDate: '2024-09-16',
      specialEvents: scenario.complexity === 'advanced' ? ['Library visit', 'Science fair preparation'] : undefined,
    };
  }
  
  /**
   * Get specific test scenario by ID
   */
  static getScenarioById(id: string): AITestScenario | undefined {
    return this.generateTestScenarios().find(scenario => scenario.id === id);
  }
  
  /**
   * Get scenarios filtered by criteria
   */
  static getScenariosByCriteria(criteria: {
    grade?: number;
    subject?: string;
    complexity?: 'basic' | 'intermediate' | 'advanced';
  }): AITestScenario[] {
    return this.generateTestScenarios().filter(scenario => {
      return (!criteria.grade || scenario.grade === criteria.grade) &&
             (!criteria.subject || scenario.subject === criteria.subject) &&
             (!criteria.complexity || scenario.complexity === criteria.complexity);
    });
  }
}

/**
 * Mock AI responses for testing when OpenAI API is not available
 */
export class AITestMockResponses {
  /**
   * Generate mock long-range plan response
   */
  static mockLongRangePlan(scenario: AITestScenario): any {
    return {
      units: [
        {
          title: `${scenario.subject} Foundations`,
          term: scenario.context?.term || 'Fall',
          expectedDurationWeeks: scenario.complexity === 'basic' ? 4 : scenario.complexity === 'intermediate' ? 6 : 8,
          bigIdeas: [
            `Understanding ${scenario.subject} concepts builds foundation for learning`,
            'Students learn through hands-on exploration and practice',
            'Real-world connections make learning meaningful',
          ],
          linkedExpectations: scenario.expectations?.length > 0 ? scenario.expectations.map(exp => ({
            code: exp.code,
            type: exp.type,
          })) : [
            { code: 'TEST.1.O1', type: 'overall' },
            { code: 'TEST.1.S1', type: 'specific' },
          ],
        },
        {
          title: `${scenario.subject} Applications`,
          term: scenario.context?.term || 'Winter',
          expectedDurationWeeks: scenario.complexity === 'basic' ? 3 : scenario.complexity === 'intermediate' ? 5 : 7,
          bigIdeas: [
            `Applying ${scenario.subject} skills to solve problems`,
            'Practice leads to mastery and confidence',
            'Collaborative learning enhances understanding',
          ],
          linkedExpectations: scenario.expectations?.length > 1 ? scenario.expectations.slice(1).map(exp => ({
            code: exp.code,
            type: exp.type,
          })) : [
            { code: 'TEST.2.O1', type: 'overall' },
          ],
        },
      ],
    };
  }
  
  /**
   * Generate mock unit plan response
   */
  static mockUnitPlan(scenario: AITestScenario): any {
    const complexity = scenario.complexity;
    
    return {
      title: scenario.context?.unitTitle || `Grade ${scenario.grade} ${scenario.subject} Unit`,
      bigIdeas: [
        `${scenario.subject} concepts connect to everyday life`,
        'Learning builds on previous knowledge and experience',
        complexity === 'advanced' ? 'Critical thinking skills enhance understanding' : 'Practice helps students master new skills',
      ],
      essentialQuestions: [
        `How do we use ${scenario.subject} in our daily lives?`,
        'What strategies help us learn new concepts?',
        complexity === 'advanced' ? 'How can we apply our learning to solve real problems?' : 'What happens when we practice regularly?',
      ],
      learningGoals: scenario.expectations.map(exp => 
        `Students will ${exp.description.toLowerCase()}`
      ),
      successCriteria: [
        'Students can explain key concepts in their own words',
        'Students demonstrate understanding through activities and discussions',
        complexity === 'advanced' ? 'Students can apply learning to new situations' : 'Students can complete practice tasks independently',
      ],
      assessmentFor: [
        'Observation during activities',
        'Student self-reflection',
        'Peer discussions and feedback',
      ],
      assessmentAs: [
        'Guided practice with teacher feedback',
        'Small group collaborative work',
        'Individual skill practice',
      ],
      assessmentOf: [
        complexity === 'advanced' ? 'Project-based assessment' : 'Quiz or test',
        'Portfolio of student work',
        'Final presentation or demonstration',
      ],
      crossCurricularLinks: this.generateCrossCurricularLinks(scenario.subject),
      timelineEstimateWeeks: complexity === 'basic' ? 2 : complexity === 'intermediate' ? 3 : 4,
    };
  }
  
  /**
   * Generate mock lesson plan response
   */
  static mockLessonPlan(scenario: AITestScenario): any {
    const duration = scenario.context?.duration || 45;
    const subject = scenario.subject;
    
    return {
      title: `${subject} Lesson - ${scenario.name}`,
      learningGoals: [
        `Students will understand key concepts in ${subject}`,
        'Students will practice new skills through hands-on activities',
        scenario.complexity === 'advanced' ? 'Students will apply learning to solve problems' : 'Students will demonstrate understanding',
      ],
      successCriteria: [
        'Students can explain what they learned',
        'Students can complete practice activities',
        'Students can ask questions when they need help',
      ],
      mindsOnDescription: `Begin with a ${subject.toLowerCase()} warm-up activity to activate prior knowledge and introduce today's topic`,
      mindsOnDuration: Math.round(duration * 0.2),
      actionDescription: `Students engage in hands-on ${subject.toLowerCase()} activities with teacher guidance and peer collaboration`,
      actionDuration: Math.round(duration * 0.6),
      consolidationDescription: `Students reflect on their learning and share key insights with the class`,
      consolidationDuration: Math.round(duration * 0.2),
      resources: this.generateResourceList(scenario.subject, scenario.grade),
      accommodations: this.generateAccommodations(scenario.complexity),
      assessmentStrategy: scenario.complexity === 'advanced' 
        ? 'Performance-based assessment with rubric and peer feedback'
        : 'Observation checklist and exit ticket',
    };
  }
  
  /**
   * Generate mock daybook response
   */
  static mockDaybook(scenario: AITestScenario): any {
    return {
      weeklyBigIdeas: [
        `This week students explored fundamental concepts in ${scenario.subject}`,
        'Students made connections between new learning and prior knowledge',
        scenario.complexity === 'advanced' 
          ? 'Students demonstrated critical thinking through problem-solving activities'
          : 'Students built confidence through successful practice experiences',
      ],
      dailyReflectionPrompts: [
        'What was the most interesting thing you learned today?',
        'What strategy helped you understand the new concept?',
        'How does today\'s learning connect to what you already know?',
        'What questions do you still have?',
        'How can you use what you learned outside of school?',
      ],
      substituteNotes: this.generateSubstituteNotes(scenario),
      weeklyInsights: this.generateWeeklyInsights(scenario),
    };
  }
  
  /**
   * Generate cross-curricular links based on subject
   */
  private static generateCrossCurricularLinks(subject: string): string[] {
    const links: Record<string, string[]> = {
      'Mathematics': [
        'Science: Measurement and data collection',
        'Art: Geometric patterns and symmetry',
        'Physical Education: Game statistics and scoring',
      ],
      'Language Arts': [
        'Social Studies: Reading historical texts',
        'Science: Research and report writing',
        'Art: Creative writing and storytelling',
      ],
      'Science': [
        'Mathematics: Data analysis and graphing',
        'Language Arts: Science vocabulary and communication',
        'Art: Scientific drawing and observation',
      ],
      'Social Studies': [
        'Language Arts: Research and presentation skills',
        'Mathematics: Population data and graphs',
        'Art: Cultural art forms and expression',
      ],
    };
    
    return links[subject] || ['Integrated learning across all subjects'];
  }
  
  /**
   * Generate appropriate resource list for subject and grade
   */
  private static generateResourceList(subject: string, grade: number): string[] {
    const baseResources = [
      'Whiteboard and markers',
      'Student worksheets',
      'Chart paper',
    ];
    
    const subjectResources: Record<string, string[]> = {
      'Mathematics': ['Manipulatives (counting bears, blocks)', 'Number lines', 'Calculators'],
      'Language Arts': ['Books and reading materials', 'Writing journals', 'Word cards'],
      'Science': ['Science materials for experiments', 'Observation journals', 'Magnifying glasses'],
      'Social Studies': ['Maps and globes', 'Historical artifacts/images', 'Community resources'],
    };
    
    const gradeSpecific = grade <= 2 ? ['Large print materials', 'Visual aids'] : ['Reference materials', 'Technology tools'];
    
    return [...baseResources, ...(subjectResources[subject] || []), ...gradeSpecific];
  }
  
  /**
   * Generate accommodations based on complexity
   */
  private static generateAccommodations(complexity: string): string {
    const baseAccommodations = 'Provide visual supports, extended time as needed, and multiple ways to demonstrate understanding.';
    
    if (complexity === 'advanced') {
      return baseAccommodations + ' Offer extension activities for early finishers and additional challenges for advanced learners.';
    } else if (complexity === 'basic') {
      return baseAccommodations + ' Break tasks into smaller steps and provide additional guided practice.';
    }
    
    return baseAccommodations + ' Adjust difficulty level based on individual student needs.';
  }
  
  /**
   * Generate substitute teacher notes
   */
  private static generateSubstituteNotes(scenario: AITestScenario): string {
    return `This week focused on ${scenario.subject} for Grade ${scenario.grade}. Students have been working on ${scenario.expectations[0]?.description || 'key curriculum expectations'}. 
    
Key routines: Morning circle at 9:00 AM, subject block from 9:15-10:15 AM, break at 10:15 AM. 
    
Materials are located in the ${scenario.subject} bin. If students need extra support, refer to the accommodation notes in the lesson plans. 
    
Contact the office if you need assistance. Students respond well to positive reinforcement and clear expectations.`;
  }
  
  /**
   * Generate weekly insights
   */
  private static generateWeeklyInsights(scenario: AITestScenario): string {
    const insights = [
      `Students in Grade ${scenario.grade} showed strong engagement with ${scenario.subject} activities this week.`,
      `The ${scenario.complexity} level activities were appropriate for most students.`,
      'Consider incorporating more hands-on activities to maintain engagement.',
      'Some students may benefit from additional practice before moving to the next concept.',
    ];
    
    if (scenario.complexity === 'advanced') {
      insights.push('Advanced learners are ready for more challenging extension activities.');
    } else if (scenario.complexity === 'basic') {
      insights.push('Continue to build foundational skills with repeated practice.');
    }
    
    return insights.join(' ');
  }
}