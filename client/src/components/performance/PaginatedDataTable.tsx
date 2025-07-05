import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
// Simple debounce implementation
const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

interface FetchParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, string | number | boolean>;
}

interface PaginatedDataTableProps<T> {
  columns: Column<T>[];
  fetchData: (params: FetchParams) => Promise<PaginatedResult<T>>;
  pageSize?: number;
  initialSort?: { key: keyof T; order: 'asc' | 'desc' };
  className?: string;
  emptyStateMessage?: string;
  searchPlaceholder?: string;
  enableGlobalSearch?: boolean;
}

export function PaginatedDataTable<T extends Record<string, unknown>>({
  columns,
  fetchData,
  pageSize = 25,
  initialSort,
  className = '',
  emptyStateMessage = 'No data available',
  enableGlobalSearch = false,
}: PaginatedDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>(initialSort?.key as string);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSort?.order || 'asc');
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [globalSearch, setGlobalSearch] = useState('');

  // Debounced filter updates
  const debouncedUpdateFilters = useMemo(
    () => debounce((newFilters: Record<string, string | number | boolean>) => {
      setFilters(newFilters);
      setCurrentPage(1); // Reset to first page when filtering
    }, 300),
    []
  );

  // Debounced global search
  const debouncedGlobalSearch = useMemo(
    () => debounce((search: string) => {
      setFilters(prev => ({
        ...prev,
        _global: search || undefined,
      }));
      setCurrentPage(1);
    }, 300),
    []
  );

  // Fetch data query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['paginatedData', currentPage, pageSize, sortBy, sortOrder, filters],
    queryFn: () => fetchData({
      page: currentPage,
      pageSize,
      sortBy,
      sortOrder,
      filters,
    }),
    placeholderData: (prev) => prev,
  });

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  }, [sortBy]);

  // Handle column filter
  const handleColumnFilter = useCallback((columnKey: string, value: string) => {
    const newFilters = { ...filters };
    if (value.trim()) {
      newFilters[columnKey] = value;
    } else {
      delete newFilters[columnKey];
    }
    debouncedUpdateFilters(newFilters);
  }, [filters, debouncedUpdateFilters]);

  // Handle global search
  const handleGlobalSearch = useCallback((value: string) => {
    setGlobalSearch(value);
    debouncedGlobalSearch(value);
  }, [debouncedGlobalSearch]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Generate pagination buttons
  const paginationButtons = useMemo(() => {
    if (!data) return [];

    const { totalPages } = data;
    const buttons: (number | string)[] = [];
    const maxButtons = 7;
    
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          buttons.push(i);
        }
        buttons.push('...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        buttons.push(1, '...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          buttons.push(i);
        }
      } else {
        buttons.push(1, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          buttons.push(i);
        }
        buttons.push('...', totalPages);
      }
    }

    return buttons;
  }, [data, currentPage]);

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Failed to load data</div>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Global Search */}
      {enableGlobalSearch && (
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search all columns..."
            value={globalSearch}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            className="max-w-md"
          />
          {data && (
            <div className="text-sm text-gray-500">
              Showing {data.items.length} of {data.total} results
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key as string) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIcon(column.key as string)}
                  </div>
                </th>
              ))}
            </tr>
            
            {/* Filter Row */}
            <tr className="bg-gray-25">
              {columns.map((column) => (
                <th key={`filter-${column.key as string}`} className="px-6 py-2">
                  {column.filterable && (
                    <Input
                      placeholder={`Filter by ${column.label.toLowerCase()}...`}
                      value={filters[column.key as string] || ''}
                      onChange={(e) => handleColumnFilter(column.key as string, e.target.value)}
                      className="text-sm"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <td key={`skeleton-${index}-${column.key as string}`} className="px-6 py-4">
                      <LoadingSkeleton variant="text" lines={1} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyStateMessage}
                </td>
              </tr>
            ) : (
              data?.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render 
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {data.page} of {data.totalPages} ({data.total} total items)
          </div>
          
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {paginationButtons.map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "primary" : "outline"}
                size="sm"
                onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                disabled={page === '...'}
                className={page === '...' ? 'cursor-default' : ''}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= (data?.totalPages || 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Loading overlay for data fetching */}
      {isLoading && data && (
        <div data-testid="loading-skeleton" className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}