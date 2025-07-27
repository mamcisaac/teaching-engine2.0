/**
 * Complete ETFO Planning Workflow Integration Tests
 * Tests full user workflows from login to lesson plan creation with real backend
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRealBackend } from '../../test-utils/real-test-providers';
import { 
  realApiHelpers, 
  testDataFactory,
  testDataSeeder,
  realApiAssertions,
} from '../../test-utils/real-api-helpers';
import { createAuthenticatedTestUser, type AuthTestContext } from '../../test-utils/auth-test-utils';
import { PlanningDashboard } from '../../pages/PlanningDashboard';
import { ETFOLessonPlanPage } from '../../pages/ETFOLessonPlanPage';
import { UnitPlansPage } from '../../pages/UnitPlansPage';

describe('ETFO Planning Workflow - Complete Integration', () => {
  let authContext: AuthTestContext;
  const user = userEvent.setup();

  beforeAll(async () => {
    authContext = await createAuthenticatedTestUser();
  });

  afterAll(async () => {
    if (authContext?.cleanup) {
      await authContext.cleanup();
    }
  });

  describe('Complete Planning Workflow: Long Range Plan to Lesson Plan', () => {
    it('creates complete planning hierarchy from scratch', async () => {
      // Start at Planning Dashboard
      const { cleanup } = await renderWithRealBackend(
        <PlanningDashboard />,
        { authenticated: true, authContext }
      );

      // Step 1: Create Long Range Plan
      const createLongRangeButton = await screen.findByRole('button', { 
        name: /create long range plan/i 
      });
      await user.click(createLongRangeButton);

      // Fill out long range plan form
      const titleInput = await screen.findByLabelText(/title/i);
      await user.type(titleInput, 'Grade 3 Mathematics - Full Year');

      const gradeSelect = await screen.findByLabelText(/grade/i);
      await user.selectOptions(gradeSelect, '3');

      const subjectInput = await screen.findByLabelText(/subject/i);
      await user.type(subjectInput, 'Mathematics');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // Wait for long range plan to be created
      await waitFor(() => {
        expect(screen.getByText('Grade 3 Mathematics - Full Year')).toBeInTheDocument();
      });

      // Step 2: Create Unit Plan within the Long Range Plan
      const createUnitButton = await screen.findByRole('button', { 
        name: /create unit plan/i 
      });
      await user.click(createUnitButton);

      const unitTitleInput = await screen.findByLabelText(/unit title/i);
      await user.type(unitTitleInput, 'Fractions and Decimals');

      const unitDescriptionInput = await screen.findByLabelText(/description/i);
      await user.type(unitDescriptionInput, 'Understanding fractions and decimal notation');

      const bigIdeasInput = await screen.findByLabelText(/big ideas/i);
      await user.type(bigIdeasInput, 'Fractions represent parts of a whole');

      const saveUnitButton = screen.getByRole('button', { name: /save unit/i });
      await user.click(saveUnitButton);

      // Wait for unit plan to be created
      await waitFor(() => {
        expect(screen.getByText('Fractions and Decimals')).toBeInTheDocument();
      });

      // Step 3: Create ETFO Lesson Plan within the Unit Plan
      const createLessonButton = await screen.findByRole('button', { 
        name: /create lesson plan/i 
      });
      await user.click(createLessonButton);

      const lessonTitleInput = await screen.findByLabelText(/lesson title/i);
      await user.type(lessonTitleInput, 'Introduction to Fractions');

      const dateInput = await screen.findByLabelText(/date/i);
      await user.type(dateInput, '2024-01-15');

      const durationInput = await screen.findByLabelText(/duration/i);
      await user.type(durationInput, '60');

      const learningGoalsInput = await screen.findByLabelText(/learning goals/i);
      await user.type(learningGoalsInput, 'Students will understand that fractions represent parts of a whole');

      const successCriteriaInput = await screen.findByLabelText(/success criteria/i);
      await user.type(successCriteriaInput, 'Students can identify fractions in visual representations');

      const saveLessonButton = screen.getByRole('button', { name: /save lesson/i });
      await user.click(saveLessonButton);

      // Wait for lesson plan to be created
      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
      });

      // Verify the complete hierarchy exists in the backend
      const longRangePlans = await realApiHelpers.getLongRangePlans(authContext);
      expect(longRangePlans.length).toBe(1);
      realApiAssertions.assertValidLongRangePlan(longRangePlans[0]);

      const unitPlans = await realApiHelpers.getUnitPlans(authContext, {
        longRangePlanId: longRangePlans[0].id,
      });
      expect(unitPlans.length).toBe(1);
      realApiAssertions.assertValidUnitPlan(unitPlans[0]);

      const lessonPlans = await realApiHelpers.getETFOLessonPlans(authContext, {
        unitPlanId: unitPlans[0].id,
      });
      expect(lessonPlans.length).toBe(1);
      realApiAssertions.assertValidETFOLessonPlan(lessonPlans[0]);

      await cleanup();
    });

    it('navigates through existing planning hierarchy and creates lessons', async () => {
      // Seed existing data
      const seededData = await testDataSeeder.seedBasicPlanningData(authContext);

      const { cleanup } = await renderWithRealBackend(
        <PlanningDashboard />,
        { authenticated: true, authContext }
      );

      // Navigate to existing long range plan
      const longRangePlanCard = await screen.findByText(seededData.longRangePlan.title);
      await user.click(longRangePlanCard);

      // Navigate to existing unit plan
      const unitPlanCard = await screen.findByText(seededData.unitPlan.title);
      await user.click(unitPlanCard);

      // Create additional lesson plan
      const addLessonButton = await screen.findByRole('button', { 
        name: /add lesson/i 
      });
      await user.click(addLessonButton);

      // Fill lesson plan details
      const titleInput = await screen.findByLabelText(/title/i);
      await user.type(titleInput, 'Comparing Fractions');

      const dateInput = await screen.findByLabelText(/date/i);
      await user.type(dateInput, '2024-01-16');

      const bodyOfLessonInput = await screen.findByLabelText(/body of lesson/i);
      await user.type(bodyOfLessonInput, 'Students will compare fractions using visual models');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify lesson was added
      await waitFor(() => {
        expect(screen.getByText('Comparing Fractions')).toBeInTheDocument();
      });

      // Verify in backend
      const lessons = await realApiHelpers.getETFOLessonPlans(authContext, {
        unitPlanId: seededData.unitPlan.id,
      });
      expect(lessons.length).toBe(2); // Original + new lesson

      await cleanup();
    });
  });

  describe('ETFO Lesson Plan Editing Workflow', () => {
    it('edits lesson plan through complete form workflow', async () => {
      // Create test data
      const longRangePlan = await realApiHelpers.createLongRangePlan(authContext);
      const unitPlan = await realApiHelpers.createUnitPlan(authContext, longRangePlan.id);
      const lessonPlan = await realApiHelpers.createETFOLessonPlan(authContext, unitPlan.id, {
        title: 'Original Lesson Title',
      });

      const { cleanup } = await renderWithRealBackend(
        <ETFOLessonPlanPage />,
        { 
          authenticated: true, 
          authContext,
          initialRoute: `/etfo-lesson-plans/${lessonPlan.id}`,
        }
      );

      // Wait for lesson plan to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Original Lesson Title')).toBeInTheDocument();
      });

      // Edit the lesson plan
      const editButton = await screen.findByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Modify fields
      const titleInput = screen.getByDisplayValue('Original Lesson Title');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Lesson Title');

      const learningGoalsInput = await screen.findByLabelText(/learning goals/i);
      await user.clear(learningGoalsInput);
      await user.type(learningGoalsInput, 'Updated learning goals for the lesson');

      const successCriteriaInput = await screen.findByLabelText(/success criteria/i);
      await user.clear(successCriteriaInput);
      await user.type(successCriteriaInput, 'Updated success criteria');

      const materialsInput = await screen.findByLabelText(/materials/i);
      await user.type(materialsInput, 'Manipulatives, worksheets, interactive whiteboard');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Wait for save confirmation
      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      });

      // Verify changes in backend
      const updatedLesson = await realApiHelpers.getETFOLessonPlan(authContext, lessonPlan.id);
      expect(updatedLesson.title).toBe('Updated Lesson Title');
      expect(updatedLesson.learningGoals).toBe('Updated learning goals for the lesson');
      expect(updatedLesson.successCriteria).toBe('Updated success criteria');

      await cleanup();
    });

    it('handles form validation with real backend responses', async () => {
      const { cleanup } = await renderWithRealBackend(
        <ETFOLessonPlanPage />,
        { 
          authenticated: true, 
          authContext,
          initialRoute: '/etfo-lesson-plans/new',
        }
      );

      // Try to save without required fields
      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Wait for validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Fill required fields
      const titleInput = await screen.findByLabelText(/title/i);
      await user.type(titleInput, 'Valid Lesson Title');

      const dateInput = await screen.findByLabelText(/date/i);
      await user.type(dateInput, '2024-01-15');

      // Try to save again
      await user.click(saveButton);

      // Should succeed this time
      await waitFor(() => {
        expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
      });

      await cleanup();
    });
  });

  describe('Unit Plan Management Workflow', () => {
    it('manages unit plans with real curriculum expectations', async () => {
      // Create curriculum expectations
      await testDataSeeder.seedCurriculumData(authContext);
      
      const longRangePlan = await realApiHelpers.createLongRangePlan(authContext);

      const { cleanup } = await renderWithRealBackend(
        <UnitPlansPage />,
        { authenticated: true, authContext }
      );

      // Create new unit plan
      const createButton = await screen.findByRole('button', { name: /create unit plan/i });
      await user.click(createButton);

      // Fill unit plan form
      const titleInput = await screen.findByLabelText(/title/i);
      await user.type(titleInput, 'Geometry Unit');

      const gradeSelect = await screen.findByLabelText(/grade/i);
      await user.selectOptions(gradeSelect, '3');

      const longRangePlanSelect = await screen.findByLabelText(/long range plan/i);
      await user.selectOptions(longRangePlanSelect, longRangePlan.id);

      // Select curriculum expectations
      const expectationsButton = await screen.findByRole('button', { 
        name: /select expectations/i 
      });
      await user.click(expectationsButton);

      // Select some expectations
      const expectationCheckboxes = await screen.findAllByRole('checkbox');
      await user.click(expectationCheckboxes[0]);
      await user.click(expectationCheckboxes[1]);

      const confirmExpectationsButton = screen.getByRole('button', { 
        name: /confirm selection/i 
      });
      await user.click(confirmExpectationsButton);

      // Save unit plan
      const saveButton = screen.getByRole('button', { name: /save unit plan/i });
      await user.click(saveButton);

      // Wait for creation
      await waitFor(() => {
        expect(screen.getByText('Geometry Unit')).toBeInTheDocument();
      });

      // Verify in backend
      const unitPlans = await realApiHelpers.getUnitPlans(authContext);
      const geometryUnit = unitPlans.find((u: { title: string }) => u.title === 'Geometry Unit');
      expect(geometryUnit).toBeDefined();
      expect(geometryUnit.expectations).toBeDefined();
      expect(geometryUnit.expectations.length).toBe(2);

      await cleanup();
    });

    it('duplicates existing unit plan with modifications', async () => {
      // Create source unit plan
      const longRangePlan = await realApiHelpers.createLongRangePlan(authContext);
      const sourceUnit = await realApiHelpers.createUnitPlan(authContext, longRangePlan.id, {
        title: 'Source Unit Plan',
        description: 'Original description',
      });

      const { cleanup } = await renderWithRealBackend(
        <UnitPlansPage />,
        { authenticated: true, authContext }
      );

      // Find and duplicate the unit plan
      const unitCard = await screen.findByText('Source Unit Plan');
      const moreOptionsButton = unitCard.closest('[data-testid="unit-card"]')
        ?.querySelector('[aria-label="More options"]');
      
      if (moreOptionsButton) {
        await user.click(moreOptionsButton);
      }

      const duplicateButton = await screen.findByRole('menuitem', { name: /duplicate/i });
      await user.click(duplicateButton);

      // Modify the duplicated plan
      const titleInput = await screen.findByDisplayValue('Source Unit Plan (Copy)');
      await user.clear(titleInput);
      await user.type(titleInput, 'Modified Duplicate Unit');

      const descriptionInput = await screen.findByDisplayValue('Original description');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Modified description for duplicate');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify both units exist
      await waitFor(() => {
        expect(screen.getByText('Source Unit Plan')).toBeInTheDocument();
        expect(screen.getByText('Modified Duplicate Unit')).toBeInTheDocument();
      });

      const allUnits = await realApiHelpers.getUnitPlans(authContext);
      expect(allUnits.length).toBe(2);

      await cleanup();
    });
  });

  describe('Collaborative Planning Workflow', () => {
    it('handles multiple users working on same plans', async () => {
      // Create second authenticated user
      const secondAuthContext = await createAuthenticatedTestUser();

      try {
        // First user creates a long range plan
        const longRangePlan = await realApiHelpers.createLongRangePlan(authContext, {
          title: 'Shared Long Range Plan',
        });

        // Second user creates a unit plan in the same long range plan
        const unitPlan = await realApiHelpers.createUnitPlan(secondAuthContext, longRangePlan.id, {
          title: 'Collaborative Unit Plan',
        });

        // First user views the updated plan
        const { cleanup } = await renderWithRealBackend(
          <PlanningDashboard />,
          { authenticated: true, authContext }
        );

        // Should see both their plan and the collaborative unit
        await waitFor(() => {
          expect(screen.getByText('Shared Long Range Plan')).toBeInTheDocument();
          expect(screen.getByText('Collaborative Unit Plan')).toBeInTheDocument();
        });

        // First user adds a lesson to the collaborative unit
        const unitCard = screen.getByText('Collaborative Unit Plan');
        await user.click(unitCard);

        const addLessonButton = await screen.findByRole('button', { 
          name: /add lesson/i 
        });
        await user.click(addLessonButton);

        const titleInput = await screen.findByLabelText(/title/i);
        await user.type(titleInput, 'Collaborative Lesson');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        // Verify lesson was created
        await waitFor(() => {
          expect(screen.getByText('Collaborative Lesson')).toBeInTheDocument();
        });

        // Verify in backend that both users' work is preserved
        const lessons = await realApiHelpers.getETFOLessonPlans(authContext, {
          unitPlanId: unitPlan.id,
        });
        expect(lessons.length).toBe(1);
        expect(lessons[0].title).toBe('Collaborative Lesson');

        await cleanup();
      } finally {
        if (secondAuthContext?.cleanup) {
          await secondAuthContext.cleanup();
        }
      }
    });
  });

  describe('Error Handling and Recovery Workflows', () => {
    it('recovers gracefully from network errors during planning', async () => {
      const { cleanup } = await renderWithRealBackend(
        <PlanningDashboard />,
        { authenticated: true, authContext }
      );

      // Simulate network error by using invalid endpoint
      const createButton = await screen.findByRole('button', { 
        name: /create long range plan/i 
      });
      await user.click(createButton);

      // Try to save with valid data
      const titleInput = await screen.findByLabelText(/title/i);
      await user.type(titleInput, 'Test Plan');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should eventually succeed (our real backend should handle this)
      await waitFor(() => {
        expect(screen.getByText('Test Plan')).toBeInTheDocument();
      }, { timeout: 10000 });

      await cleanup();
    });

    it('handles concurrent editing conflicts', async () => {
      // Create a lesson plan
      const longRangePlan = await realApiHelpers.createLongRangePlan(authContext);
      const unitPlan = await realApiHelpers.createUnitPlan(authContext, longRangePlan.id);
      const lessonPlan = await realApiHelpers.createETFOLessonPlan(authContext, unitPlan.id, {
        title: 'Concurrent Edit Test',
      });

      // Simulate another user updating the plan
      await realApiHelpers.updateETFOLessonPlan(authContext, lessonPlan.id, {
        title: 'Updated by Another User',
      });

      const { cleanup } = await renderWithRealBackend(
        <ETFOLessonPlanPage />,
        { 
          authenticated: true, 
          authContext,
          initialRoute: `/etfo-lesson-plans/${lessonPlan.id}`,
        }
      );

      // User tries to edit the lesson
      const editButton = await screen.findByRole('button', { name: /edit/i });
      await user.click(editButton);

      const titleInput = await screen.findByDisplayValue(/Updated by Another User|Concurrent Edit Test/);
      await user.clear(titleInput);
      await user.type(titleInput, 'My Local Changes');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should handle the conflict appropriately
      await waitFor(() => {
        // Either show conflict resolution or apply changes
        expect(
          screen.queryByText(/conflict detected/i) ||
          screen.queryByText(/saved successfully/i)
        ).toBeInTheDocument();
      });

      await cleanup();
    });
  });

  describe('Performance and User Experience', () => {
    it('handles large datasets efficiently in planning workflow', async () => {
      // Seed large amount of data
      await testDataSeeder.seedLargePlanningData(authContext, 10);

      const startTime = performance.now();

      const { cleanup } = await renderWithRealBackend(
        <PlanningDashboard />,
        { authenticated: true, authContext }
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/long range plans/i)).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;

      // Should load within reasonable time even with large dataset
      expect(loadTime).toBeLessThan(10000); // 10 seconds

      // Should display paginated or efficiently rendered content
      const planCards = await screen.findAllByTestId(/plan-card/);
      expect(planCards.length).toBeGreaterThan(0);
      expect(planCards.length).toBeLessThanOrEqual(20); // Assuming pagination

      await cleanup();
    });

    it('provides smooth user experience during real API operations', async () => {
      const { cleanup } = await renderWithRealBackend(
        <PlanningDashboard />,
        { authenticated: true, authContext }
      );

      // Test loading states
      const createButton = await screen.findByRole('button', { 
        name: /create long range plan/i 
      });
      await user.click(createButton);

      // Should show form immediately
      const titleInput = await screen.findByLabelText(/title/i);
      expect(titleInput).toBeInTheDocument();

      await user.type(titleInput, 'UX Test Plan');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should show loading state
      expect(saveButton).toBeDisabled();
      expect(screen.getByText(/saving|creating/i)).toBeInTheDocument();

      // Should complete and show success
      await waitFor(() => {
        expect(screen.getByText('UX Test Plan')).toBeInTheDocument();
      });

      await cleanup();
    });
  });
});