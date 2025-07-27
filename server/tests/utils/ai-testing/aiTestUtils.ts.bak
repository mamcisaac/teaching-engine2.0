/**
 * AI Test Utilities for Teaching Engine 2.0
 * 
 * Provides utilities for testing AI-generated content including
 * normalization, validation, and snapshot management.
 */

import { z } from 'zod';
import { CurriculumExpectation } from '../../../src/services/aiPromptTemplateService';

// Environment configuration for AI testing
export const AI_TESTING_CONFIG = {
  mode: process.env.AI_TESTING_MODE || 'mock',
  enableSnapshots: process.env.AI_TESTING_MODE === 'snapshot',
  enableCaching: process.env.AI_TESTING_CACHE === 'true',
  testApiKey: process.env.OPENAI_TEST_API_KEY,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Test scenario context for reproducible testing
export interface AITestScenario {
  id: string;
  name: string;
  description: string;
  grade: number;
  subject: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  expectations: CurriculumExpectation[];
  context?: {
    academicYear?: string;
    term?: string;
    duration?: number;
    unitTitle?: string;
    lessonNumber?: number;
  };
}

// Validation schemas for AI responses
export const LongRangePlanSchema = z.object({
  units: z.array(z.object({
    title: z.string().min(1),
    term: z.string(),
    expectedDurationWeeks: z.number().positive(),
    bigIdeas: z.array(z.string().min(1)),
    linkedExpectations: z.array(z.object({
      code: z.string(),
      type: z.enum(['overall', 'specific']),
    })),
  })),
});

export const UnitPlanSchema = z.object({
  title: z.string().min(1),
  bigIdeas: z.array(z.string().min(1)),
  essentialQuestions: z.array(z.string().min(1)),
  learningGoals: z.array(z.string().min(1)),
  successCriteria: z.array(z.string().min(1)),
  assessmentFor: z.array(z.string()),
  assessmentAs: z.array(z.string()),
  assessmentOf: z.array(z.string()),
  crossCurricularLinks: z.array(z.string()),
  timelineEstimateWeeks: z.number().positive(),
});

export const LessonPlanSchema = z.object({
  title: z.string().min(1),
  learningGoals: z.array(z.string().min(1)),
  successCriteria: z.array(z.string().min(1)),
  mindsOnDescription: z.string().min(1),
  mindsOnDuration: z.number().positive(),
  actionDescription: z.string().min(1),
  actionDuration: z.number().positive(),
  consolidationDescription: z.string().min(1),
  consolidationDuration: z.number().positive(),
  resources: z.array(z.string()),
  accommodations: z.string(),
  assessmentStrategy: z.string().min(1),
});

export const DaybookSchema = z.object({
  weeklyBigIdeas: z.array(z.string().min(1)),
  dailyReflectionPrompts: z.array(z.string().min(1)),
  substituteNotes: z.string().min(1),
  weeklyInsights: z.string().min(1),
});

// AI response normalization for consistent testing
export class AIResponseNormalizer {
  /**
   * Normalize AI response for snapshot testing by removing variable elements
   */
  static normalizeForSnapshot(response: any): any {
    if (typeof response === 'string') {
      return this.normalizeString(response);
    }
    
    if (Array.isArray(response)) {
      return response.map(item => this.normalizeForSnapshot(item));
    }
    
    if (response && typeof response === 'object') {
      const normalized: any = {};
      for (const [key, value] of Object.entries(response)) {
        // Skip timestamp and ID fields that change between runs
        if (this.isVariableField(key)) {
          continue;
        }
        normalized[key] = this.normalizeForSnapshot(value);
      }
      return normalized;
    }
    
    return response;
  }
  
  /**
   * Normalize string content by removing variable elements
   */
  private static normalizeString(text: string): string {
    return text
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\w.]*Z?/g, '[TIMESTAMP]') // ISO timestamps
      .replace(/\d{4}-\d{2}-\d{2}/g, '[DATE]') // Date strings
      .replace(/\b\d{13,}\b/g, '[LARGE_NUMBER]') // Large numbers (likely timestamps)
      .replace(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, '[UUID]') // UUIDs
      .replace(/\brequest[_-]?id[:\s]*[a-zA-Z0-9-]+/gi, 'request_id: [REQUEST_ID]') // Request IDs
      .replace(/\btrace[_-]?id[:\s]*[a-zA-Z0-9-]+/gi, 'trace_id: [TRACE_ID]') // Trace IDs
      .trim();
  }
  
  /**
   * Check if a field should be excluded from snapshots
   */
  private static isVariableField(key: string): boolean {
    const variableFields = [
      'id', 'userId', 'createdAt', 'updatedAt', 'timestamp',
      'requestId', 'traceId', 'sessionId', 'generatedAt',
      'processingTime', 'tokenCount', 'cost'
    ];
    return variableFields.includes(key) || key.toLowerCase().includes('time');
  }
}

// Content quality validation for educational appropriateness
export class AIContentValidator {
  private static readonly AGE_INAPPROPRIATE_PATTERNS = [
    /\b(violence|violent|kill|death|murder|weapon|gun|knife|bomb|explosion)\b/gi,
    /\b(sex|sexual|porn|adult|mature|inappropriate)\b/gi,
    /\b(drug|alcohol|cigarette|smoking|drinking|drunk)\b/gi,
    /\b(hate|racism|discrimination|bias|prejudice)\b/gi,
  ];
  
  private static readonly REQUIRED_EDUCATIONAL_ELEMENTS = {
    longRangePlan: ['units', 'bigIdeas', 'linkedExpectations'],
    unitPlan: ['title', 'learningGoals', 'successCriteria', 'assessmentFor'],
    lessonPlan: ['learningGoals', 'mindsOnDescription', 'actionDescription', 'consolidationDescription'],
    daybook: ['weeklyBigIdeas', 'dailyReflectionPrompts', 'substituteNotes'],
  };
  
  /**
   * Validate content for age-appropriateness and educational quality
   */
  static validateContent(content: any, type: keyof typeof this.REQUIRED_EDUCATIONAL_ELEMENTS): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Check for age-inappropriate content
    const inappropriateContent = this.checkForInappropriateContent(content);
    if (inappropriateContent.length > 0) {
      issues.push(...inappropriateContent.map(match => `Inappropriate content found: ${match}`));
    }
    
    // Check for required educational elements
    const missingElements = this.checkRequiredElements(content, type);
    if (missingElements.length > 0) {
      issues.push(...missingElements.map(element => `Missing required element: ${element}`));
    }
    
    // Check content quality
    const qualityIssues = this.checkContentQuality(content);
    warnings.push(...qualityIssues);
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      score: this.calculateQualityScore(content, issues, warnings),
    };
  }
  
  /**
   * Check for age-inappropriate content patterns
   */
  private static checkForInappropriateContent(content: any): string[] {
    const contentStr = JSON.stringify(content).toLowerCase();
    const matches: string[] = [];
    
    for (const pattern of this.AGE_INAPPROPRIATE_PATTERNS) {
      const patternMatches = contentStr.match(pattern);
      if (patternMatches) {
        matches.push(...patternMatches);
      }
    }
    
    return matches;
  }
  
  /**
   * Check for required educational elements
   */
  private static checkRequiredElements(content: any, type: keyof typeof this.REQUIRED_EDUCATIONAL_ELEMENTS): string[] {
    const required = this.REQUIRED_EDUCATIONAL_ELEMENTS[type];
    const missing: string[] = [];
    
    for (const element of required) {
      if (!content[element] || (Array.isArray(content[element]) && content[element].length === 0)) {
        missing.push(element);
      }
    }
    
    return missing;
  }
  
  /**
   * Check general content quality indicators
   */
  private static checkContentQuality(content: any): string[] {
    const warnings: string[] = [];
    const contentStr = JSON.stringify(content);
    
    // Check for overly repetitive content
    if (this.hasExcessiveRepetition(contentStr)) {
      warnings.push('Content appears to have excessive repetition');
    }
    
    // Check for appropriate length
    if (contentStr.length < 100) {
      warnings.push('Content appears too brief for educational purposes');
    }
    
    // Check for curriculum alignment indicators
    if (!this.hasCurriculumAlignment(contentStr)) {
      warnings.push('Content may lack clear curriculum alignment');
    }
    
    return warnings;
  }
  
  /**
   * Check for excessive repetition in content
   */
  private static hasExcessiveRepetition(text: string): boolean {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = new Map<string, number>();
    
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
    
    // Check if any non-common word appears more than 20% of the time
    const totalWords = words.length;
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'students', 'will', 'learning']);
    
    for (const [word, count] of wordCount.entries()) {
      if (!commonWords.has(word) && count > totalWords * 0.2) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check for curriculum alignment indicators
   */
  private static hasCurriculumAlignment(text: string): boolean {
    const alignmentIndicators = [
      'learning goal', 'success criteria', 'curriculum expectation',
      'assessment', 'objective', 'standard', 'outcome',
      'grade', 'subject', 'strand'
    ];
    
    const lowerText = text.toLowerCase();
    return alignmentIndicators.some(indicator => lowerText.includes(indicator));
  }
  
  /**
   * Calculate overall quality score (0-100)
   */
  private static calculateQualityScore(content: any, issues: string[], warnings: string[]): number {
    let score = 100;
    
    // Deduct points for issues and warnings
    score -= issues.length * 25; // Major issues
    score -= warnings.length * 10; // Minor warnings
    
    // Bonus points for good structure
    if (this.hasGoodStructure(content)) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Check if content has good educational structure
   */
  private static hasGoodStructure(content: any): boolean {
    if (typeof content !== 'object' || content === null) {
      return false;
    }
    
    // Check for array fields with appropriate content
    const arrayFields = Object.entries(content).filter(([_, value]) => Array.isArray(value));
    const hasNonEmptyArrays = arrayFields.some(([_, array]) => array.length > 0);
    
    // Check for string fields with substantial content
    const stringFields = Object.entries(content).filter(([_, value]) => typeof value === 'string');
    const hasSubstantialStrings = stringFields.some(([_, str]) => str.length > 50);
    
    return hasNonEmptyArrays && hasSubstantialStrings;
  }
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  score: number;
}

// Test scenario generator for reproducible AI testing
export class AITestScenarioGenerator {
  /**
   * Generate standard test scenarios for different grades and subjects
   */
  static generateStandardScenarios(): AITestScenario[] {
    const scenarios: AITestScenario[] = [];
    const subjects = ['Mathematics', 'Language Arts', 'Science', 'Social Studies'];
    const grades = [1, 2, 3, 4, 5, 6];
    
    for (const grade of grades) {
      for (const subject of subjects) {
        scenarios.push(
          this.createBasicScenario(grade, subject),
          this.createIntermediateScenario(grade, subject),
          this.createAdvancedScenario(grade, subject)
        );
      }
    }
    
    return scenarios;
  }
  
  /**
   * Create a basic complexity scenario
   */
  private static createBasicScenario(grade: number, subject: string): AITestScenario {
    const expectation = this.createMockExpectation(grade, subject, 'basic');
    
    return {
      id: `basic-${grade}-${subject.toLowerCase().replace(' ', '-')}`,
      name: `Grade ${grade} ${subject} - Basic`,
      description: `Basic complexity scenario for Grade ${grade} ${subject}`,
      grade,
      subject,
      complexity: 'basic',
      expectations: [expectation],
      context: {
        academicYear: '2024-2025',
        term: 'Fall',
      },
    };
  }
  
  /**
   * Create an intermediate complexity scenario
   */
  private static createIntermediateScenario(grade: number, subject: string): AITestScenario {
    const expectations = [
      this.createMockExpectation(grade, subject, 'intermediate'),
      this.createMockExpectation(grade, subject, 'intermediate', 2),
    ];
    
    return {
      id: `intermediate-${grade}-${subject.toLowerCase().replace(' ', '-')}`,
      name: `Grade ${grade} ${subject} - Intermediate`,
      description: `Intermediate complexity scenario for Grade ${grade} ${subject}`,
      grade,
      subject,
      complexity: 'intermediate',
      expectations,
      context: {
        academicYear: '2024-2025',
        term: 'Winter',
        unitTitle: `${subject} Unit Study`,
      },
    };
  }
  
  /**
   * Create an advanced complexity scenario
   */
  private static createAdvancedScenario(grade: number, subject: string): AITestScenario {
    const expectations = [
      this.createMockExpectation(grade, subject, 'advanced'),
      this.createMockExpectation(grade, subject, 'advanced', 2),
      this.createMockExpectation(grade, subject, 'advanced', 3),
    ];
    
    return {
      id: `advanced-${grade}-${subject.toLowerCase().replace(' ', '-')}`,
      name: `Grade ${grade} ${subject} - Advanced`,
      description: `Advanced complexity scenario for Grade ${grade} ${subject}`,
      grade,
      subject,
      complexity: 'advanced',
      expectations,
      context: {
        academicYear: '2024-2025',
        term: 'Spring',
        unitTitle: `Integrated ${subject} Project`,
        duration: 45,
        lessonNumber: 3,
      },
    };
  }
  
  /**
   * Create a mock curriculum expectation for testing
   */
  private static createMockExpectation(
    grade: number,
    subject: string,
    complexity: string,
    sequence = 1
  ): CurriculumExpectation {
    const subjectCodes = {
      'Mathematics': 'M',
      'Language Arts': 'LA',
      'Science': 'S',
      'Social Studies': 'SS',
    };
    
    const code = `${subjectCodes[subject as keyof typeof subjectCodes] || 'X'}${grade}.${complexity.charAt(0).toUpperCase()}.${sequence}`;
    
    return {
      id: `test-${code.toLowerCase()}`,
      code,
      description: `Test expectation for ${subject} grade ${grade} (${complexity} level ${sequence})`,
      strand: this.getStrandForSubject(subject),
      grade,
      subject,
      type: sequence === 1 ? 'overall' : 'specific',
      keywords: [subject.toLowerCase(), complexity, `grade-${grade}`],
    };
  }
  
  /**
   * Get appropriate strand for subject
   */
  private static getStrandForSubject(subject: string): string {
    const strands = {
      'Mathematics': 'Number Sense and Numeration',
      'Language Arts': 'Reading',
      'Science': 'Understanding Life Systems',
      'Social Studies': 'Heritage and Identity',
    };
    
    return strands[subject as keyof typeof strands] || 'General';
  }
}

// Helper functions for snapshot testing
export const snapshotHelpers = {
  /**
   * Create a deterministic snapshot filename
   */
  createSnapshotFilename(scenario: AITestScenario, endpoint: string): string {
    return `${endpoint}-${scenario.id}.snap.json`;
  },
  
  /**
   * Prepare content for snapshot comparison
   */
  prepareForSnapshot(content: any, scenario: AITestScenario): any {
    return {
      scenario: {
        id: scenario.id,
        name: scenario.name,
        grade: scenario.grade,
        subject: scenario.subject,
        complexity: scenario.complexity,
      },
      normalized: AIResponseNormalizer.normalizeForSnapshot(content),
      validation: AIContentValidator.validateContent(content, this.inferContentType(content)),
    };
  },
  
  /**
   * Infer content type from structure
   */
  inferContentType(content: any): keyof typeof AIContentValidator['REQUIRED_EDUCATIONAL_ELEMENTS'] {
    if (content.units) return 'longRangePlan';
    if (content.bigIdeas && content.essentialQuestions) return 'unitPlan';
    if (content.mindsOnDescription && content.actionDescription) return 'lessonPlan';
    if (content.weeklyBigIdeas) return 'daybook';
    return 'longRangePlan'; // Default fallback
  },
};