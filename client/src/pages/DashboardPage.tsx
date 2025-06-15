import UnifiedWeekViewComponent from '../components/UnifiedWeekViewComponent';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';
import CalendarViewComponent from '../components/CalendarViewComponent';
import NotificationBell from '../components/NotificationBell';
import OralRoutineSummary from '../components/OralRoutineSummary';

export default function DashboardPage() {
  return (
    <div className="relative">
      <NotificationBell />
      <TeacherOnboardingFlow />

      {/* Quick Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OralRoutineSummary />
        </div>
      </div>

      <UnifiedWeekViewComponent />
      <CalendarViewComponent month={new Date()} />
    </div>
  );
}
