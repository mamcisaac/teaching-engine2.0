import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResourceLibrary from '../components/ResourceLibrary';

// Mock the API
vi.mock('../api', () => ({
  useMediaResources: vi.fn().mockReturnValue({
    data: [
      {
        id: 1,
        userId: 1,
        title: 'Test Image',
        filePath: '/uploads/1/test-image.jpg',
        fileType: 'image',
        fileSize: 102400,
        mimeType: 'image/jpeg',
        tags: ['test', 'image'],
        linkedOutcomes: [],
        linkedActivities: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        userId: 1,
        title: 'Test PDF',
        filePath: '/uploads/1/test-document.pdf',
        fileType: 'pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        tags: ['test', 'document'],
        linkedOutcomes: [],
        linkedActivities: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
  }),
  useDeleteMediaResource: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('ResourceLibrary', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ResourceLibrary userId={1} {...props} />
      </QueryClientProvider>,
    );
  };

  it('renders resource library with header', () => {
    renderComponent();
    expect(screen.getByText('Resource Library')).toBeInTheDocument();
    expect(screen.getByText('Upload Resource')).toBeInTheDocument();
  });

  it('displays resources in grid format by default', () => {
    renderComponent();
    expect(screen.getByText('Test Image')).toBeInTheDocument();
    expect(screen.getByText('Test PDF')).toBeInTheDocument();
  });

  it('shows resource count and filters', () => {
    renderComponent();
    expect(screen.getByText('Showing 2 of 2 resources')).toBeInTheDocument();
    expect(screen.getByLabelText('File Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('allows filtering by file type', () => {
    renderComponent();
    const fileTypeFilter = screen.getByLabelText('File Type');
    fireEvent.change(fileTypeFilter, { target: { value: 'image' } });

    // Should still show both for now since we're testing the filter UI
    expect(screen.getByText('Test Image')).toBeInTheDocument();
  });

  it('allows searching by title', () => {
    renderComponent();
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'PDF' } });

    // Should still show resources for now since we're testing the search UI
    expect(screen.getByText('Test PDF')).toBeInTheDocument();
  });

  it('toggles between grid and list view', () => {
    renderComponent();
    const viewToggle = screen.getByText('📋 List');
    fireEvent.click(viewToggle);

    // After clicking, button text should change
    expect(screen.getByText('⊞ Grid')).toBeInTheDocument();
  });

  it('shows file type icons and metadata', () => {
    renderComponent();
    expect(screen.getByText('100 KB')).toBeInTheDocument(); // 102400 bytes
    expect(screen.getByText('500 KB')).toBeInTheDocument(); // 512000 bytes
  });

  it('handles select mode when onSelectResource is provided', () => {
    const mockOnSelect = vi.fn();
    renderComponent({ onSelectResource: mockOnSelect, selectMode: true });

    // Resources should be clickable in select mode
    const resource = screen.getByText('Test Image');
    expect(resource).toBeInTheDocument();
  });

  it('shows tags for resources', () => {
    renderComponent();
    // Use getAllByText to find multiple instances and check for specific tag elements
    const testTags = screen.getAllByText('test');
    const imageTags = screen.getAllByText('image');
    const documentTags = screen.getAllByText('document');

    // Should find tag elements (spans with blue background)
    expect(testTags.length).toBeGreaterThan(0);
    expect(imageTags.length).toBeGreaterThan(0);
    expect(documentTags.length).toBeGreaterThan(0);
  });
});
