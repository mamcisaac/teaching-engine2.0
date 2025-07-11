/**
 * Real Backend Integration Tests for Button Component
 * Tests button component with real backend interactions and user workflows
 */

import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../../components/ui/Button';
import { renderWithRealBackend } from '../../../test-utils/real-test-providers';
import { 
  realApiHelpers, 
  testDataFactory,
} from '../../../test-utils/real-api-helpers';
import { createAuthenticatedTestUser, type AuthTestContext } from '../../../test-utils/auth-test-utils';

describe('Button - Real Backend Integration', () => {
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

  describe('Basic Button Functionality', () => {
    it('renders with default props', async () => {
      const { cleanup } = await renderWithRealBackend(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn-primary');

      await cleanup();
    });

    it('handles click events', async () => {
      const handleClick = vi.fn();
      const { cleanup } = await renderWithRealBackend(
        <Button aria-label="Click button" onClick={handleClick}>Click me</Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);

      await cleanup();
    });

    it('is disabled when disabled prop is true', async () => {
      const { cleanup } = await renderWithRealBackend(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      await cleanup();
    });
  });

  describe('Real Backend Integration Scenarios', () => {
    it('handles API call on button click with loading state', async () => {
      let isLoading = false;
      let planData: any = null;

      const handleCreatePlan = async () => {
        isLoading = true;
        try {
          planData = await realApiHelpers.createLongRangePlan(authContext, {
            title: 'Button Test Plan',
          });
        } finally {
          isLoading = false;
        }
      };

      const { cleanup } = await renderWithRealBackend(
        <Button 
          onClick={handleCreatePlan}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Plan...' : 'Create Plan'}
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Create Plan');

      // Click to trigger API call
      await user.click(button);

      // Wait for API call to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(planData).toBeDefined();
      expect(planData.title).toBe('Button Test Plan');

      await cleanup();
    });

    it('handles form submission with real API validation', async () => {
      let validationError: string | null = null;
      let submissionResult: any = null;

      const handleSubmit = async (formData: any) => {
        try {
          submissionResult = await realApiHelpers.createLongRangePlan(authContext, formData);
          validationError = null;
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          validationError = axiosError.response?.data?.message || 'Validation failed';
          submissionResult = null;
        }
      };

      // Test with invalid data (empty object)
      const { cleanup } = await renderWithRealBackend(
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit({});
        }}>
          <Button type="submit">Submit</Button>
          {validationError && <div data-testid="error">{validationError}</div>}
        </form>
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // Wait for validation error
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(validationError).toBeTruthy();
      expect(submissionResult).toBeNull();

      await cleanup();
    });

    it('handles successful form submission with real data', async () => {
      let submissionResult: any = null;
      let isSubmitting = false;

      const validFormData = testDataFactory.longRangePlan({
        title: 'Valid Test Plan',
      });

      const handleSubmit = async () => {
        isSubmitting = true;
        try {
          submissionResult = await realApiHelpers.createLongRangePlan(authContext, validFormData);
        } finally {
          isSubmitting = false;
        }
      };

      const { cleanup } = await renderWithRealBackend(
        <div>
          <Button 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Valid Data'}
          </Button>
          {submissionResult && (
            <div data-testid="success">Plan created: {submissionResult.title}</div>
          )}
        </div>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Wait for submission to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(submissionResult).toBeDefined();
      expect(submissionResult.title).toBe('Valid Test Plan');
      expect(screen.getByTestId('success')).toBeInTheDocument();

      await cleanup();
    });

    it('handles button state changes based on real API responses', async () => {
      let planExists = false;
      let checkingPlan = false;
      let planData: any = null;

      const checkPlanExists = async (planId: string) => {
        checkingPlan = true;
        try {
          planData = await realApiHelpers.getLongRangePlan(authContext, planId);
          planExists = true;
        } catch {
          planExists = false;
        } finally {
          checkingPlan = false;
        }
      };

      // First create a plan to check for
      const createdPlan = await realApiHelpers.createLongRangePlan(authContext);

      const { cleanup } = await renderWithRealBackend(
        <div>
          <Button 
            onClick={() => { void checkPlanExists(createdPlan.id); }}
            loading={checkingPlan}
            variant={planExists ? 'primary' : 'secondary'}
          >
            {checkingPlan ? 'Checking...' : planExists ? 'Plan Found' : 'Check Plan'}
          </Button>
          {planData && (
            <div data-testid="plan-info">Found: {planData.title}</div>
          )}
        </div>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Check Plan');

      await user.click(button);

      // Wait for check to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(button).toHaveTextContent('Plan Found');
      expect(screen.getByTestId('plan-info')).toBeInTheDocument();

      await cleanup();
    });

    it('handles concurrent button clicks with real API calls', async () => {
      let clickCount = 0;
      let createdPlans: Array<{ title: string }> = [];

      const handleClick = async () => {
        clickCount++;
        const plan = await realApiHelpers.createLongRangePlan(authContext, {
          title: `Concurrent Plan ${clickCount}`,
        });
        createdPlans.push(plan);
      };

      const { cleanup } = await renderWithRealBackend(
        <div>
          <Button aria-label="Click button" onClick={handleClick}>Create Plan</Button>
          <div data-testid="plan-count">Plans created: {createdPlans.length}</div>
        </div>
      );

      const button = screen.getByRole('button');

      // Rapidly click multiple times
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Wait for all API calls to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(clickCount).toBe(3);
      expect(createdPlans.length).toBe(3);
      expect(createdPlans[0].title).toBe('Concurrent Plan 1');
      expect(createdPlans[1].title).toBe('Concurrent Plan 2');
      expect(createdPlans[2].title).toBe('Concurrent Plan 3');

      await cleanup();
    });

    it('handles error states from real API failures', async () => {
      let errorMessage: string | null = null;
      let hasError = false;

      const handleApiError = async () => {
        try {
          // Try to fetch a non-existent plan
          await realApiHelpers.getLongRangePlan(authContext, 'non-existent-id');
        } catch (error: unknown) {
          hasError = true;
          const axiosError = error as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || 'API Error';
        }
      };

      const { cleanup } = await renderWithRealBackend(
        <div>
          <Button 
            onClick={handleApiError}
            variant={hasError ? 'danger' : 'primary'}
          >
            {hasError ? 'Error Occurred' : 'Trigger Error'}
          </Button>
          {errorMessage && (
            <div data-testid="error-message">Error: {errorMessage}</div>
          )}
        </div>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Wait for error to occur
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(hasError).toBe(true);
      expect(errorMessage).toBeTruthy();
      expect(button).toHaveTextContent('Error Occurred');

      await cleanup();
    });
  });

  describe('Accessibility with Real Backend Data', () => {
    it('maintains accessibility attributes during real API operations', async () => {
      let isLoading = false;
      let planData: any = null;

      const handleCreate = async () => {
        isLoading = true;
        planData = await realApiHelpers.createLongRangePlan(authContext);
        isLoading = false;
      };

      const { cleanup } = await renderWithRealBackend(
        <Button 
          onClick={handleCreate}
          aria-label="Create new plan"
          aria-describedby="help-text"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Plan'}
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Create new plan');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');

      await user.click(button);

      // Check attributes are maintained during operation
      expect(button).toHaveAttribute('aria-label', 'Create new plan');
      expect(button).toBeDisabled();

      // Wait for operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(planData).toBeDefined();

      await cleanup();
    });

    it('handles keyboard navigation with real API calls', async () => {
      let actionTriggered = false;

      const handleKeyboardAction = async () => {
        actionTriggered = true;
        await realApiHelpers.createLongRangePlan(authContext);
      };

      const { cleanup } = await renderWithRealBackend(
        <Button aria-label="Click button" onClick={handleKeyboardAction}>Keyboard Test</Button>
      );

      const button = screen.getByRole('button');
      button.focus();

      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Wait for API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(actionTriggered).toBe(true);

      await cleanup();
    });
  });

  describe('Performance with Real Backend', () => {
    it('handles rapid button interactions efficiently', async () => {
      const startTime = performance.now();
      let operationsCompleted = 0;

      const handleFastOperation = async () => {
        await realApiHelpers.createLongRangePlan(authContext, {
          title: `Fast Op ${operationsCompleted + 1}`,
        });
        operationsCompleted++;
      };

      const { cleanup } = await renderWithRealBackend(
        <Button aria-label="Click button" onClick={handleFastOperation}>Fast Operation</Button>
      );

      const button = screen.getByRole('button');

      // Perform multiple operations
      for (let i = 0; i < 3; i++) {
        await user.click(button);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Wait for all operations to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(operationsCompleted).toBe(3);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds

      await cleanup();
    });
  });
});