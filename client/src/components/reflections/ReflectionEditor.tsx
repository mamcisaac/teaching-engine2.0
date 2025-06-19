import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useOutcomes } from '../../api';

interface ReflectionEditorProps {
  outcomeId?: string;
  onSave: (reflection: { content: string; outcomeId?: string }) => void;
  onCancel: () => void;
  initialContent?: string;
  isLoading?: boolean;
}

export default function ReflectionEditor({
  outcomeId,
  onSave,
  onCancel,
  initialContent = '',
  isLoading = false,
}: ReflectionEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState(outcomeId || '');

  const { data: outcomes = [] } = useOutcomes();

  const handleSave = () => {
    if (!content.trim()) return;

    onSave({
      content: content.trim(),
      outcomeId: selectedOutcomeId || undefined,
    });
  };

  const selectedOutcome = outcomes.find((o) => o.id === selectedOutcomeId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Reflection</h3>

      {/* Outcome Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Related Outcome (Optional)
        </label>
        <select
          value={selectedOutcomeId}
          onChange={(e) => setSelectedOutcomeId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No specific outcome</option>
          {outcomes.map((outcome) => (
            <option key={outcome.id} value={outcome.id}>
              {outcome.title}
            </option>
          ))}
        </select>
        {selectedOutcome && (
          <p className="text-sm text-gray-600 mt-1">{selectedOutcome.description}</p>
        )}
      </div>

      {/* Content Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Reflection Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reflection here... What went well? What could be improved? What did students learn?"
          rows={6}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{content.length} characters</div>
      </div>

      {/* Reflection Prompts */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Reflection Prompts:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setContent(
                (prev) => prev + (prev ? '\n\n' : '') + 'What went well in this activity? ',
              )
            }
            className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded border border-blue-200 hover:bg-blue-50"
          >
            💫 What went well?
          </button>
          <button
            type="button"
            onClick={() =>
              setContent(
                (prev) => prev + (prev ? '\n\n' : '') + 'What challenges did students face? ',
              )
            }
            className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded border border-blue-200 hover:bg-blue-50"
          >
            🤔 What challenges arose?
          </button>
          <button
            type="button"
            onClick={() =>
              setContent(
                (prev) => prev + (prev ? '\n\n' : '') + 'How could this be improved next time? ',
              )
            }
            className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded border border-blue-200 hover:bg-blue-50"
          >
            🔄 How to improve?
          </button>
          <button
            type="button"
            onClick={() =>
              setContent(
                (prev) =>
                  prev + (prev ? '\n\n' : '') + 'What did students demonstrate they learned? ',
              )
            }
            className="text-left text-sm text-blue-600 hover:text-blue-800 p-2 rounded border border-blue-200 hover:bg-blue-50"
          >
            🎯 Student learning evidence?
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!content.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Saving...' : 'Save Reflection'}
        </Button>
      </div>
    </div>
  );
}
