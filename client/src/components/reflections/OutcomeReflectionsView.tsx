import React, { useState } from 'react';
import { format } from 'date-fns';
// Using simple text icons instead of lucide-react
import { Outcome, ReflectionJournalEntry } from '../../types';
import { useReflectionsByOutcome, useDeleteReflection } from '../../hooks/useReflections';
import ReflectionEditor from './ReflectionEditor';
import { useToast } from '../../hooks/useToast';

interface OutcomeReflectionsViewProps {
  outcome: Outcome;
}

export default function OutcomeReflectionsView({ outcome }: OutcomeReflectionsViewProps) {
  const { toast } = useToast();
  const { data: reflections = [], isLoading } = useReflectionsByOutcome(outcome.id);
  const deleteReflection = useDeleteReflection();

  const [showEditor, setShowEditor] = useState(false);
  const [editingReflection, setEditingReflection] = useState<ReflectionJournalEntry | undefined>();

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      try {
        await deleteReflection.mutateAsync(id);
        toast({ type: 'success', message: 'Reflection deleted successfully' });
      } catch (error) {
        toast({ type: 'error', message: 'Failed to delete reflection' });
      }
    }
  };

  const handleEdit = (reflection: ReflectionJournalEntry) => {
    setEditingReflection(reflection);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingReflection(undefined);
  };

  const exportToPDF = () => {
    // Simple text export for now
    const content = reflections
      .map((r) => `Date: ${format(new Date(r.date), 'MMMM d, yyyy')}\n${r.content}\n\n`)
      .join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflections-${outcome.code}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ type: 'success', message: 'Reflections exported successfully' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Reflections</h2>
            <p className="text-gray-600">
              {outcome.code}: {outcome.description}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {reflections.length} reflection{reflections.length !== 1 ? 's' : ''} recorded
              {reflections.length > 0 && (
                <span> • Most recent: {format(new Date(reflections[0].date), 'MMMM d, yyyy')}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEditor(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Reflection
            </button>
            {reflections.length > 0 && (
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                ⬇️ Export
              </button>
            )}
          </div>
        </div>

        {showEditor && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingReflection ? 'Edit Reflection' : 'New Reflection'}
            </h3>
            <ReflectionEditor
              reflection={editingReflection}
              initialOutcomeId={outcome.id}
              onSave={handleEditorClose}
              onCancel={handleEditorClose}
            />
          </div>
        )}

        {reflections.length === 0 && !showEditor ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-400 mb-4">📄</div>
            <p className="text-gray-500 mb-4">No reflections recorded yet</p>
            <button
              onClick={() => setShowEditor(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Add your first reflection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reflections.map((reflection) => (
              <div
                key={reflection.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      📅
                      {format(new Date(reflection.date), 'MMMM d, yyyy')}
                    </span>
                    {reflection.theme && (
                      <span className="flex items-center">
                        📚
                        {reflection.theme.title}
                      </span>
                    )}
                    {reflection.assessment?.template && (
                      <span className="flex items-center">
                        📋
                        {reflection.assessment.template.title}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(reflection)}
                      className="text-gray-500 hover:text-blue-600"
                      title="Edit reflection"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(reflection.id)}
                      className="text-gray-500 hover:text-red-600"
                      title="Delete reflection"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">{reflection.content}</p>

                {reflection.outcomes && reflection.outcomes.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Also linked to:</p>
                    <div className="flex flex-wrap gap-2">
                      {reflection.outcomes
                        .filter((o) => o.outcome.id !== outcome.id)
                        .map(({ outcome: linkedOutcome }) => (
                          <span
                            key={linkedOutcome.id}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {linkedOutcome.code}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
