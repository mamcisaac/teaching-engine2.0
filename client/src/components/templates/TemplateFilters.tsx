import { X, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { TemplateSearchOptions, TemplateCategory } from '../../types/template';
import { TEMPLATE_CATEGORIES, TEMPLATE_TYPES } from '../../types/template';

interface TemplateFiltersProps {
  filters: TemplateSearchOptions;
  onFiltersChange: (filters: TemplateSearchOptions) => void;
  availableSubjects: string[];
  availableGrades: number[];
}

const SORT_OPTIONS = [
  { value: 'title', label: 'Title' },
  { value: 'usageCount', label: 'Most Used' },
  { value: 'averageRating', label: 'Highest Rated' },
  { value: 'createdAt', label: 'Newest First' },
  { value: 'lastUsedAt', label: 'Recently Used' },
];

export default function TemplateFilters({
  filters,
  onFiltersChange,
  availableSubjects,
  availableGrades,
}: TemplateFiltersProps) {
  const updateFilter = (key: keyof TemplateSearchOptions, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'usageCount',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.type ||
    filters.category ||
    filters.subject ||
    filters.gradeMin ||
    filters.gradeMax ||
    filters.search ||
    (filters.tags && filters.tags.length > 0);

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Templates
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 lg:col-span-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Template Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TEMPLATE_TYPES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) =>
              updateFilter('category', value === 'all' ? undefined : (value as TemplateCategory))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <Select
            value={filters.subject || 'all'}
            onValueChange={(value) => updateFilter('subject', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
          <div className="flex gap-2 items-center">
            <Select
              value={filters.gradeMin?.toString() || 'all'}
              onValueChange={(value) =>
                updateFilter('gradeMin', value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-500">to</span>
            <Select
              value={filters.gradeMax?.toString() || 'all'}
              onValueChange={(value) =>
                updateFilter('gradeMax', value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <Select
            value={filters.sortBy || 'usageCount'}
            onValueChange={(value) =>
              updateFilter(
                'sortBy',
                value as 'title' | 'usageCount' | 'averageRating' | 'createdAt' | 'lastUsedAt',
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={filters.isSystem === true}
            onChange={(e) => updateFilter('isSystem', e.target.checked ? true : undefined)}
            className="rounded border-gray-300"
          />
          <span>System Templates Only</span>
        </label>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={filters.isPublic === true}
            onChange={(e) => updateFilter('isPublic', e.target.checked ? true : undefined)}
            className="rounded border-gray-300"
          />
          <span>Public Templates Only</span>
        </label>
      </div>
    </div>
  );
}
