import { render, screen } from '@testing-library/react';
import SubjectList from '../components/SubjectList';
import { BrowserRouter } from 'react-router-dom';
import type { Subject } from '../api';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    useCreateSubject: () => ({ mutate: vi.fn() }),
    useUpdateSubject: () => ({ mutate: vi.fn() }),
    useDeleteSubject: () => ({ mutate: vi.fn() }),
  };
});

it('renders list of subjects', () => {
  const subjects: Subject[] = [
    { id: 1, name: 'Math', milestones: [] },
    { id: 2, name: 'Science', milestones: [] },
  ];
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <SubjectList subjects={subjects} />
      </BrowserRouter>
    </QueryClientProvider>,
  );
  expect(screen.getByText('Math')).toBeInTheDocument();
  expect(screen.getByText('Science')).toBeInTheDocument();
});
