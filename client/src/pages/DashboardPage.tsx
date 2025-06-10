import UnifiedWeekViewComponent from '../components/UnifiedWeekViewComponent';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';
import CalendarViewComponent from '../components/CalendarViewComponent';

export default function DashboardPage() {
  return (
    <div className="relative">
      <TeacherOnboardingFlow />
      <UnifiedWeekViewComponent />
      <CalendarViewComponent month={new Date()} />
    </div>
  );
}
