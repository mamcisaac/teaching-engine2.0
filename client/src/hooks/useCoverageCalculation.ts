import { useMemo } from 'react';
import type { LongRangePlanWithRelations } from './useLongRangePlans';
import type { ETFOLessonPlanWithRelations } from './useLessonPlans';
import type { CurriculumExpectation } from './useETFOPlanning';

export function useCoverageCalculation(
  longRangePlans: LongRangePlanWithRelations[] | undefined,
  expectations: CurriculumExpectation[] | undefined,
  lessonPlans: ETFOLessonPlanWithRelations[] | undefined
) {
  return useMemo(() => {
    // Get Emily's subjects from her LRPs
    const emilySubjects = new Set(longRangePlans?.map(lrp => lrp.subject).filter(Boolean));
    
    // Only count expectations from subjects Emily teaches
    const allExpectations = new Set<string>();
    expectations?.forEach(exp => {
      if (emilySubjects.has(exp.subject)) {
        allExpectations.add(exp.code);
      }
    });
    
    // Get unique expectations covered by lessons (exactly like hierarchy page)
    const coveredExpectations = new Set<string>();
    lessonPlans?.forEach((lesson: ETFOLessonPlanWithRelations) => {
      lesson.expectations?.forEach((exp: any) => {
        // Handle nested expectation structure from API
        const code = exp.expectation?.code || exp.code;
        if (code) {
          coveredExpectations.add(code);
        }
      });
    });
    
    return {
      totalExpectations: allExpectations.size,
      coveredExpectations: coveredExpectations.size,
      coveragePercentage: allExpectations.size > 0 
        ? Math.round((coveredExpectations.size / allExpectations.size) * 100)
        : 0
    };
  }, [longRangePlans, expectations, lessonPlans]);
}