import { useState } from 'react';
import {
  useSmartGoals,
  useCreateSmartGoal,
  useUpdateSmartGoal,
  useDeleteSmartGoal,
  useOutcomes,
  useMilestones,
} from '../api';
import SmartGoalEditor from './SmartGoalEditor';
import type { SmartGoal } from '../types';

interface SmartGoalDisplayProps {
  outcomeId?: string;
  milestoneId?: number;
  showOutcomeColumn?: boolean;
  showMilestoneColumn?: boolean;
  className?: string;
}

export default function SmartGoalDisplay({
  outcomeId,
  milestoneId,
  showOutcomeColumn = false,
  showMilestoneColumn = false,
  className = '',
}: SmartGoalDisplayProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SmartGoal | null>(null);

  // Fetch data
  const { data: smartGoals = [], isLoading } = useSmartGoals({ outcomeId, milestoneId });
  const { data: outcomes = [] } = useOutcomes();
  const { data: milestones = [] } = useMilestones();

  // Mutations
  const createSmartGoal = useCreateSmartGoal();
  const updateSmartGoal = useUpdateSmartGoal();
  const deleteSmartGoal = useDeleteSmartGoal();

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setIsEditorOpen(true);
  };

  const handleEditGoal = (goal: SmartGoal) => {
    setEditingGoal(goal);
    setIsEditorOpen(true);
  };

  const handleSaveGoal = (goalData: Partial<SmartGoal>) => {
    if (editingGoal) {
      updateSmartGoal.mutate(
        { id: editingGoal.id, data: goalData },
        {
          onSuccess: () => {
            setIsEditorOpen(false);
            setEditingGoal(null);
          },
        },
      );
    } else {
      createSmartGoal.mutate(goalData, {
        onSuccess: () => {
          setIsEditorOpen(false);
        },
      });
    }
  };

  const handleDeleteGoal = (goal: SmartGoal) => {
    if (confirm('Are you sure you want to delete this SMART goal?')) {
      deleteSmartGoal.mutate(goal.id);
    }
  };

  const getProgressStatus = (goal: SmartGoal) => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const isPastDue = targetDate < today;

    if (goal.observedValue !== null && goal.observedValue !== undefined) {
      const achieved = goal.observedValue >= goal.targetValue;
      return {
        status: achieved ? 'achieved' : 'not-achieved',
        color: achieved ? 'text-green-600' : 'text-red-600',
        bgColor: achieved ? 'bg-green-50' : 'bg-red-50',
        borderColor: achieved ? 'border-green-200' : 'border-red-200',
        text: `${goal.observedValue}% achieved`,
        icon: achieved ? '✅' : '❌',
      };
    }

    if (isPastDue) {
      return {
        status: 'overdue',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        text: 'Assessment pending',
        icon: '⚠️',
      };
    }

    return {
      status: 'in-progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      text: 'In progress',
      icon: '📈',
    };
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">SMART Goals</h3>
        <button
          onClick={handleCreateGoal}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Add SMART Goal
        </button>
      </div>

      {smartGoals.length > 0 ? (
        <div className="space-y-3">
          {smartGoals.map((goal) => {
            const progress = getProgressStatus(goal);
            const targetDate = new Date(goal.targetDate).toLocaleDateString();

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border ${progress.bgColor} ${progress.borderColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{progress.icon}</span>
                      {showOutcomeColumn && (
                        <span className="font-mono text-xs text-gray-600 bg-white px-2 py-1 rounded">
                          {goal.outcome.code}
                        </span>
                      )}
                      {showMilestoneColumn && goal.milestone && (
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                          {goal.milestone.title}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-800 mb-2">{goal.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>
                        Target: {goal.targetValue}% by {targetDate}
                      </span>
                      <span className={progress.color}>{progress.text}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Edit goal"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Delete goal"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm">No SMART goals defined yet</p>
          <p className="text-xs mb-3">Set specific, measurable objectives for learning outcomes</p>
          <button
            onClick={handleCreateGoal}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Create First Goal
          </button>
        </div>
      )}

      <SmartGoalEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        smartGoal={editingGoal}
        outcomes={outcomes}
        milestones={milestones}
        preselectedOutcomeId={outcomeId}
        preselectedMilestoneId={milestoneId}
      />
    </div>
  );
}
