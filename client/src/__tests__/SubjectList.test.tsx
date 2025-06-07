import { render, screen } from '@testing-library/react';
import SubjectList from '../components/SubjectList';
import { BrowserRouter } from 'react-router-dom';
import type { Subject } from '../api';

it('renders list of subjects', () => {
  const subjects: Subject[] = [
    { id: 1, name: 'Math', milestones: [] },
    { id: 2, name: 'Science', milestones: [] },
  ];
  render(
    <BrowserRouter>
      <SubjectList subjects={subjects} />
    </BrowserRouter>,
  );
  expect(screen.getByText('Math')).toBeInTheDocument();
  expect(screen.getByText('Science')).toBeInTheDocument();
});
