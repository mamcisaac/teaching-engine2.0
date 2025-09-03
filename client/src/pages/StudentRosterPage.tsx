import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentRoster } from '../components/assessment/StudentRoster';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function StudentRosterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Student Roster</h1>
          <p className="text-gray-600 mt-2">
            Add, edit, or remove students from your class roster. This roster will be used for all assessments.
          </p>
        </div>

        <StudentRoster />

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Your roster is automatically saved to your browser</li>
            <li>• Changes take effect immediately in all assessments</li>
            <li>• Use the backup feature regularly to save your data</li>
            <li>• Maximum recommended class size is 30 students</li>
          </ul>
        </div>
      </div>
    </div>
  );
}