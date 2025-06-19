import React from 'react';
import type { ParentSummary, Student } from '../types';

interface ParentSummaryPreviewProps {
  summary: ParentSummary;
  student: Student;
  showBothLanguages?: boolean;
  preferredLanguage?: 'en' | 'fr';
}

export default function ParentSummaryPreview({
  summary,
  student,
  showBothLanguages = true,
  preferredLanguage = 'en',
}: ParentSummaryPreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateFr = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const focus = summary.focus ? JSON.parse(summary.focus) : [];

  if (!showBothLanguages) {
    const content = preferredLanguage === 'fr' ? summary.contentFr : summary.contentEn;
    const dateFormatter = preferredLanguage === 'fr' ? formatDateFr : formatDate;
    const periodLabel = preferredLanguage === 'fr' ? 'Période' : 'Period';
    const focusLabel = preferredLanguage === 'fr' ? "Domaines d'intérêt" : 'Focus Areas';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-gray-600">
            {periodLabel}: {dateFormatter(summary.dateFrom)} - {dateFormatter(summary.dateTo)}
          </p>
          {focus.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {focusLabel}: {focus.join(', ')}
            </p>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {summary.isDraft && (
          <div className="mt-4 flex items-center text-sm text-amber-600">
            <span className="mr-1">⚠️</span>
            {preferredLanguage === 'fr' ? 'Brouillon' : 'Draft'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {student.firstName} {student.lastName}
        </h2>
        <div className="flex flex-col sm:flex-row sm:justify-between text-gray-600 text-sm">
          <span>
            Period: {formatDate(summary.dateFrom)} - {formatDate(summary.dateTo)}
          </span>
          <span>
            Période: {formatDateFr(summary.dateFrom)} - {formatDateFr(summary.dateTo)}
          </span>
        </div>
        {focus.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between text-gray-500 text-sm mt-1">
            <span>Focus Areas: {focus.join(', ')}</span>
            <span>Domaines d'intérêt: {focus.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* French Summary */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🇫🇷</span>
            Français
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{summary.contentFr}</p>
          </div>
        </div>

        {/* English Summary */}
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🇬🇧</span>
            English
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{summary.contentEn}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          {summary.isDraft && (
            <span className="text-amber-600 mr-4 flex items-center">
              <span className="mr-1">⚠️</span>
              Draft / Brouillon
            </span>
          )}
          <span>Created: {formatDate(summary.createdAt)}</span>
          {summary.updatedAt !== summary.createdAt && (
            <span className="ml-2">• Updated: {formatDate(summary.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for lists
export function ParentSummaryCard({
  summary,
  student,
  onClick,
}: {
  summary: ParentSummary;
  student: Student;
  onClick?: () => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const focus = summary.focus ? JSON.parse(summary.focus) : [];

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-sm text-gray-600">
            {formatDate(summary.dateFrom)} - {formatDate(summary.dateTo)}
          </p>
        </div>
        {summary.isDraft && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Draft
          </span>
        )}
      </div>

      {focus.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {focus.map((area: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="border-l-2 border-blue-400 pl-2">
          <p className="text-gray-700 text-xs mb-1">🇫🇷 Français</p>
          <p className="text-gray-600 line-clamp-3">{summary.contentFr}</p>
        </div>
        <div className="border-l-2 border-red-400 pl-2">
          <p className="text-gray-700 text-xs mb-1">🇬🇧 English</p>
          <p className="text-gray-600 line-clamp-3">{summary.contentEn}</p>
        </div>
      </div>
    </div>
  );
}
