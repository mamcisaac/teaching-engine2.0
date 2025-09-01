/**
 * SubstitutePlanCard Component
 * Displays substitute plan information with one-click PDF export functionality
 */

import React, { useState } from 'react';
import { substituteApi } from '../api/domains/substitute/api';

interface SubstitutePlanCardProps {
  plan: {
    id: string;
    title: string;
    dateFor: string | Date;
    grade?: number;
    subject?: string;
    isActive?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
  onUpdate?: () => void;
  onDelete?: () => void;
}

export const SubstitutePlanCard: React.FC<SubstitutePlanCardProps> = ({ 
  plan, 
  onUpdate, 
  onDelete 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Call the PDF export endpoint with proper authentication
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`/api/substitute-plans/${plan.id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/pdf',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to export PDF: ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Format filename with date
      const date = new Date(plan.dateFor);
      const dateStr = date.toISOString().split('T')[0];
      link.download = `substitute-plan-${dateStr}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting substitute plan PDF:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {plan.title}
          </h3>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Date:</span> {formatDate(plan.dateFor)}
          </p>
          {plan.grade && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Grade:</span> {plan.grade}
            </p>
          )}
          {plan.subject && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Subject:</span> {plan.subject}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {plan.isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Active
            </span>
          )}
        </div>
      </div>

      {exportError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{exportError}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
              ${isExporting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }
              transition-colors duration-200
            `}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </>
            )}
          </button>

          {onUpdate && (
            <button
              onClick={onUpdate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SubstitutePlanCard;