import React from 'react';
import StudentTimeline from '../components/StudentTimeline';

const TimelinePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Learning Timeline</h1>
        <p className="text-gray-600 mt-2">
          Visualize the learning journey through outcomes, assessments, activities, and themes
        </p>
      </div>

      <StudentTimeline />
    </div>
  );
};

export default TimelinePage;
