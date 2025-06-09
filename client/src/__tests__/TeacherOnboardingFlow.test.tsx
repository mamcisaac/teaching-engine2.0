import { fireEvent, screen } from '@testing-library/react';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';
import { renderWithRouter } from '../test-utils';

test('shows and dismisses overlay', () => {
  localStorage.clear();
  renderWithRouter(<TeacherOnboardingFlow />);
  expect(screen.getByText(/Welcome to Teaching Engine/)).toBeInTheDocument();
  fireEvent.click(screen.getByText('Got it'));
  expect(screen.queryByText(/Welcome to Teaching Engine/)).not.toBeInTheDocument();
  expect(localStorage.getItem('onboarded')).toBe('true');
});
