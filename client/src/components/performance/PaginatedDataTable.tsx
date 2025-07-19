import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import { LoadingSkeleton } from './LoadingSkeleton';

// Type-safe debounce implementation
type DebounceFunction<T extends unknown[]> = (...args: T) => void;

const debounce = <T extends unknown[]>(
  func: DebounceFunction<T>,
  wait: number,
): DebounceFunction<T> => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: T): void => {
    clearTimeout(timeout);
    timeout = setTimeout((): void => {
 func(...args); 
}, wait);
  };
};

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
}: PaginatedDataTableProps<T>): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>(initialSort?.key as string);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSort?.order ?? 'asc');
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [globalSearch, setGlobalSearch] = useState('');

  // Debounced filter updates
  const debouncedUpdateFilters = useMemo(
    () =>
      debounce<[Record<string, string | number | boolean>]>((newFilters: Record<string, string | number | boolean>) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filtering
      }, 300),
    [],
  );

  // Debounced global search
  const debouncedGlobalSearch = useMemo(
    () =>
      debounce<[string]>((search: string) => {
        setFilters((prev) => {
          const newFilters = { ...prev };
          if (search) {
            newFilters._global = search;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete newFilters._global;
          }
          return newFilters;
        });
        setCurrentPage(1);
      }, 300),
    [],
  );

  // Fetch data query
  const { data, isLoading, error, refetch } = useQuery<PaginatedResult<T>>({
    queryKey: ['paginatedData', currentPage, pageSize, sortBy, sortOrder, filters],
    queryFn: () =>
      fetchData({
        page: currentPage,
        pageSize,
        sortBy,
        sortOrder,
        filters,
      }),
    placeholderData: (prev) => prev,
  });

  // Handle sorting
  const handleSort = useCallback(
    (columnKey: string) => {
      if (sortBy === columnKey) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(columnKey);
        setSortOrder('asc');
      }
      setCurrentPage(1);
    },
    [sortBy],
  );

  // Handle column filter
  const handleColumnFilter = useCallback(
    (columnKey: string, value: string) => {
      const newFilters = { ...filters };
      if (value.trim()) {
        newFilters[columnKey] = value;
      } else {
        delete newFilters[columnKey];
      }
      debouncedUpdateFilters(newFilters);
    },
    [filters, debouncedUpdateFilters],
  );

  // Handle global search
  const handleGlobalSearch = useCallback(
    (value: string) => {
      setGlobalSearch(value);
      debouncedGlobalSearch(value);
    },
    [debouncedGlobalSearch],
  );

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [])

  // Generate pagination buttons
  const paginationButtons = useMemo(() => {
    if (!data) {
return [];
}

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
  const renderSortIcon = (columnKey: string): JSX.Element => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Failed to load data</div>
        <Button aria-label="Click button" onClick={() => {
 void refetch(); 
}}>
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
            className="max-w-md"
            onChange={(e) => {
 handleGlobalSearch(e.target.value); 
}}
            placeholder="Search all columns..."
            value={globalSearch}
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
              {columns.map((column, _index) => (
                <th
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable === true ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  key={column.key as string}
                  onClick={column.sortable === true ? (): void => {
 handleSort(column.key as string); 
} : undefined}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable === true && renderSortIcon(column.key as string)}
                  </div>
                </th>
              ))}
            </tr>

            {/* Filter Row */}
            <tr className="bg-gray-25">
              {columns.map((column, _index) => (
                <th className="px-6 py-2" key={`filter-${column.key as string}`}>
                  {column.filterable === true && (
                    <Input
                      className="text-sm"
                      onChange={(e) => {
 handleColumnFilter(column.key as string, e.target.value); 
}}
                      placeholder={`Filter by ${column.label.toLowerCase()}...`}
                      value={(filters[column.key as string] as string) || ''}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, _index) => (
                <tr key={`skeleton-${_index}`}>
                  {columns.map((column, _colIndex) => (
                    <td className="px-6 py-4" key={`skeleton-${_index}-${column.key as string}`}>
                      <LoadingSkeleton lines={1} variant="text" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={columns.length}>
                  {emptyStateMessage}
                </td>
              </tr>
            ) : (
              data?.items.map((item, _index) => (
                <tr className="hover:bg-gray-50" key={_index}>
                  {columns.map((column, _index) => (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      key={column.key as string}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] ?? '')}
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
              disabled={currentPage <= 1}
              onClick={() => {
 handlePageChange(currentPage - 1); 
}}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {paginationButtons.map((page, _index) => (
              <Button
                className={page === '...' ? 'cursor-default' : ''}
                disabled={page === '...'}
                key={_index}
                onClick={() => {
 typeof page === 'number' ? handlePageChange(page) : undefined; 
}}
                size="sm"
                variant={page === currentPage ? 'primary' : 'outline'}
              >
                {page}
              </Button>
            ))}

            <Button
              disabled={currentPage >= (data.totalPages || 1)}
              onClick={() => {
 handlePageChange(currentPage + 1); 
}}
              size="sm"
              variant="outline"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Loading overlay for data fetching */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
          data-testid="loading-skeleton"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
}
