/**
 * AI Snapshot Normalizer for Teaching Engine 2.0
 * 
 * Specialized normalization functions for different types of AI responses
 * to ensure consistent snapshot testing.
 */

import { AITestScenario } from './aiTestUtils';

export interface NormalizedSnapshot {
  metadata: {
    testType: string;
    scenario: string;
    normalizedAt: string;
    version: string;
  };
  input: any;
  response: any;
  validation: {
    isValid: boolean;
    contentScore: number;
    structureScore: number;
    issues: string[];
    warnings: string[];
  };
}

/**
 * Advanced AI response normalizer with content-aware diff functions
 */
export class AISnapshotNormalizer {
  private static readonly NORMALIZATION_VERSION = '1.0.0';
  
  /**
   * Normalize a long-range plan response for snapshot testing
   */
  static normalizeLongRangePlan(response: any, scenario: AITestScenario, input: any): NormalizedSnapshot {
    const normalizedResponse = {
      units: AISnapshotNormalizer.normalizeUnits(response.units || []),
    };
    
    return AISnapshotNormalizer.createNormalizedSnapshot('long-range-plan', scenario, input, normalizedResponse);
  }
  
  /**
   * Normalize a unit plan response for snapshot testing
   */
  static normalizeUnitPlan(response: any, scenario: AITestScenario, input: any): NormalizedSnapshot {
    const normalizedResponse = {
      title: AISnapshotNormalizer.normalizeText(response.title),
      bigIdeas: AISnapshotNormalizer.normalizeStringArray(response.bigIdeas || []),
      essentialQuestions: AISnapshotNormalizer.normalizeStringArray(response.essentialQuestions || []),
      learningGoals: AISnapshotNormalizer.normalizeStringArray(response.learningGoals || []),
      successCriteria: AISnapshotNormalizer.normalizeStringArray(response.successCriteria || []),
      assessmentFor: AISnapshotNormalizer.normalizeStringArray(response.assessmentFor || []),
      assessmentAs: AISnapshotNormalizer.normalizeStringArray(response.assessmentAs || []),
      assessmentOf: AISnapshotNormalizer.normalizeStringArray(response.assessmentOf || []),
      crossCurricularLinks: AISnapshotNormalizer.normalizeStringArray(response.crossCurricularLinks || []),
      timelineEstimateWeeks: AISnapshotNormalizer.normalizeNumber(response.timelineEstimateWeeks),
    };
    
    return AISnapshotNormalizer.createNormalizedSnapshot('unit-plan', scenario, input, normalizedResponse);
  }
  
  /**
   * Normalize a lesson plan response for snapshot testing
   */
  static normalizeLessonPlan(response: any, scenario: AITestScenario, input: any): NormalizedSnapshot {
    const normalizedResponse = {
      title: AISnapshotNormalizer.normalizeText(response.title),
      learningGoals: AISnapshotNormalizer.normalizeStringArray(response.learningGoals || []),
      successCriteria: AISnapshotNormalizer.normalizeStringArray(response.successCriteria || []),
      mindsOn: {
        description: AISnapshotNormalizer.normalizeText(response.mindsOnDescription),
        duration: AISnapshotNormalizer.normalizeNumber(response.mindsOnDuration),
      },
      action: {
        description: AISnapshotNormalizer.normalizeText(response.actionDescription),
        duration: AISnapshotNormalizer.normalizeNumber(response.actionDuration),
      },
      consolidation: {
        description: AISnapshotNormalizer.normalizeText(response.consolidationDescription),
        duration: AISnapshotNormalizer.normalizeNumber(response.consolidationDuration),
      },
      resources: AISnapshotNormalizer.normalizeStringArray(response.resources || []),
      accommodations: AISnapshotNormalizer.normalizeText(response.accommodations),
      assessmentStrategy: AISnapshotNormalizer.normalizeText(response.assessmentStrategy),
    };
    
    return AISnapshotNormalizer.createNormalizedSnapshot('lesson-plan', scenario, input, normalizedResponse);
  }
  
  /**
   * Normalize a daybook response for snapshot testing
   */
  static normalizeDaybook(response: any, scenario: AITestScenario, input: any): NormalizedSnapshot {
    const normalizedResponse = {
      weeklyBigIdeas: AISnapshotNormalizer.normalizeStringArray(response.weeklyBigIdeas || []),
      dailyReflectionPrompts: AISnapshotNormalizer.normalizeStringArray(response.dailyReflectionPrompts || []),
      substituteNotes: AISnapshotNormalizer.normalizeText(response.substituteNotes),
      weeklyInsights: AISnapshotNormalizer.normalizeText(response.weeklyInsights),
    };
    
    return AISnapshotNormalizer.createNormalizedSnapshot('daybook', scenario, input, normalizedResponse);
  }
  
  /**
   * Create a normalized snapshot with metadata and validation
   */
  private static createNormalizedSnapshot(
    testType: string,
    scenario: AITestScenario,
    input: any,
    response: any
  ): NormalizedSnapshot {
    // Normalize input
    const normalizedInput = AISnapshotNormalizer.normalizeInput(input);
    
    // Validate response quality
    const validation = AISnapshotNormalizer.validateResponse(response, testType);
    
    return {
      metadata: {
        testType,
        scenario: scenario.id,
        normalizedAt: '[NORMALIZED_TIMESTAMP]', // Always use placeholder
        version: AISnapshotNormalizer.NORMALIZATION_VERSION,
      },
      input: normalizedInput,
      response,
      validation,
    };
  }
  
  /**
   * Normalize array of units for long-range plans
   */
  private static normalizeUnits(units: any[]): any[] {
    return units.map(unit => ({
      title: AISnapshotNormalizer.normalizeText(unit.title),
      term: AISnapshotNormalizer.normalizeText(unit.term),
      expectedDurationWeeks: AISnapshotNormalizer.normalizeNumber(unit.expectedDurationWeeks),
      bigIdeas: AISnapshotNormalizer.normalizeStringArray(unit.bigIdeas || []),
      linkedExpectations: AISnapshotNormalizer.normalizeExpectations(unit.linkedExpectations || []),
    }));
  }
  
  /**
   * Normalize curriculum expectations
   */
  private static normalizeExpectations(expectations: any[]): any[] {
    return expectations
      .map(exp => ({
        code: AISnapshotNormalizer.normalizeText(exp.code),
        type: exp.type === 'overall' || exp.type === 'specific' ? exp.type : 'specific',
      }))
      .sort((a, b) => a.code.localeCompare(b.code)); // Sort for consistency
  }
  
  /**
   * Normalize text content
   */
  private static normalizeText(text: any): string {
    if (typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/…/g, '...') // Normalize ellipsis
      .replace(/–/g, '-') // Normalize en-dash
      .replace(/—/g, '--') // Normalize em-dash
      .replace(/\d{4}-\d{2}-\d{2}/g, '[DATE]') // Normalize dates
      .replace(/\b\d{1,2}:\d{2}\s?(AM|PM|am|pm)?\b/g, '[TIME]') // Normalize times
      .replace(/\bweek \d+/gi, 'week [N]') // Normalize week references
      .replace(/\bday \d+/gi, 'day [N]') // Normalize day references
      .replace(/\bunit \d+/gi, 'unit [N]') // Normalize unit references
      .replace(/\blesson \d+/gi, 'lesson [N]'); // Normalize lesson references
  }
  
  /**
   * Normalize array of strings
   */
  private static normalizeStringArray(array: any[]): string[] {
    if (!Array.isArray(array)) return [];
    
    return array
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => AISnapshotNormalizer.normalizeText(item))
      .sort(); // Sort for consistency
  }
  
  /**
   * Normalize numeric values
   */
  private static normalizeNumber(value: any): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
    return 0;
  }
  
  /**
   * Normalize input parameters
   */
  private static normalizeInput(input: any): any {
    if (!input || typeof input !== 'object') return {};
    
    const normalized: any = {};
    
    // Copy non-variable fields
    const stableFields = [
      'subject', 'grade', 'academicYear', 'termStructure',
      'unitTitle', 'duration', 'lessonNumber'
    ];
    
    for (const field of stableFields) {
      if (input[field] !== undefined) {
        normalized[field] = input[field];
      }
    }
    
    // Normalize expectations array
    if (input.expectations && Array.isArray(input.expectations)) {
      normalized.expectations = input.expectations.map((exp: any) => ({
        code: exp.code,
        subject: exp.subject,
        grade: exp.grade,
        strand: exp.strand,
        type: exp.type,
      }));
    }
    
    if (input.expectationIds && Array.isArray(input.expectationIds)) {
      normalized.expectationIds = [...input.expectationIds].sort();
    }
    
    return normalized;
  }
  
  /**
   * Validate response structure and content quality
   */
  private static validateResponse(response: any, testType: string): any {
    const validation = {
      isValid: true,
      contentScore: 100,
      structureScore: 100,
      issues: [] as string[],
      warnings: [] as string[],
    };
    
    // Validate required structure based on test type
    const structureValidation = AISnapshotNormalizer.validateStructure(response, testType);
    validation.structureScore = structureValidation.score;
    validation.issues.push(...structureValidation.issues);
    validation.warnings.push(...structureValidation.warnings);
    
    // Validate content quality
    const contentValidation = AISnapshotNormalizer.validateContentQuality(response);
    validation.contentScore = contentValidation.score;
    validation.warnings.push(...contentValidation.warnings);
    
    // Overall validity
    validation.isValid = validation.issues.length === 0;
    
    return validation;
  }
  
  /**
   * Validate response structure for specific test types
   */
  private static validateStructure(response: any, testType: string): any {
    const validation = { score: 100, issues: [] as string[], warnings: [] as string[] };
    
    switch (testType) {
      case 'long-range-plan':
        if (!response.units || !Array.isArray(response.units)) {
          validation.issues.push('Missing or invalid units array');
          validation.score -= 50;
        } else if (response.units.length === 0) {
          validation.warnings.push('No units generated');
          validation.score -= 20;
        }
        break;
        
      case 'unit-plan':
        const requiredFields = ['title', 'bigIdeas', 'learningGoals', 'successCriteria'];
        for (const field of requiredFields) {
          if (!response[field]) {
            validation.issues.push(`Missing required field: ${field}`);
            validation.score -= 25;
          }
        }
        break;
        
      case 'lesson-plan':
        const lessonFields = ['title', 'learningGoals', 'mindsOn', 'action', 'consolidation'];
        for (const field of lessonFields) {
          if (!response[field]) {
            validation.issues.push(`Missing required field: ${field}`);
            validation.score -= 20;
          }
        }
        break;
        
      case 'daybook':
        const daybookFields = ['weeklyBigIdeas', 'dailyReflectionPrompts', 'substituteNotes'];
        for (const field of daybookFields) {
          if (!response[field]) {
            validation.issues.push(`Missing required field: ${field}`);
            validation.score -= 30;
          }
        }
        break;
    }
    
    return validation;
  }
  
  /**
   * Validate general content quality
   */
  private static validateContentQuality(response: any): any {
    const validation = { score: 100, warnings: [] as string[] };
    
    // Check for empty or minimal content
    const stringFields = AISnapshotNormalizer.extractStringFields(response);
    const emptyFields = stringFields.filter(field => field.length < 10);
    
    if (emptyFields.length > 0) {
      validation.warnings.push(`${emptyFields.length} fields have minimal content`);
      validation.score -= emptyFields.length * 5;
    }
    
    // Check for educational appropriateness
    const allText = stringFields.join(' ').toLowerCase();
    if (AISnapshotNormalizer.hasInappropriateContent(allText)) {
      validation.warnings.push('Content may contain inappropriate material');
      validation.score -= 25;
    }
    
    // Check for repetitive content
    if (AISnapshotNormalizer.hasExcessiveRepetition(allText)) {
      validation.warnings.push('Content appears repetitive');
      validation.score -= 15;
    }
    
    return validation;
  }
  
  /**
   * Extract all string fields from response
   */
  private static extractStringFields(obj: any): string[] {
    const strings: string[] = [];
    
    const extract = (value: any) => {
      if (typeof value === 'string') {
        strings.push(value);
      } else if (Array.isArray(value)) {
        value.forEach(extract);
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach(extract);
      }
    };
    
    extract(obj);
    return strings;
  }
  
  /**
   * Check for inappropriate content patterns
   */
  private static hasInappropriateContent(text: string): boolean {
    const inappropriatePatterns = [
      /\b(violence|violent|kill|death|murder)\b/gi,
      /\b(inappropriate|adult|mature)\b/gi,
      /\b(hate|discrimination|bias)\b/gi,
    ];
    
    return inappropriatePatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check for excessive repetition
   */
  private static hasExcessiveRepetition(text: string): boolean {
    const words = text.match(/\b\w{4,}\b/g) || [];
    if (words.length < 20) return false;
    
    const wordCounts = new Map<string, number>();
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
    
    // Check if any word appears more than 15% of the time
    const threshold = words.length * 0.15;
    return Array.from(wordCounts.values()).some(count => count > threshold);
  }
}

/**
 * Content-aware diff function for AI responses
 */
export class AIContentDiffer {
  /**
   * Generate a semantic diff between two AI responses
   */
  static generateSemanticDiff(expected: NormalizedSnapshot, actual: NormalizedSnapshot): ContentDiff {
    const diff: ContentDiff = {
      type: expected.metadata.testType,
      hasChanges: false,
      structuralChanges: [],
      contentChanges: [],
      qualityChanges: [],
      summary: '',
    };
    
    // Compare structure
    const structuralDiff = AISnapshotNormalizer.compareStructure(expected.response, actual.response);
    diff.structuralChanges = structuralDiff;
    
    // Compare content semantically
    const contentDiff = AISnapshotNormalizer.compareContent(expected.response, actual.response);
    diff.contentChanges = contentDiff;
    
    // Compare quality metrics
    const qualityDiff = AISnapshotNormalizer.compareQuality(expected.validation, actual.validation);
    diff.qualityChanges = qualityDiff;
    
    // Determine if there are significant changes
    diff.hasChanges = diff.structuralChanges.length > 0 || 
                     diff.contentChanges.length > 0 || 
                     diff.qualityChanges.length > 0;
    
    // Generate summary
    diff.summary = AISnapshotNormalizer.generateDiffSummary(diff);
    
    return diff;
  }
  
  /**
   * Compare structural differences
   */
  private static compareStructure(expected: any, actual: any): StructuralChange[] {
    const changes: StructuralChange[] = [];
    
    // Compare keys
    const expectedKeys = new Set(Object.keys(expected));
    const actualKeys = new Set(Object.keys(actual));
    
    // Find added/removed keys
    for (const key of expectedKeys) {
      if (!actualKeys.has(key)) {
        changes.push({
          type: 'removed',
          path: key,
          description: `Field '${key}' was removed`,
        });
      }
    }
    
    for (const key of actualKeys) {
      if (!expectedKeys.has(key)) {
        changes.push({
          type: 'added',
          path: key,
          description: `Field '${key}' was added`,
        });
      }
    }
    
    // Compare array lengths
    for (const key of expectedKeys) {
      if (actualKeys.has(key)) {
        const expectedValue = expected[key];
        const actualValue = actual[key];
        
        if (Array.isArray(expectedValue) && Array.isArray(actualValue)) {
          if (expectedValue.length !== actualValue.length) {
            changes.push({
              type: 'modified',
              path: key,
              description: `Array '${key}' length changed from ${expectedValue.length} to ${actualValue.length}`,
            });
          }
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Compare content semantically
   */
  private static compareContent(expected: any, actual: any): ContentChange[] {
    const changes: ContentChange[] = [];
    
    // This is a simplified semantic comparison
    // In a production system, you might use NLP libraries for better semantic analysis
    
    const compareObjects = (exp: any, act: any, path = '') => {
      if (typeof exp === 'string' && typeof act === 'string') {
        const similarity = AISnapshotNormalizer.calculateStringSimilarity(exp, act);
        if (similarity < 0.8) { // Less than 80% similar
          changes.push({
            type: 'content',
            path,
            similarity,
            description: `Content changed with ${Math.round(similarity * 100)}% similarity`,
            expected: exp,
            actual: act,
          });
        }
      } else if (Array.isArray(exp) && Array.isArray(act)) {
        // Compare arrays element by element
        const maxLength = Math.max(exp.length, act.length);
        for (let i = 0; i < maxLength; i++) {
          if (i < exp.length && i < act.length) {
            compareObjects(exp[i], act[i], `${path}[${i}]`);
          }
        }
      } else if (typeof exp === 'object' && typeof act === 'object' && exp && act) {
        // Compare object properties
        const allKeys = new Set([...Object.keys(exp), ...Object.keys(act)]);
        for (const key of allKeys) {
          if (exp[key] !== undefined && act[key] !== undefined) {
            compareObjects(exp[key], act[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };
    
    compareObjects(expected, actual);
    return changes;
  }
  
  /**
   * Compare quality metrics
   */
  private static compareQuality(expected: any, actual: any): QualityChange[] {
    const changes: QualityChange[] = [];
    
    if (expected.contentScore !== actual.contentScore) {
      changes.push({
        type: 'score',
        metric: 'contentScore',
        expected: expected.contentScore,
        actual: actual.contentScore,
        change: actual.contentScore - expected.contentScore,
      });
    }
    
    if (expected.structureScore !== actual.structureScore) {
      changes.push({
        type: 'score',
        metric: 'structureScore',
        expected: expected.structureScore,
        actual: actual.structureScore,
        change: actual.structureScore - expected.structureScore,
      });
    }
    
    return changes;
  }
  
  /**
   * Calculate string similarity using a simple algorithm
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // Use Levenshtein distance for similarity calculation
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }
  
  /**
   * Generate a summary of the diff
   */
  private static generateDiffSummary(diff: ContentDiff): string {
    const parts: string[] = [];
    
    if (diff.structuralChanges.length > 0) {
      parts.push(`${diff.structuralChanges.length} structural change(s)`);
    }
    
    if (diff.contentChanges.length > 0) {
      parts.push(`${diff.contentChanges.length} content change(s)`);
    }
    
    if (diff.qualityChanges.length > 0) {
      const qualityImpact = diff.qualityChanges.reduce((sum, change) => sum + change.change, 0);
      parts.push(`quality ${qualityImpact > 0 ? 'improved' : 'degraded'} by ${Math.abs(qualityImpact)} points`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No significant changes detected';
  }
}

// Type definitions for diff results
export interface ContentDiff {
  type: string;
  hasChanges: boolean;
  structuralChanges: StructuralChange[];
  contentChanges: ContentChange[];
  qualityChanges: QualityChange[];
  summary: string;
}

export interface StructuralChange {
  type: 'added' | 'removed' | 'modified';
  path: string;
  description: string;
}

export interface ContentChange {
  type: 'content';
  path: string;
  similarity: number;
  description: string;
  expected: string;
  actual: string;
}

export interface QualityChange {
  type: 'score';
  metric: string;
  expected: number;
  actual: number;
  change: number;
}