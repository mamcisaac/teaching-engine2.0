/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CurriculumImportPage } from '../../pages/CurriculumImportPage';
import { renderWithAuth } from '../../test-utils';
import * as apiModule from '../../api';

// Mock the API module
vi.mock('../../api', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ type: 'file' }),
    isDragActive: false,
  })),
}));

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock File constructor for testing
global.File = class MockFile {
  constructor(
    public bits: BlobPart[],
    public name: string,
    public options?: FilePropertyBag,
  ) {}
  get size() {
    return 1024;
  }
  get type() {
    return 'application/pdf';
  }
} as any;

describe('CurriculumImportPage', () => {
  const user = userEvent.setup();
  const mockApi = apiModule.api as { post: ReturnType<typeof vi.fn> };

  const mockParsedSubjects = [
    {
      name: 'Mathematics',
      expectations: [
        {
          code: 'B1.1',
          type: 'specific',
          description: 'demonstrate an understanding of addition',
          strand: 'Number',
          substrand: 'Number Sense',
          subject: 'Mathematics',
          grade: 3,
        },
        {
          code: 'B1.2',
          type: 'specific',
          description: 'demonstrate an understanding of subtraction',
          strand: 'Number',
          substrand: 'Number Sense',
          subject: 'Mathematics',
          grade: 3,
        },
      ],
    },
    {
      name: 'Language Arts',
      expectations: [
        {
          code: 'A1.1',
          type: 'overall',
          description: 'read and demonstrate comprehension',
          strand: 'Reading',
          subject: 'Language Arts',
          grade: 3,
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders the curriculum import page with tabs', () => {
    renderWithAuth(<CurriculumImportPage />);

    expect(screen.getByText('Import Curriculum')).toBeInTheDocument();
    expect(
      screen.getByText('Upload a curriculum document or select a known curriculum to get started'),
    ).toBeInTheDocument();

    // Should show tabs
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByText('Use Preset')).toBeInTheDocument();
  });

  it('shows upload interface by default', () => {
    renderWithAuth(<CurriculumImportPage />);

    expect(screen.getByText('Upload Curriculum Document')).toBeInTheDocument();
    expect(
      screen.getByText('Upload a PDF, DOCX, or TXT file containing curriculum expectations'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
  });

  it('allows switching to preset tab', async () => {
    renderWithAuth(<CurriculumImportPage />);

    const presetTab = screen.getByText('Use Preset');
    await user.click(presetTab);

    expect(screen.getByText('Select Known Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Choose from pre-configured curriculum documents')).toBeInTheDocument();
    expect(screen.getByText('Available Curricula')).toBeInTheDocument();
  });

  it('shows preset options in select dropdown', async () => {
    renderWithAuth(<CurriculumImportPage />);

    const presetTab = screen.getByText('Use Preset');
    await user.click(presetTab);

    const selectTrigger = screen.getByRole('button', { name: /select a curriculum/i });
    await user.click(selectTrigger);

    expect(
      screen.getByText('PEI Grade 1 French Immersion (English School Board)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ontario Grade 1 English')).toBeInTheDocument();
    expect(screen.getByText('BC Grade 1 Core Curriculum')).toBeInTheDocument();
  });

  it('handles preset selection and loading', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        sessionId: 'session-123',
        subjects: mockParsedSubjects,
      },
    });

    renderWithAuth(<CurriculumImportPage />);

    // Switch to preset tab
    const presetTab = screen.getByText('Use Preset');
    await user.click(presetTab);

    // Select a preset
    const selectTrigger = screen.getByRole('button', { name: /select a curriculum/i });
    await user.click(selectTrigger);

    const presetOption = screen.getByText('PEI Grade 1 French Immersion (English School Board)');
    await user.click(presetOption);

    // Load the preset
    const loadButton = screen.getByRole('button', { name: /load curriculum/i });
    await user.click(loadButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/api/curriculum/import/import-preset', {
        presetId: 'pei-grade1-french',
      });
    });
  });

  it('simulates file upload workflow', async () => {
    // Mock the upload and parse API calls
    mockApi.post
      .mockResolvedValueOnce({
        data: { sessionId: 'session-123' },
      })
      .mockResolvedValueOnce({
        data: {
          subjects: mockParsedSubjects,
          errors: [],
        },
      });

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    // Mock file drop
    const mockFile = new File(['curriculum content'], 'curriculum.pdf', {
      type: 'application/pdf',
    });

    let onDropCallback: (files: File[]) => void;
    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Simulate file drop
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/curriculum/import/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/api/curriculum/import/parse', {
        sessionId: 'session-123',
        useAiExtraction: true,
      });
    });
  });

  it('displays parsed curriculum results', async () => {
    // Setup the component with parsed data
    mockApi.post
      .mockResolvedValueOnce({ data: { sessionId: 'session-123' } })
      .mockResolvedValueOnce({ data: { subjects: mockParsedSubjects, errors: [] } });

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Trigger file upload
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });

    // Check summary stats
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 subjects
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 expectations total

    // Check subject tabs
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Language Arts')).toBeInTheDocument();

    // Check expectations are displayed
    expect(screen.getByText('B1.1')).toBeInTheDocument();
    expect(screen.getByText('demonstrate an understanding of addition')).toBeInTheDocument();
  });

  it('allows editing individual expectations', async () => {
    // Setup parsed data
    mockApi.post
      .mockResolvedValueOnce({ data: { sessionId: 'session-123' } })
      .mockResolvedValueOnce({ data: { subjects: mockParsedSubjects, errors: [] } });

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Trigger upload
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });

    // Click edit button for first expectation
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.querySelector('svg')); // Find edit icon
    if (editButton) {
      await user.click(editButton);
    }

    // Should show edit modal
    expect(screen.getByText('Edit Expectation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B1.1')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('demonstrate an understanding of addition'),
    ).toBeInTheDocument();
  });

  it('allows deleting expectations', async () => {
    // Setup parsed data
    mockApi.post
      .mockResolvedValueOnce({ data: { sessionId: 'session-123' } })
      .mockResolvedValueOnce({ data: { subjects: mockParsedSubjects, errors: [] } });

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Trigger upload
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });

    // Count initial expectations
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 total expectations

    // Click delete button (trash icon)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg')?.getAttribute('class')?.includes('trash'),
    );

    if (deleteButton) {
      await user.click(deleteButton);

      // Should update the count
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Now 2 expectations
      });
    }
  });

  it('handles final import submission', async () => {
    // Setup parsed data
    mockApi.post
      .mockResolvedValueOnce({ data: { sessionId: 'session-123' } })
      .mockResolvedValueOnce({ data: { subjects: mockParsedSubjects, errors: [] } })
      .mockResolvedValueOnce({ data: { success: true } }); // Final import

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Trigger upload
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });

    // Click final import button
    const importButton = screen.getByRole('button', { name: /import curriculum/i });
    await user.click(importButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/api/curriculum/import/session-123');
    });

    // Should navigate to curriculum page after delay
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/curriculum');
      },
      { timeout: 2000 },
    );
  });

  it('handles API errors gracefully', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Upload failed'));

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Trigger upload that will fail
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/failed to parse curriculum document/i)).toBeInTheDocument();
    });
  });

  it('shows loading progress during upload', async () => {
    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    // Mock API with delay
    mockApi.post
      .mockResolvedValueOnce({ data: { sessionId: 'session-123' } })
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { subjects: mockParsedSubjects, errors: [] } }), 100),
          ),
      );

    renderWithAuth(<CurriculumImportPage />);

    // Trigger upload
    onDropCallback!([mockFile]);

    // Should show progress indicators
    expect(screen.getByText('Processing document...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('allows starting over after parsing', async () => {
    // Setup parsed data
    mockApi.post
      .mockResolvedValueOnce({ data: { sessionId: 'session-123' } })
      .mockResolvedValueOnce({ data: { subjects: mockParsedSubjects, errors: [] } });

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Trigger upload
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });

    // Click start over
    const startOverButton = screen.getByRole('button', { name: /start over/i });
    await user.click(startOverButton);

    // Should return to upload interface
    expect(screen.getByText('Upload Curriculum Document')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
  });

  it('navigates back to curriculum page', async () => {
    renderWithAuth(<CurriculumImportPage />);

    const backButton = screen.getByRole('button', { name: /back to curriculum/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/curriculum');
  });

  it('disables load button when no preset is selected', () => {
    renderWithAuth(<CurriculumImportPage />);

    // Switch to preset tab
    const presetTab = screen.getByText('Use Preset');
    fireEvent.click(presetTab);

    const loadButton = screen.getByRole('button', { name: /load curriculum/i });
    expect(loadButton).toBeDisabled();
  });

  it('validates form data in edit expectation modal', async () => {
    // Setup parsed data
    mockApi.post
      .mockResolvedValueOnce({ data: { sessionId: 'session-123' } })
      .mockResolvedValueOnce({ data: { subjects: mockParsedSubjects, errors: [] } });

    const { useDropzone } = await import('react-dropzone');
    const mockUseDropzone = useDropzone as any;

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    let onDropCallback: (files: File[]) => void;

    mockUseDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ type: 'file' }),
        isDragActive: false,
      };
    });

    renderWithAuth(<CurriculumImportPage />);

    // Trigger upload
    onDropCallback!([mockFile]);

    await waitFor(() => {
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });

    // Open edit modal
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.querySelector('svg'));
    if (editButton) {
      await user.click(editButton);
    }

    // Clear required field
    const codeInput = screen.getByDisplayValue('B1.1');
    await user.clear(codeInput);

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Should require code field
    expect(codeInput).toBeInvalid();
  });

  it('handles different file types correctly', async () => {
    renderWithAuth(<CurriculumImportPage />);

    // Import the mocked useDropzone from the module
    const { useDropzone } = await import('react-dropzone');

    // The dropzone should accept PDF, DOCX, and TXT files
    expect(useDropzone).toHaveBeenCalledWith(
      expect.objectContaining({
        accept: {
          'application/pdf': ['.pdf'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'text/plain': ['.txt'],
        },
        maxFiles: 1,
      }),
    );
  });
});
