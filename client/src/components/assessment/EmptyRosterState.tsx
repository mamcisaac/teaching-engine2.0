import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface EmptyRosterStateProps {
  onAction: () => void;
  message?: string;
}

export function EmptyRosterState({ onAction, message = "You need to add students to your roster before you can start assessments." }: EmptyRosterStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Students in Roster</h3>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Set Up Student Roster
      </button>
    </div>
  );
}