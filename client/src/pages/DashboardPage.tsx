import UnifiedWeekViewComponent from '../components/UnifiedWeekViewComponent';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';

export default function DashboardPage() {
  return (
    <div className="relative">
      <TeacherOnboardingFlow />
      <UnifiedWeekViewComponent />
    </div>
  );
}
