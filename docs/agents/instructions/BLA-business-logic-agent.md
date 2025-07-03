# Business Logic Agent (BLA) Instructions

**Agent ID**: BLA  
**Specialization**: Core business services, CRUD operations, data integrity  
**Priority**: HIGH - Core functionality that users interact with daily

## Your Mission

You are responsible for testing all business logic services that power the application's core features. Your tests ensure data integrity, business rule compliance, and reliable user experiences. You must bring coverage from ~8% to 90%.

## Current Coverage Gaps

```
src/services/curriculumService.ts: 2.12% → Target: 90%
src/services/lessonPlanService.ts: 9.52% → Target: 90%
src/services/studentService.ts: 7.01% → Target: 90%
src/services/assessmentService.ts: 15% → Target: 90%
src/services/workflowStateService.ts: 7.4% → Target: 85%
src/services/base/BaseService.ts: 9.82% → Target: 95%
```

## Immediate Tasks (Day 1-5)

### 1. Base Service Tests
```typescript
// src/services/base/__tests__/BaseService.test.ts

describe('BaseService', () => {
  let service: BaseService<User>;
  let mockRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockRepository = createMockRepository<User>();
    service = new BaseService(mockRepository);
  });

  describe('CRUD Operations', () => {
    test('should create entity with validation', async () => {
      const userData = { name: 'John', email: 'john@test.com' };
      mockRepository.create.mockResolvedValue({ id: '1', ...userData });
      
      const result = await service.create(userData);
      
      expect(result.id).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
    });

    test('should prevent duplicate creation', async () => {
      mockRepository.findOne.mockResolvedValue(existingUser);
      
      await expect(service.create({ email: 'existing@test.com' }))
        .rejects.toThrow('Email already exists');
    });

    test('should handle batch operations', async () => {
      const users = Array(100).fill(null).map((_, i) => ({
        name: `User ${i}`,
        email: `user${i}@test.com`
      }));
      
      const results = await service.createBatch(users);
      
      expect(results).toHaveLength(100);
      expect(mockRepository.createMany).toHaveBeenCalledWith(users);
    });

    test('should implement soft delete', async () => {
      await service.delete('123');
      
      expect(mockRepository.update).toHaveBeenCalledWith('123', {
        deletedAt: expect.any(Date)
      });
    });
  });

  describe('Query Operations', () => {
    test('should paginate results', async () => {
      const result = await service.findAll({ page: 2, limit: 20 });
      
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 20
      });
    });

    test('should filter by criteria', async () => {
      await service.findAll({ 
        filters: { status: 'active', role: 'teacher' }
      });
      
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        where: { status: 'active', role: 'teacher' }
      });
    });

    test('should sort results', async () => {
      await service.findAll({ 
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
    });
  });
});
```

### 2. Lesson Plan Service Tests
```typescript
// src/services/__tests__/lessonPlanService.test.ts

describe('LessonPlanService', () => {
  describe('Lesson Creation', () => {
    test('should create lesson with all required fields', async () => {
      const lessonData = {
        title: 'Introduction to Fractions',
        grade: '3',
        subject: 'Math',
        duration: 45,
        objectives: ['Understand fractions'],
        activities: [{ name: 'Fraction circles', duration: 15 }],
        materials: ['Paper', 'Scissors'],
        standards: ['3.NF.1']
      };
      
      const lesson = await lessonPlanService.create(lessonData);
      
      expect(lesson).toMatchObject(lessonData);
      expect(lesson.id).toBeDefined();
      expect(lesson.createdAt).toBeDefined();
    });

    test('should validate lesson duration', async () => {
      const invalidDurations = [0, -10, 500, null];
      
      for (const duration of invalidDurations) {
        await expect(lessonPlanService.create({ duration }))
          .rejects.toThrow('Invalid duration');
      }
    });

    test('should link to curriculum', async () => {
      const lesson = await lessonPlanService.create({
        curriculumId: 'curr-123',
        ...basicLessonData
      });
      
      expect(lesson.curriculum).toBeDefined();
      expect(lesson.curriculum.id).toBe('curr-123');
    });
  });

  describe('Lesson Templates', () => {
    test('should create from template', async () => {
      const template = await lessonPlanService.getTemplate('math-fractions-gr3');
      const lesson = await lessonPlanService.createFromTemplate(template, {
        teacherId: 'teacher-123',
        scheduledDate: new Date('2024-01-15')
      });
      
      expect(lesson.title).toBe(template.title);
      expect(lesson.activities).toEqual(template.activities);
      expect(lesson.teacherId).toBe('teacher-123');
    });

    test('should customize template', async () => {
      const customizations = {
        duration: 60, // Extended from 45
        activities: [{ name: 'Extra activity', duration: 15 }]
      };
      
      const lesson = await lessonPlanService.createFromTemplate(
        'template-123',
        customizations
      );
      
      expect(lesson.duration).toBe(60);
      expect(lesson.activities).toContainEqual(customizations.activities[0]);
    });
  });

  describe('Lesson Scheduling', () => {
    test('should prevent double-booking', async () => {
      await lessonPlanService.schedule({
        lessonId: 'lesson-1',
        teacherId: 'teacher-1',
        date: '2024-01-15',
        time: '09:00'
      });
      
      await expect(lessonPlanService.schedule({
        lessonId: 'lesson-2',
        teacherId: 'teacher-1',
        date: '2024-01-15',
        time: '09:00'
      })).rejects.toThrow('Time slot already booked');
    });

    test('should handle recurring lessons', async () => {
      const recurring = await lessonPlanService.scheduleRecurring({
        lessonId: 'lesson-1',
        pattern: 'weekly',
        startDate: '2024-01-01',
        endDate: '2024-03-01',
        dayOfWeek: 'Monday',
        time: '10:00'
      });
      
      expect(recurring.instances).toHaveLength(9); // 9 Mondays
    });
  });
});
```

### 3. Student Service Tests
```typescript
// src/services/__tests__/studentService.test.ts

describe('StudentService', () => {
  describe('Student Management', () => {
    test('should enroll student in class', async () => {
      const student = await studentService.create({
        name: 'Jane Doe',
        grade: '3',
        email: 'jane@school.com'
      });
      
      await studentService.enrollInClass(student.id, 'class-123');
      
      const updated = await studentService.findById(student.id);
      expect(updated.classes).toContain('class-123');
    });

    test('should track attendance', async () => {
      await studentService.markAttendance({
        studentId: 'student-123',
        date: '2024-01-15',
        status: 'present'
      });
      
      const attendance = await studentService.getAttendance('student-123');
      expect(attendance.present).toBe(1);
      expect(attendance.rate).toBe(100);
    });

    test('should calculate progress', async () => {
      const progress = await studentService.calculateProgress('student-123', {
        subject: 'Math',
        period: 'Q1'
      });
      
      expect(progress).toMatchObject({
        completedLessons: expect.any(Number),
        totalLessons: expect.any(Number),
        averageScore: expect.any(Number),
        strengths: expect.any(Array),
        improvements: expect.any(Array)
      });
    });
  });

  describe('Parent Communication', () => {
    test('should send progress reports', async () => {
      const report = await studentService.generateProgressReport('student-123');
      const sent = await studentService.sendToParents(report);
      
      expect(sent.recipients).toContain('parent@email.com');
      expect(sent.status).toBe('sent');
    });

    test('should respect communication preferences', async () => {
      await studentService.updateParentPreferences('student-123', {
        emailReports: false,
        smsAlerts: true
      });
      
      const sent = await studentService.sendAlert('student-123', 'Test alert');
      
      expect(sent.channels).toContain('sms');
      expect(sent.channels).not.toContain('email');
    });
  });
});
```

### 4. Curriculum Service Tests
```typescript
// src/services/__tests__/curriculumService.test.ts

describe('CurriculumService', () => {
  describe('Curriculum Import', () => {
    test('should import from standard format', async () => {
      const curriculumData = {
        title: 'Grade 3 Math Standards',
        standards: [
          { code: '3.NF.1', description: 'Understand fractions' },
          { code: '3.MD.1', description: 'Tell time' }
        ],
        units: [
          { 
            title: 'Fractions',
            lessons: 12,
            duration: '3 weeks'
          }
        ]
      };
      
      const imported = await curriculumService.import(curriculumData);
      
      expect(imported.standards).toHaveLength(2);
      expect(imported.units).toHaveLength(1);
    });

    test('should validate curriculum structure', async () => {
      const invalid = { title: 'No standards' };
      
      await expect(curriculumService.import(invalid))
        .rejects.toThrow('Invalid curriculum format');
    });

    test('should merge duplicate standards', async () => {
      const existing = await curriculumService.create({
        standards: [{ code: '3.NF.1' }]
      });
      
      const imported = await curriculumService.import({
        standards: [{ code: '3.NF.1' }, { code: '3.NF.2' }]
      });
      
      const allStandards = await curriculumService.getAllStandards();
      const nf1Count = allStandards.filter(s => s.code === '3.NF.1').length;
      
      expect(nf1Count).toBe(1); // No duplicates
    });
  });

  describe('Curriculum Mapping', () => {
    test('should map lessons to standards', async () => {
      const mapping = await curriculumService.mapLessonToStandards(
        'lesson-123',
        ['3.NF.1', '3.NF.2']
      );
      
      expect(mapping.lesson).toBe('lesson-123');
      expect(mapping.standards).toHaveLength(2);
    });

    test('should generate coverage report', async () => {
      const coverage = await curriculumService.getCoverageReport({
        teacherId: 'teacher-123',
        period: 'semester1'
      });
      
      expect(coverage).toMatchObject({
        totalStandards: expect.any(Number),
        coveredStandards: expect.any(Number),
        coveragePercentage: expect.any(Number),
        gaps: expect.any(Array)
      });
    });

    test('should suggest lessons for gaps', async () => {
      const gaps = ['3.NF.3', '3.MD.2'];
      const suggestions = await curriculumService.suggestLessonsForGaps(gaps);
      
      expect(suggestions).toHaveLength(gaps.length);
      suggestions.forEach(suggestion => {
        expect(suggestion.standards).toContain(expect.any(String));
      });
    });
  });
});
```

## Complex Business Logic Tests

### 1. Workflow State Management
```typescript
describe('WorkflowStateService', () => {
  test('should enforce state transitions', async () => {
    const lesson = { id: '123', state: 'draft' };
    
    // Valid transition
    await workflowService.transition(lesson, 'review');
    expect(lesson.state).toBe('review');
    
    // Invalid transition
    await expect(workflowService.transition(lesson, 'archived'))
      .rejects.toThrow('Invalid state transition');
  });

  test('should track state history', async () => {
    const history = await workflowService.getHistory('lesson-123');
    
    expect(history).toEqual([
      { from: 'draft', to: 'review', timestamp: expect.any(Date) },
      { from: 'review', to: 'published', timestamp: expect.any(Date) }
    ]);
  });
});
```

### 2. Data Integrity Tests
```typescript
describe('Data Integrity', () => {
  test('should maintain referential integrity', async () => {
    // Cannot delete teacher with active lessons
    await expect(teacherService.delete('teacher-with-lessons'))
      .rejects.toThrow('Cannot delete: active lessons exist');
  });

  test('should cascade soft deletes', async () => {
    await classService.delete('class-123');
    
    const lessons = await lessonService.findByClass('class-123');
    lessons.forEach(lesson => {
      expect(lesson.deletedAt).toBeDefined();
    });
  });
});
```

## Performance Tests

```typescript
describe('Performance', () => {
  test('should handle bulk operations efficiently', async () => {
    const students = Array(1000).fill(null).map((_, i) => ({
      name: `Student ${i}`,
      email: `student${i}@test.com`
    }));
    
    const start = Date.now();
    await studentService.bulkCreate(students);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 seconds max
  });

  test('should optimize queries with proper indexes', async () => {
    const start = Date.now();
    await lessonService.searchByStandard('3.NF.1');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100); // 100ms max
  });
});
```

## Dependencies

### From TIA
- Database mock utilities
- Factory functions for all entities
- Transaction helpers

### You Provide
- Business rule validators
- Workflow state machines
- Data transformation utilities

## Success Metrics

1. **Coverage**: 90% on all business services
2. **Performance**: All queries <100ms
3. **Integrity**: Zero data corruption scenarios
4. **Rules**: All business rules validated
5. **Edge Cases**: Boundary conditions tested

## Daily Priorities

### Day 1
- BaseService comprehensive tests
- CRUD operations for all entities

### Day 2
- LessonPlanService full coverage
- Complex scheduling logic

### Day 3
- StudentService with progress tracking
- Parent communication features

### Day 4
- CurriculumService import/export
- Standards mapping

### Day 5
- Integration tests
- Performance benchmarks

Remember: Business logic is what users interact with. Every bug here directly impacts user experience and data integrity.