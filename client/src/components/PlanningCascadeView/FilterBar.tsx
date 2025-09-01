import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface FilterBarProps {
  filters: {
    academicYear?: string;
    subject?: string;
    grade?: number;
  };
  onFilterChange: (filters: {
    academicYear?: string;
    subject?: string;
    grade?: number;
  }) => void;
}

const ACADEMIC_YEARS = [
  '2024-2025',
  '2023-2024',
  '2022-2023',
];

const SUBJECTS = [
  'Français (Immersion)',
  'Mathématiques',
  'Sciences de la nature',
  'Sciences humaines',
  'Arts visuels',
  'Formation personnelle et sociale',
  'Éducation physique',
  'Musique',
];

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export function FilterBar({ filters, onFilterChange }: FilterBarProps): JSX.Element {
  const hasActiveFilters = filters.academicYear || filters.subject || filters.grade;

  const handleClearFilters = () => {
    onFilterChange({
      academicYear: undefined,
      subject: undefined,
      grade: undefined,
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      {/* Academic Year Filter */}
      <select
        className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filters.academicYear || ''}
        onChange={(e) => onFilterChange({
          ...filters,
          academicYear: e.target.value || undefined,
        })}
      >
        <option value="">All Years</option>
        {ACADEMIC_YEARS.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      {/* Subject Filter */}
      <select
        className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filters.subject || ''}
        onChange={(e) => onFilterChange({
          ...filters,
          subject: e.target.value || undefined,
        })}
      >
        <option value="">All Subjects</option>
        {SUBJECTS.map(subject => (
          <option key={subject} value={subject}>{subject}</option>
        ))}
      </select>

      {/* Grade Filter */}
      <select
        className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filters.grade || ''}
        onChange={(e) => onFilterChange({
          ...filters,
          grade: e.target.value ? parseInt(e.target.value) : undefined,
        })}
      >
        <option value="">All Grades</option>
        {GRADES.map(grade => (
          <option key={grade} value={grade}>Grade {grade}</option>
        ))}
      </select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-gray-600 hover:text-gray-900"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}