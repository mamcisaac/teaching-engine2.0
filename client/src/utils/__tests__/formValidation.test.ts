/**
 * @file formValidation.test.ts
 * @description Comprehensive tests for form validation utilities including unit plan validation,
 * lesson plan validation, field validation, and file validation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateUnitPlan,
  validateLessonPlan,
  validateExpectationSelection,
  validateField,
  validateEmail,
  validatePhoneNumber,
  sanitizeHTML,
  validateFile,
} from '../formValidation';

// Mock form data types (simplified)
interface MockUnitPlanFormData {
  title?: string;
  longRangePlanId?: number;
  startDate?: string;
  endDate?: string;
  expectationIds?: string[];
  estimatedHours?: number;
  description?: string;
  essentialQuestions?: string[];
  successCriteria?: string[];
}

interface MockLessonPlanFormData {
  title?: string;
  unitPlanId?: number;
  date?: string;
  duration?: number;
  expectationIds?: string[];
  learningGoals?: string;
  mindsOn?: string;
  action?: string;
  consolidation?: string;
  materials?: string[];
}

describe('validateUnitPlan', () => {
  const createValidUnitPlan = (): MockUnitPlanFormData => ({
    title: 'Test Unit Plan',
    longRangePlanId: 1,
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    expectationIds: ['B1.1', 'B1.2'],
    estimatedHours: 20,
    description: 'Test description',
    essentialQuestions: ['What is math?', 'How do we solve problems?'],
    successCriteria: ['Students can add', 'Students can subtract'],
  });

  it('should validate a complete unit plan', () => {
    const data = createValidUnitPlan();
    const result = validateUnitPlan(data as any);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  describe('Required field validation', () => {
    it('should require title', () => {
      const data = createValidUnitPlan();
      data.title = '';

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Unit title is required');
    });

    it('should require long range plan ID', () => {
      const data = createValidUnitPlan();
      data.longRangePlanId = undefined;

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.longRangePlanId).toBe('Long-range plan selection is required');
    });

    it('should require start date', () => {
      const data = createValidUnitPlan();
      data.startDate = '';

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.startDate).toBe('Start date is required');
    });

    it('should require end date', () => {
      const data = createValidUnitPlan();
      data.endDate = '';

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toBe('End date is required');
    });
  });

  describe('Date validation', () => {
    it('should reject end date before start date', () => {
      const data = createValidUnitPlan();
      data.startDate = '2023-12-31';
      data.endDate = '2023-12-01';

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toBe('End date must be after start date');
    });

    it('should reject start date too far in past', () => {
      const data = createValidUnitPlan();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 2);
      data.startDate = oneYearAgo.toISOString().split('T')[0];

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.startDate).toBe('Start date cannot be more than one year in the past');
    });

    it('should reject end date too far in future', () => {
      const data = createValidUnitPlan();
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 3);
      data.endDate = twoYearsFromNow.toISOString().split('T')[0];

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toBe('End date cannot be more than two years in the future');
    });

    it('should accept same start and end date', () => {
      const data = createValidUnitPlan();
      data.startDate = '2023-12-15';
      data.endDate = '2023-12-15';

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Expectation validation', () => {
    it('should require at least one expectation', () => {
      const data = createValidUnitPlan();
      data.expectationIds = [];

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.expectationIds).toBe(
        'At least one curriculum expectation must be selected',
      );
    });

    it('should require expectation IDs to be defined', () => {
      const data = createValidUnitPlan();
      data.expectationIds = undefined;

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.expectationIds).toBe(
        'At least one curriculum expectation must be selected',
      );
    });
  });

  describe('Duration validation', () => {
    it('should require positive estimated hours', () => {
      const data = createValidUnitPlan();
      data.estimatedHours = 0;

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.estimatedHours).toBe('Estimated hours must be greater than 0');
    });

    it('should reject unreasonably high hours', () => {
      const data = createValidUnitPlan();
      data.estimatedHours = 600;

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.estimatedHours).toBe(
        'Estimated hours seems unreasonably high (max 500)',
      );
    });

    it('should handle undefined estimated hours', () => {
      const data = createValidUnitPlan();
      data.estimatedHours = undefined;

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.estimatedHours).toBe('Estimated hours must be greater than 0');
    });
  });

  describe('Content validation', () => {
    it('should limit title length', () => {
      const data = createValidUnitPlan();
      data.title = 'a'.repeat(201);

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title must be 200 characters or less');
    });

    it('should limit description length', () => {
      const data = createValidUnitPlan();
      data.description = 'a'.repeat(2001);

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('Description must be 2000 characters or less');
    });

    it('should require meaningful essential questions', () => {
      const data = createValidUnitPlan();
      data.essentialQuestions = ['', '   ', '\t'];

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.essentialQuestions).toBe('At least one essential question is required');
    });

    it('should require meaningful success criteria', () => {
      const data = createValidUnitPlan();
      data.successCriteria = ['', '   '];

      const result = validateUnitPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.successCriteria).toBe('At least one success criteria is required');
    });
  });
});

describe('validateLessonPlan', () => {
  const createValidLessonPlan = (): MockLessonPlanFormData => ({
    title: 'Test Lesson',
    unitPlanId: 1,
    date: '2023-12-15',
    duration: 60,
    expectationIds: ['B1.1'],
    learningGoals: 'Students will learn fractions',
    mindsOn: 'Review previous learning',
    action: 'Main instruction',
    consolidation: 'Summary and practice',
    materials: ['whiteboard', 'worksheets'],
  });

  it('should validate a complete lesson plan', () => {
    const data = createValidLessonPlan();
    const result = validateLessonPlan(data as any);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  describe('Required field validation', () => {
    it('should require title', () => {
      const data = createValidLessonPlan();
      data.title = '';

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Lesson title is required');
    });

    it('should require unit plan ID', () => {
      const data = createValidLessonPlan();
      data.unitPlanId = undefined;

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.unitPlanId).toBe('Unit plan selection is required');
    });

    it('should require date', () => {
      const data = createValidLessonPlan();
      data.date = '';

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.date).toBe('Date is required');
    });
  });

  describe('Date validation', () => {
    it('should reject date too far in past', () => {
      const data = createValidLessonPlan();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 2);
      data.date = oneYearAgo.toISOString().split('T')[0];

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.date).toBe('Lesson date cannot be more than one year in the past');
    });

    it('should reject date too far in future', () => {
      const data = createValidLessonPlan();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 2);
      data.date = oneYearFromNow.toISOString().split('T')[0];

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.date).toBe('Lesson date cannot be more than one year in the future');
    });
  });

  describe('Duration validation', () => {
    it('should require positive duration', () => {
      const data = createValidLessonPlan();
      data.duration = 0;

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.duration).toBe('Duration must be greater than 0 minutes');
    });

    it('should reject excessive duration', () => {
      const data = createValidLessonPlan();
      data.duration = 500;

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.duration).toBe('Duration cannot exceed 480 minutes (8 hours)');
    });
  });

  describe('Expectation validation', () => {
    it('should require at least one expectation', () => {
      const data = createValidLessonPlan();
      data.expectationIds = [];

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.expectationIds).toBe(
        'At least one curriculum expectation must be selected',
      );
    });
  });

  describe('Lesson structure validation', () => {
    it('should require at least one lesson component', () => {
      const data = createValidLessonPlan();
      data.mindsOn = '';
      data.action = '';
      data.consolidation = '';

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.lessonStructure).toBe(
        'At least one lesson component (Minds On, Action, or Consolidation) must have content',
      );
    });

    it('should pass with only minds on content', () => {
      const data = createValidLessonPlan();
      data.action = '';
      data.consolidation = '';

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Content length validation', () => {
    it('should limit title length', () => {
      const data = createValidLessonPlan();
      data.title = 'a'.repeat(201);

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title must be 200 characters or less');
    });

    it('should limit learning goals length', () => {
      const data = createValidLessonPlan();
      data.learningGoals = 'a'.repeat(1001);

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.learningGoals).toBe('Learning goals must be 1000 characters or less');
    });
  });

  describe('Materials validation', () => {
    it('should require at least one material', () => {
      const data = createValidLessonPlan();
      data.materials = [];

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.materials).toBe('At least one material or resource is required');
    });

    it('should require meaningful materials', () => {
      const data = createValidLessonPlan();
      data.materials = ['', '   ', '\t'];

      const result = validateLessonPlan(data as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.materials).toBe('At least one material or resource is required');
    });
  });
});

describe('validateExpectationSelection', () => {
  it('should validate unit context', () => {
    const result = validateExpectationSelection(['B1.1', 'B1.2'], 'unit');

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should validate lesson context', () => {
    const result = validateExpectationSelection(['B1.1'], 'lesson');

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should require at least one expectation', () => {
    const result = validateExpectationSelection([], 'unit');

    expect(result.isValid).toBe(false);
    expect(result.errors.expectationIds).toBe(
      'At least one curriculum expectation must be selected for this unit',
    );
  });

  it('should limit number of expectations', () => {
    const tooManyExpectations = Array.from({ length: 25 }, (_, i) => `B1.${i + 1}`);
    const result = validateExpectationSelection(tooManyExpectations, 'lesson');

    expect(result.isValid).toBe(false);
    expect(result.errors.expectationIds).toBe(
      'Too many expectations selected. Consider limiting to 20 or fewer for a lesson',
    );
  });

  it('should default to unit context', () => {
    const result = validateExpectationSelection([]);

    expect(result.isValid).toBe(false);
    expect(result.errors.expectationIds).toContain('unit');
  });
});

describe('validateField', () => {
  describe('Title validation', () => {
    it('should validate valid title', () => {
      expect(validateField('title', 'Valid Title', 'unit')).toBeNull();
    });

    it('should require title', () => {
      expect(validateField('title', '', 'unit')).toBe('Title is required');
      expect(validateField('title', '   ', 'unit')).toBe('Title is required');
    });

    it('should limit title length', () => {
      const longTitle = 'a'.repeat(201);
      expect(validateField('title', longTitle, 'unit')).toBe(
        'Title must be 200 characters or less',
      );
    });
  });

  describe('Date validation', () => {
    it('should validate valid dates', () => {
      expect(validateField('startDate', '2023-12-01', 'unit')).toBeNull();
      expect(validateField('endDate', '2023-12-31', 'unit')).toBeNull();
      expect(validateField('date', '2023-12-15', 'lesson')).toBeNull();
    });

    it('should require dates', () => {
      expect(validateField('startDate', '', 'unit')).toBe('Date is required');
      expect(validateField('date', null, 'lesson')).toBe('Date is required');
    });

    it('should validate date format', () => {
      expect(validateField('date', 'invalid-date', 'lesson')).toBe('Invalid date format');
    });
  });

  describe('Numeric validation', () => {
    it('should validate estimated hours', () => {
      expect(validateField('estimatedHours', 20, 'unit')).toBeNull();
      expect(validateField('estimatedHours', '30', 'unit')).toBeNull();
    });

    it('should require positive estimated hours', () => {
      expect(validateField('estimatedHours', 0, 'unit')).toBe('Must be greater than 0');
      expect(validateField('estimatedHours', -5, 'unit')).toBe('Must be greater than 0');
    });

    it('should limit estimated hours', () => {
      expect(validateField('estimatedHours', 600, 'unit')).toBe(
        'Seems unreasonably high (max 500)',
      );
    });

    it('should validate duration', () => {
      expect(validateField('duration', 60, 'lesson')).toBeNull();
      expect(validateField('duration', '90', 'lesson')).toBeNull();
    });

    it('should require positive duration', () => {
      expect(validateField('duration', 0, 'lesson')).toBe('Duration must be greater than 0');
    });

    it('should limit duration', () => {
      expect(validateField('duration', 500, 'lesson')).toBe('Cannot exceed 480 minutes (8 hours)');
    });
  });

  describe('Expectation IDs validation', () => {
    it('should validate expectation arrays', () => {
      expect(validateField('expectationIds', ['B1.1', 'B1.2'], 'unit')).toBeNull();
    });

    it('should require at least one expectation', () => {
      expect(validateField('expectationIds', [], 'unit')).toBe(
        'At least one curriculum expectation must be selected for this unit',
      );
    });

    it('should limit number of expectations', () => {
      const tooMany = Array.from({ length: 25 }, (_, i) => `B1.${i + 1}`);
      expect(validateField('expectationIds', tooMany, 'lesson')).toBe(
        'Too many expectations selected. Consider limiting to 20 or fewer for a lesson',
      );
    });
  });

  it('should return null for unknown fields', () => {
    expect(validateField('unknownField', 'value', 'unit')).toBeNull();
  });
});

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'user123@sub.domain.com',
    ];

    validEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'invalid.email',
      '@domain.com',
      'user@',
      'user@@domain.com',
      'user@domain',
      '',
      'user name@domain.com',
    ];

    invalidEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(false);
    });
  });
});

describe('validatePhoneNumber', () => {
  it('should validate North American phone numbers', () => {
    const validPhones = [
      '(555) 123-4567',
      '555-123-4567',
      '555.123.4567',
      '555 123 4567',
      '5551234567',
      '+1 555 123 4567',
      '1-555-123-4567',
    ];

    validPhones.forEach((phone) => {
      expect(validatePhoneNumber(phone)).toBe(true);
    });
  });

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '123',
      '555-123-456',
      '555-123-45678',
      'abc-def-ghij',
      '',
      '55512345678',
    ];

    invalidPhones.forEach((phone) => {
      expect(validatePhoneNumber(phone)).toBe(false);
    });
  });
});

describe('sanitizeHTML', () => {
  it('should remove script tags', () => {
    const input = '<p>Safe content</p><script>alert("xss")</script>';
    const result = sanitizeHTML(input);

    expect(result).toBe('<p>Safe content</p>');
    expect(result).not.toContain('<script>');
  });

  it('should remove dangerous attributes', () => {
    const input = '<button onclick="alert(\'xss\')">Click me</button>';
    const result = sanitizeHTML(input);

    expect(result).toBe('<button>Click me</button>');
    expect(result).not.toContain('onclick');
  });

  it('should remove javascript: URLs', () => {
    const input = '<a href="javascript:alert(\'xss\')">Link</a>';
    const result = sanitizeHTML(input);

    expect(result).toBe('<a href="">Link</a>');
    expect(result).not.toContain('javascript:');
  });

  it('should handle multiple script tags', () => {
    const input = '<script>bad1()</script><p>Good</p><script>bad2()</script>';
    const result = sanitizeHTML(input);

    expect(result).toBe('<p>Good</p>');
  });

  it('should preserve safe HTML', () => {
    const input = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p>';
    const result = sanitizeHTML(input);

    expect(result).toBe(input);
  });
});

describe('validateFile', () => {
  const createMockFile = (name: string, type: string, size: number): File => {
    const file = new File(['content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('should validate allowed file types', () => {
    const file = createMockFile('test.pdf', 'application/pdf', 1000);
    const result = validateFile(file);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should validate file size within limits', () => {
    const file = createMockFile('test.jpg', 'image/jpeg', 5 * 1024 * 1024); // 5MB
    const result = validateFile(file);

    expect(result.isValid).toBe(true);
  });

  it('should reject disallowed file types', () => {
    const file = createMockFile('test.exe', 'application/x-executable', 1000);
    const result = validateFile(file);

    expect(result.isValid).toBe(false);
    expect(result.errors.fileType).toContain('File type not allowed');
  });

  it('should reject files that are too large', () => {
    const file = createMockFile('test.pdf', 'application/pdf', 15 * 1024 * 1024); // 15MB
    const result = validateFile(file);

    expect(result.isValid).toBe(false);
    expect(result.errors.fileSize).toContain('File size too large');
  });

  it('should use custom allowed types', () => {
    const file = createMockFile('test.txt', 'text/plain', 1000);
    const result = validateFile(file, ['text/plain'], 10 * 1024 * 1024);

    expect(result.isValid).toBe(true);
  });

  it('should use custom size limits', () => {
    const file = createMockFile('test.pdf', 'application/pdf', 2 * 1024 * 1024); // 2MB
    const result = validateFile(file, undefined, 1 * 1024 * 1024); // 1MB limit

    expect(result.isValid).toBe(false);
    expect(result.errors.fileSize).toContain('Maximum size: 1MB');
  });

  it('should handle multiple validation errors', () => {
    const file = createMockFile('test.exe', 'application/x-executable', 15 * 1024 * 1024);
    const result = validateFile(file);

    expect(result.isValid).toBe(false);
    expect(result.errors.fileType).toBeTruthy();
    expect(result.errors.fileSize).toBeTruthy();
  });
});

describe('Edge cases and error handling', () => {
  it('should handle null/undefined inputs gracefully', () => {
    expect(validateField('title', null, 'unit')).toBe('Title is required');
    expect(validateField('title', undefined, 'unit')).toBe('Title is required');
    expect(validateEmail('')).toBe(false);
    expect(validatePhoneNumber('')).toBe(false);
  });

  it('should handle whitespace-only strings', () => {
    expect(validateField('title', '   ', 'unit')).toBe('Title is required');
    expect(validateField('title', '\t\n', 'unit')).toBe('Title is required');
  });

  it('should handle non-string inputs for string validation', () => {
    expect(validateField('title', 123 as any, 'unit')).toBeNull(); // Should handle number conversion
    expect(validateField('title', {} as any, 'unit')).toBe('Title is required'); // Object toString
  });

  it('should handle very large numbers', () => {
    expect(validateField('estimatedHours', Number.MAX_SAFE_INTEGER, 'unit')).toBe(
      'Seems unreasonably high (max 500)',
    );
    expect(validateField('duration', Number.MAX_SAFE_INTEGER, 'lesson')).toBe(
      'Cannot exceed 480 minutes (8 hours)',
    );
  });

  it('should handle negative numbers appropriately', () => {
    expect(validateField('estimatedHours', -1, 'unit')).toBe('Must be greater than 0');
    expect(validateField('duration', -30, 'lesson')).toBe('Duration must be greater than 0');
  });
});
