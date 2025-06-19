import { useState } from 'react';
import {
  useStudentGoals,
  useCreateStudentGoal,
  useUpdateStudentGoal,
  useDeleteStudentGoal,
  useOutcomes,
  useThematicUnits,
} from '../api';
import type { StudentGoal, StudentGoalInput } from '../types';
import { Modal } from './ui/Modal';

interface StudentGoalsProps {
  studentId: number;
  studentName: string;
}

interface GoalFormData {
  text: string;
  outcomeId?: string;
  themeId?: number;
  status: 'active' | 'completed' | 'abandoned';
}

export default function StudentGoals({ studentId, studentName }: StudentGoalsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudentGoal | null>(null);
  const [formData, setFormData] = useState<GoalFormData>({
    text: '',
    status: 'active',
  });

  // Fetch data
  const { data: goals = [], isLoading } = useStudentGoals(studentId);
  const { data: outcomes = [] } = useOutcomes();
  const { data: themes = [] } = useThematicUnits();

  // Mutations
  const createGoal = useCreateStudentGoal();
  const updateGoal = useUpdateStudentGoal();
  const deleteGoal = useDeleteStudentGoal();

  const activeGoals = goals.filter((goal) => goal.status === 'active');
  const completedGoals = goals.filter((goal) => goal.status === 'completed');

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setFormData({ text: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: StudentGoal) => {
    setEditingGoal(goal);
    setFormData({
      text: goal.text,
      outcomeId: goal.outcomeId || undefined,
      themeId: goal.themeId || undefined,
      status: goal.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveGoal = () => {
    const goalData: StudentGoalInput = {
      text: formData.text,
      outcomeId: formData.outcomeId,
      themeId: formData.themeId,
      status: formData.status,
    };

    if (editingGoal) {
      updateGoal.mutate(
        { studentId, goalId: editingGoal.id, data: goalData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingGoal(null);
          },
        },
      );
    } else {
      createGoal.mutate(
        { studentId, data: goalData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        },
      );
    }
  };

  const handleDeleteGoal = (goal: StudentGoal) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal.mutate({ studentId, goalId: goal.id });
    }
  };

  const handleStatusChange = (
    goal: StudentGoal,
    newStatus: 'active' | 'completed' | 'abandoned',
  ) => {
    updateGoal.mutate({
      studentId,
      goalId: goal.id,
      data: { status: newStatus },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'abandoned':
        return '❌';
      default:
        return '🎯';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'abandoned':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">🎯 Goals for {studentName}</h3>
        <button
          onClick={handleCreateGoal}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          disabled={activeGoals.length >= 3}
        >
          ➕ Set New Goal
        </button>
      </div>

      {/* Active Goals */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Active Goals (max 3)</h4>
        {activeGoals.length > 0 ? (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className={`p-4 rounded-lg border ${getStatusColor(goal.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getStatusIcon(goal.status)}</span>
                      {goal.outcome && (
                        <span className="font-mono text-xs text-gray-600 bg-white px-2 py-1 rounded">
                          {goal.outcome.code}
                        </span>
                      )}
                      {goal.theme && (
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                          {goal.theme.title}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{goal.text}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(goal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleStatusChange(goal, 'completed')}
                      className="text-green-600 hover:text-green-800 text-sm"
                      title="Mark as completed"
                    >
                      ✅
                    </button>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm">No active goals yet</p>
            <p className="text-xs mb-3">Help {studentName} set learning goals</p>
            <button
              onClick={handleCreateGoal}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Set First Goal
            </button>
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">✅ Completed Goals</h4>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className={`p-3 rounded-lg border ${getStatusColor(goal.status)}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(goal.status)}</span>
                  <p className="text-sm text-gray-700 flex-1">{goal.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(goal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Creation/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Set New Goal'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Text (in simple words for Grade 1)
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Je veux apprendre à..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Outcome (optional)
            </label>
            <select
              value={formData.outcomeId || ''}
              onChange={(e) => setFormData({ ...formData, outcomeId: e.target.value || undefined })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">No specific outcome</option>
              {outcomes.map((outcome) => (
                <option key={outcome.id} value={outcome.id}>
                  {outcome.code} - {outcome.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Theme (optional)
            </label>
            <select
              value={formData.themeId || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  themeId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">No specific theme</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              ))}
            </select>
          </div>

          {editingGoal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'completed' | 'abandoned',
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveGoal}
              disabled={!formData.text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
