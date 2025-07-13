import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ResourceSelector from '../ResourceSelector';

// Mock the media resources hook
vi.mock('../../api/domains/resource', () => ({
  useMediaResources: vi.fn(),
}));

vi.mock('../Dialog', () => ({
  default: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
}));

import { useMediaResources } from '../../api/domains/resource';

describe('ResourceSelector', () => {
  const mockUseMediaResources = useMediaResources as ReturnType<typeof vi.fn>;
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  const mockResources = [
    {
      id: 1,
      title: 'Test Image',
      type: 'image',
      fileUrl: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      fileSize: 1024 * 1024,
      tags: ['test', 'image'],
    },
    {
      id: 2,
      title: 'Test PDF',
      type: 'pdf',
      fileUrl: 'https://example.com/document.pdf',
      thumbnailUrl: null,
      fileSize: 2048 * 1024,
      tags: ['document'],
    },
    {
      id: 3,
      title: 'Test Video',
      type: 'video',
      fileUrl: 'https://example.com/video.mp4',
      thumbnailUrl: null,
      fileSize: 0,
      tags: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMediaResources.mockReturnValue({
      data: { resources: mockResources },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);
  });

  it('renders loading state when data is loading', () => {
    mockUseMediaResources.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('Loading resources...')).toBeInTheDocument();
  });

  it('renders empty state when no resources exist', () => {
    mockUseMediaResources.mockReturnValue({
      data: { resources: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('No resources available')).toBeInTheDocument();
  });

  it('filters resources by search term', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByPlaceholderText('Search resources...');
    fireEvent.change(searchInput, { target: { value: 'PDF' } });
    
    expect(screen.getByText('Test PDF')).toBeInTheDocument();
    expect(screen.queryByText('Test Image')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
  });

  it('filters resources by file type', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const fileTypeSelect = screen.getByLabelText('File Type');
    fireEvent.change(fileTypeSelect, { target: { value: 'image' } });
    
    expect(screen.getByText('Test Image')).toBeInTheDocument();
    expect(screen.queryByText('Test PDF')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
  });

  it('disables file type filter when fileTypeFilter prop is provided', () => {
    render(
      <ResourceSelector
        userId={1}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        fileTypeFilter="pdf"
      />
    );
    
    const fileTypeSelect = screen.getByLabelText('File Type');
    expect(fileTypeSelect).toBeDisabled();
    expect(fileTypeSelect).toHaveValue('pdf');
  });

  it('calls onSelect when resource is clicked', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const resourceCard = screen.getByText('Test Image').closest('div[class*="border rounded-lg"]');
    fireEvent.click(resourceCard!);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockResources[0]);
  });

  it('displays correct file size formatting', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('2 MB')).toBeInTheDocument();
  });

  it('handles zero file size correctly', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('0 Bytes')).toBeInTheDocument();
  });

  it('shows correct number of tags', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getByText('document')).toBeInTheDocument();
  });

  it('truncates tags when more than 2', () => {
    const resourceWithManyTags = {
      ...mockResources[0],
      tags: ['tag1', 'tag2', 'tag3', 'tag4'],
    };
    
    mockUseMediaResources.mockReturnValue({
      data: { resources: [resourceWithManyTags] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles undefined data gracefully', () => {
    mockUseMediaResources.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('No resources available')).toBeInTheDocument();
  });

  it('handles resources with no tags', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const videoCard = screen.getByText('Test Video').closest('div[class*="border rounded-lg"]');
    expect(videoCard).not.toContain(screen.queryByText('+'));
  });

  it('shows filtered count correctly', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    expect(screen.getByText('3 of 3 resources')).toBeInTheDocument();
    
    const searchInput = screen.getByPlaceholderText('Search resources...');
    fireEvent.change(searchInput, { target: { value: 'Image' } });
    
    expect(screen.getByText('1 of 3 resources')).toBeInTheDocument();
  });

  it('shows correct message when search has no results', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const searchInput = screen.getByPlaceholderText('Search resources...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No resources match your search')).toBeInTheDocument();
  });

  it('handles image error by showing icon fallback', () => {
    render(<ResourceSelector userId={1} onSelect={mockOnSelect} onClose={mockOnClose} />);
    
    const image = screen.getByAltText('Test Image') as HTMLImageElement;
    fireEvent.error(image);
    
    expect(image.style.display).toBe('none');
  });

  it('uses custom title when provided', () => {
    render(
      <ResourceSelector
        userId={1}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        title="Choose a File"
      />
    );
    
    expect(screen.getByText('Choose a File')).toBeInTheDocument();
  });
});