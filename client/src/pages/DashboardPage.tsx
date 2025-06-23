import { useState } from 'react';
import UnifiedWeekViewComponent from '../components/UnifiedWeekViewComponent';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';
import CalendarViewComponent from '../components/CalendarViewComponent';
import NotificationBell from '../components/NotificationBell';
import OralRoutineSummary from '../components/OralRoutineSummary';
import MilestoneAlertCard from '../components/MilestoneAlertCard';
import EvidenceQuickEntry from '../components/evidence/EvidenceQuickEntry';
import useMilestoneAlerts from '../hooks/useMilestoneAlerts';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle, ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: alertsData, isLoading: alertsLoading } = useMilestoneAlerts();
  const [showEvidenceEntry, setShowEvidenceEntry] = useState(false);

  // Extract alerts array from response (handle both legacy and new API)
  const alerts = Array.isArray(alertsData) ? alertsData : alertsData?.alerts || [];

  // Filter alerts by priority for display
  const highPriorityAlerts = alerts.filter((alert) => alert.priority === 'high');
  const mediumPriorityAlerts = alerts.filter((alert) => alert.priority === 'medium');

  return (
    <div className="relative">
      <NotificationBell />
      <TeacherOnboardingFlow />

      {/* Quick Evidence Entry */}
      <div className="mb-6">
        <button
          onClick={() => setShowEvidenceEntry(!showEvidenceEntry)}
          className="w-full flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 hover:from-purple-100 hover:to-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 rounded-lg p-2">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Quick Evidence Entry</h3>
              <p className="text-sm text-gray-600">Record student observations and assessments</p>
            </div>
          </div>
          {showEvidenceEntry ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showEvidenceEntry && (
          <div className="mt-4 animate-in slide-in-from-top duration-200">
            <EvidenceQuickEntry
              onSuccess={() => {
                // Optionally close after success
                setTimeout(() => setShowEvidenceEntry(false), 1000);
              }}
            />
          </div>
        )}
      </div>

      {/* Milestone Alerts */}
      {!alertsLoading && alerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Milestone Alerts</h2>
            <span className="text-sm text-gray-500">({alerts.length})</span>
          </div>

          <div className="space-y-3 mb-4">
            {/* Show high priority alerts first */}
            {highPriorityAlerts.slice(0, 2).map((alert, index) => (
              <MilestoneAlertCard
                key={`high-${index}`}
                alert={alert}
                onPlanActivity={() => {
                  // Navigate to planner with filters
                  window.location.href = '/planner?filter=milestone-alert';
                }}
                onViewDetails={() => {
                  // Navigate to outcome or theme details
                  if (alert.outcomeId) {
                    window.location.href = `/outcomes/${alert.outcomeId}`;
                  }
                }}
                onDismiss={() => {
                  // TODO: Implement alert dismissal
                  console.log('Dismiss alert', alert);
                }}
                onSnooze={() => {
                  // TODO: Implement alert snoozing
                  console.log('Snooze alert', alert);
                }}
              />
            ))}

            {/* Show a few medium priority alerts */}
            {mediumPriorityAlerts.slice(0, 1).map((alert, index) => (
              <MilestoneAlertCard
                key={`medium-${index}`}
                alert={alert}
                onPlanActivity={() => {
                  window.location.href = '/planner?filter=milestone-alert';
                }}
                onViewDetails={() => {
                  if (alert.outcomeId) {
                    window.location.href = `/outcomes/${alert.outcomeId}`;
                  }
                }}
                onDismiss={() => {
                  console.log('Dismiss alert', alert);
                }}
                onSnooze={() => {
                  console.log('Snooze alert', alert);
                }}
              />
            ))}
          </div>

          {alerts.length > 3 && (
            <Link to="/alerts" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all {alerts.length} alerts →
            </Link>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OralRoutineSummary />

          {/* Milestone Alert Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div
                className={`rounded-lg p-3 ${alerts.length > 0 ? 'bg-orange-100' : 'bg-green-100'}`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${alerts.length > 0 ? 'text-orange-600' : 'text-green-600'}`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Milestone Tracking</h3>
                <p className="text-sm text-gray-600">
                  {alertsLoading
                    ? 'Checking alerts...'
                    : alerts.length === 0
                      ? 'All on track!'
                      : `${alerts.length} alert${alerts.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>

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
