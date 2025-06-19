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
          {summary.isDraft && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
              Draft
            </span>
          )}
        </div>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {student.firstName} {student.lastName}
        </h2>
        <p className="text-gray-600">
          Period: {formatDate(summary.dateFrom)} - {formatDate(summary.dateTo)}
        </p>
        {focus.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">Focus Areas: {focus.join(', ')}</p>
        )}
        {summary.isDraft && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
            Draft
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* French Version */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            🇫🇷 Version française
          </h3>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{summary.contentFr}</div>
          </div>
        </div>

        {/* English Version */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            🇬🇧 English Version
          </h3>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{summary.contentEn}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Created: {formatDate(summary.createdAt)} | Last updated: {formatDate(summary.updatedAt)}
        </p>
      </div>
    </div>
  );
}
