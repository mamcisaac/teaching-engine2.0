import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
// Using simple text icons instead of lucide-react
import { ReflectionJournalEntry, ReflectionInput } from '../../types';
import { useCreateReflection, useUpdateReflection } from '../../hooks/useReflections';
import { useOutcomes, useThematicUnits, useAssessmentTemplates } from '../../api';
import { OutcomeSelector } from '../OutcomeSelector';
import { useToast } from '../../hooks/useToast';

interface ReflectionEditorProps {
  reflection?: ReflectionJournalEntry;
  initialOutcomeId?: string;
  initialThemeId?: number;
  initialAssessmentId?: number;
  onSave?: (reflection: ReflectionJournalEntry) => void;
  onCancel?: () => void;
}

export default function ReflectionEditor({
  reflection,
  initialOutcomeId,
  initialThemeId,
  initialAssessmentId,
  onSave,
  onCancel,
}: ReflectionEditorProps) {
  const { toast } = useToast();
  const createReflection = useCreateReflection();
  const updateReflection = useUpdateReflection();
  const { data: outcomes = [] } = useOutcomes();
  const { data: thematicUnits = [] } = useThematicUnits();
  const { data: assessmentTemplates = [] } = useAssessmentTemplates();

  const [formData, setFormData] = useState<ReflectionInput>({
    date: reflection?.date || format(new Date(), 'yyyy-MM-dd'),
    content: reflection?.content || '',
    outcomeIds:
      reflection?.outcomes?.map((o) => o.outcome.id) ||
      (initialOutcomeId ? [initialOutcomeId] : []),
    themeId: reflection?.themeId ?? initialThemeId,
    assessmentId: reflection?.assessmentId ?? initialAssessmentId,
  });

  const [showOutcomeSelector, setShowOutcomeSelector] = useState(false);

  useEffect(() => {
    if (reflection) {
      setFormData({
        date: reflection.date,
        content: reflection.content,
        outcomeIds: reflection.outcomes?.map((o) => o.outcome.id) || [],
        themeId: reflection.themeId ?? undefined,
        assessmentId: reflection.assessmentId ?? undefined,
      });
    }
  }, [reflection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast({ type: 'error', message: 'Please enter reflection content' });
      return;
    }

    try {
      let savedReflection: ReflectionJournalEntry;

      if (reflection) {
        savedReflection = await updateReflection.mutateAsync({
          id: reflection.id,
          data: formData,
        });
        toast({ type: 'success', message: 'Reflection updated successfully' });
      } else {
        savedReflection = await createReflection.mutateAsync(formData);
        toast({ type: 'success', message: 'Reflection created successfully' });
      }

      onSave?.(savedReflection);

      // Reset form if creating new
      if (!reflection) {
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          content: '',
          outcomeIds: initialOutcomeId ? [initialOutcomeId] : [],
          themeId: initialThemeId,
          assessmentId: initialAssessmentId,
        });
      }
    } catch (error) {
      toast({ type: 'error', message: 'Failed to save reflection' });
    }
  };

  const selectedOutcomes = outcomes.filter((o) => formData.outcomeIds?.includes(o.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📚 Theme (Optional)
          </label>
          <select
            value={formData.themeId || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                themeId: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a theme...</option>
            {thematicUnits.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📋 Assessment (Optional)
        </label>
        <select
          value={formData.assessmentId || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              assessmentId: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select an assessment...</option>
          {assessmentTemplates.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>
              {assessment.title} ({assessment.type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Linked Outcomes</label>
        <div className="space-y-2">
          {selectedOutcomes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedOutcomes.map((outcome) => (
                <div
                  key={outcome.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                >
                  <span>
                    {outcome.code}: {outcome.description}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        outcomeIds: formData.outcomeIds?.filter((id) => id !== outcome.id),
                      })
                    }
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No outcomes linked</p>
          )}
          <button
            type="button"
            onClick={() => setShowOutcomeSelector(true)}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Select Outcomes
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reflection Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
          maxLength={1000}
          placeholder="Write your reflection here... What worked well? What challenges did you face? How did students respond?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-sm text-gray-500 mt-1">{formData.content.length}/1000 characters</p>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={createReflection.isPending || updateReflection.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {createReflection.isPending || updateReflection.isPending
            ? 'Saving...'
            : reflection
              ? 'Update Reflection'
              : 'Save Reflection'}
        </button>
      </div>

      {showOutcomeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Outcomes</h3>
              <button
                onClick={() => setShowOutcomeSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <OutcomeSelector
              selectedOutcomes={formData.outcomeIds || []}
              onChange={(outcomeIds) => {
                setFormData({ ...formData, outcomeIds });
                setShowOutcomeSelector(false);
              }}
            />
          </div>
        </div>
      )}
    </form>
  );
}
