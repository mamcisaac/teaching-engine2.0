import { useState, useEffect } from 'react';
import Dialog from './Dialog';
import type { SmartGoal, Outcome, Milestone } from '../types';

interface SmartGoalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Partial<SmartGoal>) => void;
  smartGoal?: SmartGoal | null;
  outcomes: Outcome[];
  milestones?: Milestone[];
  preselectedOutcomeId?: string;
  preselectedMilestoneId?: number;
}

export default function SmartGoalEditor({
  isOpen,
  onClose,
  onSave,
  smartGoal,
  outcomes,
  milestones = [],
  preselectedOutcomeId,
  preselectedMilestoneId,
}: SmartGoalEditorProps) {
  const [formData, setFormData] = useState({
    outcomeId: preselectedOutcomeId || smartGoal?.outcomeId || '',
    milestoneId: preselectedMilestoneId || smartGoal?.milestoneId || '',
    description: smartGoal?.description || '',
    targetDate: smartGoal?.targetDate
      ? new Date(smartGoal.targetDate).toISOString().split('T')[0]
      : '',
    targetValue: smartGoal?.targetValue || 80,
    observedValue: smartGoal?.observedValue || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (smartGoal) {
      setFormData({
        outcomeId: smartGoal.outcomeId,
        milestoneId: smartGoal.milestoneId || '',
        description: smartGoal.description,
        targetDate: new Date(smartGoal.targetDate).toISOString().split('T')[0],
        targetValue: smartGoal.targetValue,
        observedValue: smartGoal.observedValue || '',
      });
    } else {
      setFormData({
        outcomeId: preselectedOutcomeId || '',
        milestoneId: preselectedMilestoneId || '',
        description: '',
        targetDate: '',
        targetValue: 80,
        observedValue: '',
      });
    }
  }, [smartGoal, preselectedOutcomeId, preselectedMilestoneId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.outcomeId) {
      newErrors.outcomeId = 'Outcome is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(formData.targetDate);
      if (targetDate < today) {
        newErrors.targetDate = 'Target date must be today or in the future';
      }
    }

    if (formData.targetValue < 0 || formData.targetValue > 100) {
      newErrors.targetValue = 'Target value must be between 0 and 100';
    }

    if (
      formData.observedValue !== '' &&
      (Number(formData.observedValue) < 0 || Number(formData.observedValue) > 100)
    ) {
      newErrors.observedValue = 'Observed value must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const goalData: Partial<SmartGoal> = {
      outcomeId: formData.outcomeId,
      milestoneId: formData.milestoneId ? Number(formData.milestoneId) : undefined,
      description: formData.description.trim(),
      targetDate: new Date(formData.targetDate).toISOString(),
      targetValue: formData.targetValue,
      observedValue: formData.observedValue ? Number(formData.observedValue) : undefined,
    };

    onSave(goalData);
  };

  const handleClose = () => {
    setFormData({
      outcomeId: '',
      milestoneId: '',
      description: '',
      targetDate: '',
      targetValue: 80,
      observedValue: '',
    });
    setErrors({});
    onClose();
  };

  const selectedOutcome = outcomes.find((o) => o.id === formData.outcomeId);
  const isTargetDatePassed = formData.targetDate && new Date(formData.targetDate) <= new Date();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {smartGoal ? 'Edit SMART Goal' : 'Create SMART Goal'}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome *</label>
            <select
              value={formData.outcomeId}
              onChange={(e) => setFormData({ ...formData, outcomeId: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!!preselectedOutcomeId}
            >
              <option value="">Select an outcome...</option>
              {outcomes.map((outcome) => (
                <option key={outcome.id} value={outcome.id}>
                  {outcome.code} - {outcome.description}
                </option>
              ))}
            </select>
            {errors.outcomeId && <p className="text-red-500 text-sm mt-1">{errors.outcomeId}</p>}
          </div>

          {/* Milestone Selection */}
          {milestones.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Milestone (Optional)
              </label>
              <select
                value={formData.milestoneId}
                onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!!preselectedMilestoneId}
              >
                <option value="">No specific milestone</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMART Goal Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., By January 15, 80% of students will use the word 'parapluie' orally in context during classroom discussions"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              maxLength={1000}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date *</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.targetDate && <p className="text-red-500 text-sm mt-1">{errors.targetDate}</p>}
          </div>

          {/* Target Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Success Rate (%) *
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            {errors.targetValue && (
              <p className="text-red-500 text-sm mt-1">{errors.targetValue}</p>
            )}
          </div>

          {/* Observed Value (only shown if target date has passed) */}
          {isTargetDatePassed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observed Success Rate (%) - Optional
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.observedValue}
                  onChange={(e) => setFormData({ ...formData, observedValue: e.target.value })}
                  placeholder="Enter observed percentage"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              {errors.observedValue && (
                <p className="text-red-500 text-sm mt-1">{errors.observedValue}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Record the actual success rate after assessment
              </p>
            </div>
          )}

          {/* Preview */}
          {selectedOutcome && formData.description && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="text-sm">
                <p className="mb-1">
                  <span className="font-mono font-medium">{selectedOutcome.code}</span>:{' '}
                  {selectedOutcome.description}
                </p>
                <p className="text-blue-600">📈 {formData.description}</p>
                {formData.observedValue && (
                  <p className="text-green-600 mt-1">
                    ✅ Progress: {formData.observedValue}% achieved
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {smartGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
