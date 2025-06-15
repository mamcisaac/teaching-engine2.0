import { useOralRoutineStats } from '../api';

interface OralRoutineSummaryProps {
  className?: string;
}

export default function OralRoutineSummary({ className = '' }: OralRoutineSummaryProps) {
  // Get current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const { data: stats, isLoading } = useOralRoutineStats({
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString(),
  });

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-100 rounded-lg h-24 ${className}`}></div>;
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
  const participationDisplay = stats.averageParticipation
    ? `${stats.averageParticipation}% avg`
    : 'No data';

  const getCompletionColor = () => {
    if (completionRate >= 80) return 'text-green-600';
    if (completionRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionIcon = () => {
    if (completionRate >= 80) return '🔥';
    if (completionRate >= 60) return '👍';
    return '😐';
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📢</span>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Oral Routines</h3>
            <p className="text-xs text-gray-600">This week's progress</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${getCompletionColor()} flex items-center gap-1`}>
            <span>{getCompletionIcon()}</span>
            <span>
              {stats.completedRoutines}/{stats.totalRoutines}
            </span>
          </div>
          <div className="text-xs text-gray-500">{participationDisplay}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              completionRate >= 80
                ? 'bg-green-500'
                : completionRate >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{completionRate}% complete</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
