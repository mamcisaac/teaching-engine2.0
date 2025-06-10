import UnifiedWeekViewComponent from '../components/UnifiedWeekViewComponent';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';
import CalendarViewComponent from '../components/CalendarViewComponent';
import NotificationBell from '../components/NotificationBell';

export default function DashboardPage() {
  return (
    <div className="relative">
      <NotificationBell />
      <TeacherOnboardingFlow />
      <UnifiedWeekViewComponent />
      <CalendarViewComponent month={new Date()} />
    </div>
  );
}
