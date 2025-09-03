import { describe, it, expect } from 'vitest';

// Updated type guards with unique field checks for each type
// These match the implementation in CascadeDetailPanel.tsx

const isCurriculumData = (data: any): boolean => {
  return typeof data === 'object' && data !== null && 'id' in data &&
         ('code' in data || 'strand' in data || 'coverage' in data || 
          ('subject' in data && 'description' in data));
};

const isLRPData = (data: any): boolean => {
  return typeof data === 'object' && data !== null && 'id' in data &&
         ('academicYear' in data || 'goals' in data || 'themes' in data);
};

const isUnitData = (data: any): boolean => {
  return typeof data === 'object' && data !== null && 'id' in data &&
         ('hoursAllocated' in data || 'weeks' in data || 'bigIdeas' in data || 
          'essentialQuestions' in data || 'estimatedHours' in data);
};

const isLessonData = (data: any): boolean => {
  return typeof data === 'object' && data !== null && 'id' in data &&
         ('duration' in data || 'isComplete' in data || 
          ('title' in data && !('hoursAllocated' in data) && !('academicYear' in data) && 
           !('weeks' in data) && !('bigIdeas' in data) && !('themes' in data)));
};

const isDaybookData = (data: any): boolean => {
  return typeof data === 'object' && data !== null && 'id' in data &&
         'date' in data && typeof data.date === 'string';
};

describe('Type Guards', () => {
  describe('isCurriculumData', () => {
    it('validates valid curriculum data with code', () => {
      const data = {
        id: '1',
        code: 'CURR-001',
        subject: 'Math'
      };
      expect(isCurriculumData(data)).toBe(true);
    });

    it('validates valid curriculum data with description', () => {
      const data = {
        id: '1',
        description: 'Math curriculum',
        subject: 'Math'
      };
      expect(isCurriculumData(data)).toBe(true);
    });

    it('rejects data without id', () => {
      const data = {
        code: 'CURR-001',
        description: 'Math curriculum'
      };
      expect(isCurriculumData(data)).toBe(false);
    });

    it('rejects data without code or description', () => {
      const data = {
        id: '1',
        subject: 'Math'
      };
      expect(isCurriculumData(data)).toBe(false);
    });

    it('rejects null and undefined', () => {
      expect(isCurriculumData(null)).toBe(false);
      expect(isCurriculumData(undefined)).toBe(false);
    });

    it('rejects non-objects', () => {
      expect(isCurriculumData('string')).toBe(false);
      expect(isCurriculumData(123)).toBe(false);
      expect(isCurriculumData([])).toBe(false);
    });
  });

  describe('isLRPData', () => {
    it('validates data with academicYear', () => {
      const data = {
        id: '1',
        academicYear: '2024-2025',
        title: 'Long Range Plan'
      };
      expect(isLRPData(data)).toBe(true);
    });

    it('validates data with goals', () => {
      const data = {
        id: '1',
        goals: ['Goal 1', 'Goal 2']
      };
      expect(isLRPData(data)).toBe(true);
    });

    it('validates data with themes', () => {
      const data = {
        id: '1',
        themes: ['Theme 1']
      };
      expect(isLRPData(data)).toBe(true);
    });

    it('rejects data without unique LRP fields', () => {
      const data = {
        id: '1',
        title: 'Some title',
        description: 'Some description'
      };
      expect(isLRPData(data)).toBe(false);
    });
  });

  describe('isUnitData', () => {
    it('validates unit data with hoursAllocated', () => {
      const data = {
        id: '1',
        title: 'Unit 1',
        hoursAllocated: 10
      };
      expect(isUnitData(data)).toBe(true);
    });

    it('validates unit data with weeks', () => {
      const data = {
        id: '1',
        weeks: 4
      };
      expect(isUnitData(data)).toBe(true);
    });
    
    it('validates unit data with bigIdeas', () => {
      const data = {
        id: '1',
        bigIdeas: ['Big idea 1']
      };
      expect(isUnitData(data)).toBe(true);
    });

    it('rejects data without unique unit fields', () => {
      const data = {
        id: '1',
        title: 'Some title',
        description: 'Unit description'
      };
      expect(isUnitData(data)).toBe(false);
    });
  });

  describe('isLessonData', () => {
    it('validates lesson data with duration', () => {
      const data = {
        id: '1',
        duration: 45
      };
      expect(isLessonData(data)).toBe(true);
    });

    it('validates lesson data with isComplete', () => {
      const data = {
        id: '1',
        isComplete: false
      };
      expect(isLessonData(data)).toBe(true);
    });
    
    it('validates lesson data with title but no unit/LRP fields', () => {
      const data = {
        id: '1',
        title: 'Lesson 1'
      };
      expect(isLessonData(data)).toBe(true);
    });

    it('rejects data without lesson-specific fields', () => {
      const data = {
        id: '1',
        description: 'Lesson description'
      };
      expect(isLessonData(data)).toBe(false);
    });

    it('rejects data that looks like unit data', () => {
      const data = {
        id: '1',
        title: 'Something',
        hoursAllocated: 10
      };
      expect(isLessonData(data)).toBe(false);
    });
  });

  describe('isDaybookData', () => {
    it('validates daybook data with required fields', () => {
      const data = {
        id: '1',
        date: '2024-01-01'
      };
      expect(isDaybookData(data)).toBe(true);
    });

    it('validates daybook data with additional fields', () => {
      const data = {
        id: '1',
        date: '2024-01-01',
        whatWorked: 'Students engaged well',
        whatDidntWork: 'Timing was off'
      };
      expect(isDaybookData(data)).toBe(true);
    });

    it('rejects data without date', () => {
      const data = {
        id: '1',
        whatWorked: 'Something'
      };
      expect(isDaybookData(data)).toBe(false);
    });

    it('rejects data with non-string date', () => {
      const data = {
        id: '1',
        date: new Date()
      };
      expect(isDaybookData(data)).toBe(false);
    });
  });

  describe('Type Guard Uniqueness', () => {
    it('distinguishes between LRP and Unit data', () => {
      const lrpData = {
        id: '1',
        title: 'Plan',
        academicYear: '2024-2025'
      };
      
      const unitData = {
        id: '2',
        title: 'Unit',
        hoursAllocated: 10
      };
      
      // LRP data should only match LRP guard
      expect(isLRPData(lrpData)).toBe(true);
      expect(isUnitData(lrpData)).toBe(false);
      
      // Unit data should only match Unit guard
      expect(isUnitData(unitData)).toBe(true);
      expect(isLRPData(unitData)).toBe(false);
    });
    
    it('distinguishes between Unit and Lesson data', () => {
      const unitData = {
        id: '1',
        title: 'Unit',
        weeks: 4
      };
      
      const lessonData = {
        id: '2',
        title: 'Lesson',
        duration: 45
      };
      
      // Unit data should only match Unit guard
      expect(isUnitData(unitData)).toBe(true);
      expect(isLessonData(unitData)).toBe(false);
      
      // Lesson data should only match Lesson guard
      expect(isLessonData(lessonData)).toBe(true);
      expect(isUnitData(lessonData)).toBe(false);
    });
    
    it('all types are mutually exclusive', () => {
      const curriculum = { id: '1', code: 'CURR-001' };
      const lrp = { id: '2', academicYear: '2024' };
      const unit = { id: '3', hoursAllocated: 10 };
      const lesson = { id: '4', duration: 45 };
      const daybook = { id: '5', date: '2024-01-01' };
      
      // Each type should only match its own guard
      const guards = [isCurriculumData, isLRPData, isUnitData, isLessonData, isDaybookData];
      const dataItems = [curriculum, lrp, unit, lesson, daybook];
      
      dataItems.forEach((data, dataIndex) => {
        guards.forEach((guard, guardIndex) => {
          if (dataIndex === guardIndex) {
            expect(guard(data)).toBe(true);
          } else {
            expect(guard(data)).toBe(false);
          }
        });
      });
    });
  });
});