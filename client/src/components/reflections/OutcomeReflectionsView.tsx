import React, { useState } from 'react';
import { Button } from '../ui/Button';
import ReflectionEditor from './ReflectionEditor';
import {
  useReflections,
  useCreateReflection,
  useDeleteReflection,
} from '../../hooks/useReflections';
import type { Outcome } from '../../types';

interface OutcomeReflectionsViewProps {
  outcome: Outcome;
}

export default function OutcomeReflectionsView({ outcome }: OutcomeReflectionsViewProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: reflections = [], isLoading } = useReflections(outcome.id);
  const createReflection = useCreateReflection();
  const deleteReflection = useDeleteReflection();

  const handleSaveReflection = async (reflectionData: { content: string; outcomeId?: string }) => {
    try {
      await createReflection.mutateAsync({
        content: reflectionData.content,
        outcomeId: outcome.id,
      });
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
  };

  const handleDeleteReflection = async (reflectionId: number) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      try {
        await deleteReflection.mutateAsync(reflectionId);
      } catch (error) {
        console.error('Failed to delete reflection:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reflections for: {outcome.title}
            </h3>
            <p className="text-sm text-gray-600">{outcome.description}</p>
          </div>
          <Button
            onClick={() => setIsEditorOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            ✍️ Add Reflection
          </Button>
        </div>
      </div>

      {/* Reflection Editor */}
      {isEditorOpen && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <ReflectionEditor
            outcomeId={outcome.id}
            onSave={handleSaveReflection}
            onCancel={() => setIsEditorOpen(false)}
            isLoading={createReflection.isPending}
          />
        </div>
      )}

      {/* Reflections List */}
      <div className="p-6">
        {reflections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">📝</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No reflections yet</h4>
            <p className="text-sm mb-4">
              Start reflecting on your teaching experiences with this outcome
            </p>
            <Button
              onClick={() => setIsEditorOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add First Reflection
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {reflections.map((reflection) => (
              <div
                key={reflection.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📅 {formatDate(reflection.createdAt)}</span>
                    {reflection.createdAt !== reflection.updatedAt && (
                      <span className="text-blue-600">
                        • Updated {formatDate(reflection.updatedAt)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteReflection(reflection.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Delete reflection"
                  >
                    🗑️
                  </button>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {reflection.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {reflections.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {reflections.length} reflection{reflections.length !== 1 ? 's' : ''} recorded
            </span>
            <span>Last reflection: {formatDate(reflections[0]?.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
