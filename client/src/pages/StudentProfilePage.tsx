import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentProfileDashboard from '../components/StudentProfileDashboard';
import { Button } from '../components/ui/Button';

const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0', 10);

  if (!studentId || isNaN(studentId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Student ID</h1>
          <Button
            onClick={() => navigate('/students')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/students')} variant="secondary" size="sm">
            ← Back to Students
          </Button>
        </div>
      </div>

      {/* Student Profile Dashboard */}
      <StudentProfileDashboard studentId={studentId} />
    </div>
  );
};

export default StudentProfilePage;
