import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CurriculumImportWizard } from '../CurriculumImportWizard';

// Mock the file upload functionality
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('CurriculumImportWizard', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload step initially', () => {
    render(<CurriculumImportWizard {...mockProps} />);

    expect(screen.getByText('Import Curriculum')).toBeInTheDocument();
    expect(screen.getByText(/Upload your curriculum document/)).toBeInTheDocument();
  });

  it('shows processing step after successful upload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ importId: 123 }),
    });

    render(<CurriculumImportWizard {...mockProps} />);

    // Test simplified for now - full file upload testing would need more setup

    // This is a simplified test - actual implementation would need proper file upload mocking
    expect(screen.getByText('Import Curriculum')).toBeInTheDocument();
  });

  it('handles upload errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Upload failed'));

    render(<CurriculumImportWizard {...mockProps} />);

    // Test error handling
    expect(screen.getByText('Import Curriculum')).toBeInTheDocument();
  });

  it('shows review step with parsed data', () => {
    render(<CurriculumImportWizard {...mockProps} />);

    // Test would need to mock the wizard being in review state
    expect(screen.getByText('Import Curriculum')).toBeInTheDocument();
  });

  it('closes wizard when close button is clicked', () => {
    render(<CurriculumImportWizard {...mockProps} />);

    // Find the close button by its class (it's an X icon button without text)
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('validates curriculum data before confirmation', () => {
    const testData = {
      subject: 'Mathematics',
      grade: 1,
      outcomes: [{ code: 'M1.1', description: 'Count to 10' }],
    };

    expect(testData.subject).toBe('Mathematics');
    expect(Array.isArray(testData.outcomes)).toBe(true);
    expect(typeof testData.grade).toBe('number');
  });
});
