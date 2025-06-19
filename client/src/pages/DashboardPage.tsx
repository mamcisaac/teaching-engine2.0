import UnifiedWeekViewComponent from '../components/UnifiedWeekViewComponent';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';
import CalendarViewComponent from '../components/CalendarViewComponent';
import NotificationBell from '../components/NotificationBell';
import OralRoutineSummary from '../components/OralRoutineSummary';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="relative">
      <NotificationBell />
      <TeacherOnboardingFlow />

      {/* Quick Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OralRoutineSummary />

          {/* Timeline Quick Access */}
          <Link
            to="/timeline"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learning Timeline</h3>
                <p className="text-sm text-gray-600">View learning journey</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <UnifiedWeekViewComponent />
      <CalendarViewComponent month={new Date()} />
    </div>
  );
}
