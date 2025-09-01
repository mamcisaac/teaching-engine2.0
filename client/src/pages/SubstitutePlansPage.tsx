/**
 * SubstitutePlansPage
 * Displays all substitute plans with one-click PDF export functionality
 * 
 * Features:
 * - Secure API calls with proper authentication
 * - Full internationalization support
 * - Enhanced error handling and user feedback
 */

import React, { useState, useEffect, useContext } from 'react';
import { apiClient } from '../api/core/client';
import { LanguageContext } from '../contexts/LanguageContext';
import SubstitutePlanCard from '../components/SubstitutePlanCard';

interface SubstitutePlan {
  id: string;
  title: string;
  dateFor: string;
  grade?: number;
  subject?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const SubstitutePlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubstitutePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [filterUpcoming, setFilterUpcoming] = useState(false);
  
  // Use language context for translations
  const languageContext = useContext(LanguageContext);
  const t = languageContext?.t || ((key: string) => key);

  useEffect(() => {
    fetchPlans();
  }, [filterActive, filterUpcoming]);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use apiClient which handles authentication automatically
      const response = await apiClient.get('/api/substitute-plans', {
        params: {
          ...(filterActive && { isActive: 'true' }),
          ...(filterUpcoming && { upcoming: 'true' }),
          limit: 50,
          sortBy: 'dateFor',
          sortOrder: 'desc'
        }
      });

      setPlans(response.data.plans || response.data);
    } catch (error: any) {
      console.error('Error fetching substitute plans:', error);
      
      // Handle specific error types
      let errorMessage = t('error');
      if (error.response?.status === 401) {
        errorMessage = t('error_unauthorized', 'Please log in to view substitute plans');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // Navigate to create new substitute plan page
    window.location.href = '/substitute-plans/new';
  };

  const handleEdit = (planId: string) => {
    // Navigate to edit page
    window.location.href = `/substitute-plans/${planId}/edit`;
  };

  const handleDelete = async (planId: string) => {
    if (!confirm(t('confirm_delete_substitute_plan', 'Are you sure you want to delete this substitute plan?'))) {
      return;
    }

    try {
      // Use apiClient which handles authentication automatically
      await apiClient.delete(`/api/substitute-plans/${planId}`);

      // Refresh the list
      fetchPlans();
    } catch (error: any) {
      console.error('Error deleting substitute plan:', error);
      
      // Handle specific error types
      let errorMessage = t('error_delete_substitute_plan', 'Failed to delete substitute plan');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('substitute_plans')}</h1>
              <p className="mt-2 text-gray-600">
                {t('substitute_plans_description', 'Manage your substitute teaching plans with one-click PDF export')}
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('create_new_plan', 'Create New Plan')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600"
                checked={filterActive}
                onChange={(e) => setFilterActive(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">{t('active_plans_only', 'Active Plans Only')}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600"
                checked={filterUpcoming}
                onChange={(e) => setFilterUpcoming(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">{t('upcoming_plans', 'Upcoming Plans')}</span>
            </label>
            <button
              onClick={fetchPlans}
              className="ml-auto inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('refresh', 'Refresh')}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_substitute_plans', 'No substitute plans')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('no_substitute_plans_description', 'Get started by creating a new substitute plan.')}</p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('create_first_plan', 'Create Your First Plan')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <SubstitutePlanCard
                key={plan.id}
                plan={plan}
                onUpdate={() => handleEdit(plan.id)}
                onDelete={() => handleDelete(plan.id)}
              />
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">{t('quick_tips', 'Quick Tips')}</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>{t('substitute_tip_1', 'Click "Export PDF" on any plan to instantly download a comprehensive substitute teacher document')}</li>
            <li>{t('substitute_tip_2', 'The PDF includes class routines, emergency information, lesson plans, and recent teaching notes')}</li>
            <li>{t('substitute_tip_3', 'Keep your class routines updated in Settings for more detailed substitute plans')}</li>
            <li>{t('substitute_tip_4', 'Recent daybook entries are automatically included to provide context for substitutes')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubstitutePlansPage;