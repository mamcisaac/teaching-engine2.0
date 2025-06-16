import { useState } from 'react';
import {
  useOralRoutineTemplates,
  useDailyOralRoutines,
  useCreateDailyOralRoutine,
  useUpdateDailyOralRoutine,
  useDeleteDailyOralRoutine,
  useOralRoutineStats,
} from '../api';
import Dialog from './Dialog';
import type { DailyOralRoutine } from '../types';

interface DailyOralRoutineWidgetProps {
  date: string; // ISO date string
  className?: string;
}

export default function DailyOralRoutineWidget({
  date,
  className = '',
}: DailyOralRoutineWidgetProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  // Format date for display and API
  const displayDate = new Date(date).toLocaleDateString();
  const currentWeekStart = new Date(date);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

  // Fetch data
  const { data: templates = [] } = useOralRoutineTemplates();
  const { data: dailyRoutines = [], isLoading } = useDailyOralRoutines({ date });
  const { data: weekStats } = useOralRoutineStats({
    startDate: currentWeekStart.toISOString(),
    endDate: currentWeekEnd.toISOString(),
  });

  // Mutations
  const createDailyRoutine = useCreateDailyOralRoutine();
  const updateDailyRoutine = useUpdateDailyOralRoutine();
  const deleteDailyRoutine = useDeleteDailyOralRoutine();

  const handleAddRoutine = () => {
    if (!selectedTemplateId) return;

    createDailyRoutine.mutate(
      {
        date: new Date(date).toISOString(),
        templateId: selectedTemplateId,
        completed: false,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setSelectedTemplateId(null);
        },
      },
    );
  };

  const handleToggleComplete = (routine: DailyOralRoutine) => {
    updateDailyRoutine.mutate({
      id: routine.id,
      data: { completed: !routine.completed },
    });
  };

  const handleUpdateParticipation = (routine: DailyOralRoutine, participation: number) => {
    updateDailyRoutine.mutate({
      id: routine.id,
      data: { participation },
    });
  };

  const handleUpdateNotes = (routine: DailyOralRoutine, notes: string) => {
    updateDailyRoutine.mutate({
      id: routine.id,
      data: { notes },
    });
  };

  const handleRemoveRoutine = (routine: DailyOralRoutine) => {
    if (confirm(`Remove "${routine.template.title}" from today's plan?`)) {
      deleteDailyRoutine.mutate(routine.id);
    }
  };

  const getParticipationIcon = (participation: number | null) => {
    if (participation === null) return '👥';
    if (participation >= 80) return '🔥';
    if (participation >= 60) return '👍';
    return '😐';
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Oral Routines</h3>
          <p className="text-sm text-gray-600">{displayDate}</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          disabled={templates.length === 0}
        >
          Add Routine
        </button>
      </div>

      {/* Weekly Stats */}
      {weekStats && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <div className="text-sm">
            <span className="font-medium">This Week:</span>{' '}
            <span className="text-blue-600">
              ✅ {weekStats.completedRoutines}/{weekStats.totalRoutines} completed
            </span>
            {weekStats.averageParticipation && (
              <span className="text-blue-600 ml-2">
                👥 {weekStats.averageParticipation}% avg participation
              </span>
            )}
          </div>
        </div>
      )}

      {/* Daily Routines */}
      {dailyRoutines.length > 0 ? (
        <div className="space-y-3">
          {dailyRoutines.map((routine) => (
            <div
              key={routine.id}
              className={`p-4 rounded-lg border ${
                routine.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(routine)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      routine.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {routine.completed && '✓'}
                  </button>

                  <div className="flex-1">
                    {/* Routine Title */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📢</span>
                      <span
                        className={`font-medium ${routine.completed ? 'line-through text-gray-500' : ''}`}
                      >
                        {routine.template.title}
                      </span>
                    </div>

                    {/* Description */}
                    {routine.template.description && (
                      <p className="text-sm text-gray-600 mb-2">{routine.template.description}</p>
                    )}

                    {/* Linked Outcomes */}
                    {routine.template.outcomes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {routine.template.outcomes.map(({ outcome }) => (
                          <span
                            key={outcome.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {outcome.code}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Participation Slider */}
                    {routine.completed && (
                      <div className="mb-2">
                        <label className="text-xs text-gray-600 block mb-1">
                          Student Participation:{' '}
                          {getParticipationIcon(routine.participation ?? null)}{' '}
                          {routine.participation || 0}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={routine.participation || 0}
                          onChange={(e) =>
                            handleUpdateParticipation(routine, Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg slider"
                        />
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <textarea
                        value={routine.notes || ''}
                        onChange={(e) => handleUpdateNotes(routine, e.target.value)}
                        placeholder="Add notes about today's routine..."
                        className="w-full text-xs p-2 border border-gray-200 rounded resize-none"
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveRoutine(routine)}
                  className="text-red-600 hover:text-red-800 text-sm ml-2"
                  title="Remove routine"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📢</div>
          <p className="text-sm">No oral routines scheduled for today</p>
          {templates.length > 0 ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Add First Routine
            </button>
          ) : (
            <p className="text-xs mt-1">Create templates first to get started</p>
          )}
        </div>
      )}

      {/* Add Routine Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Oral Routine</h3>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedTemplateId === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{template.title}</div>
                    {template.description && (
                      <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                    )}
                    {template.outcomes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.outcomes.map(({ outcome }) => (
                          <span
                            key={outcome.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {outcome.code}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoutine}
                disabled={!selectedTemplateId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add Routine
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
