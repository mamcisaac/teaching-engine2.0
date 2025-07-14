import { useRoutineStats } from '../api/domains/routine/hooks';

interface OralRoutineSummaryProps {
  className?: string;
}

export function OralRoutineSummary({ className = '' }: OralRoutineSummaryProps): React.ReactElement {
  // Get current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const { data: stats, isLoading } = useRoutineStats({
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString(),
  });

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-100 rounded-lg h-24 ${className}`} />;
  }

  if (!stats || stats.totalRoutines === 0) {
    return (
      <div className={`bg-blue-50 rounded-lg p-4 border border-blue-200 ${className}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📢</span>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Oral Routines</h3>
            <p className="text-xs text-blue-700">No routines scheduled this week</p>
          </div>
        </div>
      </div>
    );
  }

  const completionRate = Math.round((stats.completedRoutines / stats.totalRoutines) * 100);
  const participationDisplay = stats.averageEngagement
    ? `${Math.round(stats.averageEngagement * 100)}% avg`
    : 'No data';

  const getCompletionColor = (): string => {
    if (completionRate >= 80) {
return 'text-green-600';
}
    if (completionRate >= 60) {
return 'text-yellow-600';
}
    return 'text-red-600';
  };

  const getCompletionIcon = (): string => {
    if (completionRate >= 80) {
