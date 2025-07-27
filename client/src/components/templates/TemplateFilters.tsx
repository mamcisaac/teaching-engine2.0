import { Filter, X } from 'lucide-react';

import type { TemplateCategory, TemplateSearchOptions } from '../../types/template';
import { TEMPLATE_CATEGORIES, TEMPLATE_TYPES } from '../../types/template';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

export function TemplateFilters({
  filters,
  onFiltersChange,
  availableSubjects,
  availableGrades,
}: TemplateFiltersProps): React.ReactElement {
  const updateFilter = (key: keyof TemplateSearchOptions, value: unknown): void => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = (): void => {
    onFiltersChange({
      sortBy: 'usageCount',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.type != undefined ||
    filters.category != undefined ||
    (filters.subject != undefined && filters.subject != '') ||
    filters.gradeMin != undefined ||
    filters.gradeMax != undefined ||
    (filters.search != undefined && filters.search != '') ||
    (filters.tags != undefined && filters.tags.length > 0);

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Templates
        </h3>
        {hasActiveFilters && (
          <Button
            className="text-gray-500 hover:text-gray-700"
            size="sm"
            variant="ghost"
            onClick={clearFilters}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search templates..."
            type="text"
            value={filters.search ?? ''}
            onChange={(e): void => {
 updateFilter('search', e.target.value); 
}}
          />
        </div>

        {/* Template Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filter-type">Type</label>
          <Select
            value={filters.type ?? 'all'}
            onValueChange={(value): void => {
 updateFilter('type', value === 'all' ? undefined : value); 
}}
          >
            <SelectTrigger id="filter-type">
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filter-category">Category</label>
          <Select
            value={filters.category ?? 'all'}
            onValueChange={(value): void => {
 updateFilter('category', value === 'all' ? undefined : (value as TemplateCategory)); 
}
            }
          >
            <SelectTrigger id="filter-category">
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filter-subject">Subject</label>
          <Select
            value={filters.subject ?? 'all'}
            onValueChange={(value): void => {
 updateFilter('subject', value === 'all' ? undefined : value); 
}}
          >
            <SelectTrigger id="filter-subject">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map((subject, _index) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filter-grade-min">Grade Level</label>
          <div className="flex gap-2 items-center">
            <Select
              value={filters.gradeMin != undefined ? filters.gradeMin.toString() : 'all'}
              onValueChange={(value): void => {
 updateFilter('gradeMin', value === 'all' ? undefined : parseInt(value)); 
}
              }
            >
              <SelectTrigger className="flex-1" id="filter-grade-min">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {availableGrades.map((grade, _index) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-500">to</span>
            <Select
              value={filters.gradeMax != undefined ? filters.gradeMax.toString() : 'all'}
              onValueChange={(value): void => {
 updateFilter('gradeMax', value === 'all' ? undefined : parseInt(value)); 
}
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {availableGrades.map((grade, _index) => (
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filter-sort-by">Sort By</label>
          <Select
            value={filters.sortBy ?? 'usageCount'}
            onValueChange={(value): void => {
 updateFilter(
                'sortBy',
                value as 'title' | 'usageCount' | 'averageRating' | 'createdAt' | 'lastUsedAt',
              ); 
}
            }
          >
            <SelectTrigger id="filter-sort-by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option, _index) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filter-sort-order">Order</label>
          <Select
            value={filters.sortOrder ?? 'desc'}
            onValueChange={(value): void => {
 updateFilter('sortOrder', value as 'asc' | 'desc'); 
}}
          >
            <SelectTrigger id="filter-sort-order">
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
            checked={Boolean(filters.isSystem)}
            className="rounded border-gray-300"
            type="checkbox"
            onChange={(e): void => {
 updateFilter('isSystem', e.target.checked ? true : undefined); 
}}
          />
          <span>System Templates Only</span>
        </label>
        <label className="flex items-center space-x-2 text-sm">
          <input
            checked={Boolean(filters.isPublic)}
            className="rounded border-gray-300"
            type="checkbox"
            onChange={(e): void => {
 updateFilter('isPublic', e.target.checked ? true : undefined); 
}}
          />
          <span>Public Templates Only</span>
        </label>
      </div>
    </div>
  );
}
