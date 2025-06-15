import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMilestone, useUpdateMilestone, useCreateActivity } from '../api';
import Dialog from '../components/Dialog';
import OutcomeSelect from '../components/OutcomeSelect';
import RichTextEditor from '../components/RichTextEditor';
import ActivityList from '../components/ActivityList';
import SmartGoalDisplay from '../components/SmartGoalDisplay';

export default function UnitPlannerPage() {
  const { id } = useParams();
  const milestoneId = Number(id);
  const { data: milestone, isLoading } = useMilestone(milestoneId);
  const updateMilestone = useUpdateMilestone();
  const createActivity = useCreateActivity();

  // Modal states
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Form states
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityMaterials, setActivityMaterials] = useState('');

  // Assessment tracking
  const [assessmentStatus, setAssessmentStatus] = useState<Record<string, boolean>>({});

  if (isLoading || !milestone) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleAddOutcomes = () => {
    setSelectedOutcomes(milestone.outcomes?.map((o) => o.outcome.code) || []);
    setIsOutcomeModalOpen(true);
  };

  const handleSaveOutcomes = () => {
    updateMilestone.mutate({
      id: milestone.id,
      title: milestone.title,
      subjectId: milestone.subjectId,
      description: milestone.description,
      outcomes: selectedOutcomes,
    });
    setIsOutcomeModalOpen(false);
  };

  const handleEditGoals = () => {
    setLearningGoals(milestone.description ?? '');
    setIsGoalsModalOpen(true);
  };

  const handleSaveGoals = () => {
    updateMilestone.mutate({
      id: milestone.id,
      title: milestone.title,
      subjectId: milestone.subjectId,
      description: learningGoals,
      outcomes: milestone.outcomes?.map((o) => o.outcome.code) || [],
    });
    setIsGoalsModalOpen(false);
  };

  const handleAddActivity = () => {
    setActivityTitle('');
    setActivityMaterials('');
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = () => {
    if (!activityTitle.trim()) return;

    createActivity.mutate({
      title: activityTitle,
      milestoneId: milestone.id,
      materialsText: activityMaterials || undefined,
    });
    setIsActivityModalOpen(false);
  };

  const toggleAssessment = (outcomeId: string) => {
    setAssessmentStatus((prev) => ({
      ...prev,
      [outcomeId]: !prev[outcomeId],
    }));
  };

  // Calculate unit progress
  const totalActivities = milestone.activities.length;
  const completedActivities = milestone.activities.filter((a) => a.completedAt).length;
  const progressPercentage =
    totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link to="/planner/year" className="hover:text-indigo-600">
                Year Plan
              </Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">{milestone.subject?.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{milestone.title}</h1>
            {milestone.description && <p className="text-gray-600 mt-2">{milestone.description}</p>}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Unit Progress</div>
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-xs text-gray-500">
              {completedActivities} of {totalActivities} activities
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Outcomes & Assessment */}
        <div className="lg:col-span-1 space-y-6">
          {/* Linked Outcomes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Linked Outcomes</h2>
              <button
                onClick={handleAddOutcomes}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Add Outcome
              </button>
            </div>

            {milestone.outcomes && milestone.outcomes.length > 0 ? (
              <div className="space-y-2">
                {milestone.outcomes.map((outcome) => (
                  <div key={outcome.outcome.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="font-mono text-sm font-medium text-indigo-600">
                          {outcome.outcome.code}
                        </span>
                        <p className="text-sm text-gray-700 mt-1">{outcome.outcome.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📘</div>
                <p>No outcomes linked yet</p>
                <p className="text-sm">Add outcomes to track learning objectives</p>
              </div>
            )}
          </div>

          {/* Assessment Checklist */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Checklist</h2>

            {milestone.outcomes && milestone.outcomes.length > 0 ? (
              <div className="space-y-3">
                {milestone.outcomes.map((outcome) => (
                  <label
                    key={outcome.outcome.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={assessmentStatus[outcome.outcome.id] || false}
                      onChange={() => toggleAssessment(outcome.outcome.id)}
                      className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <span className="font-mono text-xs text-indigo-600 block">
                        {outcome.outcome.code}
                      </span>
                      <span className="text-sm text-gray-700">{outcome.outcome.description}</span>
                    </div>
                  </label>
                ))}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Assessment Progress:</span>
                    <span className="font-medium">
                      {Object.values(assessmentStatus).filter(Boolean).length} of{' '}
                      {milestone.outcomes.length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm">Add outcomes to track assessment</p>
              </div>
            )}
          </div>

          {/* SMART Goals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <SmartGoalDisplay milestoneId={milestone.id} showOutcomeColumn={true} />
          </div>

          {/* Learning Goals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Learning Goals</h2>
              <button
                onClick={handleEditGoals}
                className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Edit Goals
              </button>
            </div>

            {milestone.description ? (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: milestone.description }} />
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm">No learning goals set</p>
                <p className="text-xs">Define what students will achieve</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activities Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Activity
              </button>
            </div>

            {totalActivities > 0 ? (
              <ActivityList
                activities={milestone.activities}
                milestoneId={milestone.id}
                subjectId={milestone.subjectId}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No activities planned yet
                </h3>
                <p className="text-sm mb-4">Start building your unit by adding activities</p>
                <button
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add First Activity
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Outcomes Modal */}
      <Dialog open={isOutcomeModalOpen} onOpenChange={setIsOutcomeModalOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Manage Linked Outcomes</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search and select outcomes
              </label>
              <OutcomeSelect
                value={selectedOutcomes}
                onChange={setSelectedOutcomes}
                placeholder="Search curriculum outcomes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsOutcomeModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOutcomes}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Outcomes
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Edit Learning Goals Modal */}
      <Dialog open={isGoalsModalOpen} onOpenChange={setIsGoalsModalOpen}>
        <div className="p-6 max-w-4xl">
          <h3 className="text-lg font-semibold mb-4">Edit Learning Goals</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Define what students will learn and achieve in this unit
              </label>
              <RichTextEditor value={learningGoals} onChange={setLearningGoals} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsGoalsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoals}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Save Goals
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Add Activity Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveActivity();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="activity-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Activity Title *
              </label>
              <input
                id="activity-title"
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter activity title"
                required
              />
            </div>

            <div>
              <label
                htmlFor="activity-materials"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Materials & Resources
              </label>
              <textarea
                id="activity-materials"
                value={activityMaterials}
                onChange={(e) => setActivityMaterials(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="List materials, resources, or preparation needed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Activity
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
