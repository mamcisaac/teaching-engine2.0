import React from 'react';
import SubjectList from '../components/SubjectList';
import { CurriculumImportButton } from '../components/CurriculumImportButton';
import { useSubjects } from '../api';

export default function SubjectsPage() {
  const { data = [], isLoading, refetch } = useSubjects();

  if (isLoading) return <div>Loading...</div>;

  const handleImportSuccess = () => {
    // Refresh the subjects list after successful import
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <div className="flex space-x-3">
          <CurriculumImportButton 
            onImportSuccess={handleImportSuccess}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.523 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.523 19.246 19 16.5 19c-1.746 0-3.332-.523-4.5-1.253" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No subjects yet</h3>
            <p className="mt-2 text-gray-600">
              Get started by importing your curriculum or creating subjects manually.
            </p>
            <div className="mt-6">
              <CurriculumImportButton 
                onImportSuccess={handleImportSuccess}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <SubjectList subjects={data} />
      )}
    </div>
  );
}
