import { useState } from 'react';
import {
  useOralRoutineTemplates,
  useCreateOralRoutineTemplate,
  useUpdateOralRoutineTemplate,
  useDeleteOralRoutineTemplate,
  useOutcomes,
} from '../api';
import Dialog from './Dialog';
import OutcomeSelect from './OutcomeSelect';
import BilingualTextInput from './BilingualTextInput';
import { useLanguage } from '../contexts/LanguageContext';
import type { OralRoutineTemplate } from '../types';

interface OralRoutineTemplateManagerProps {
  className?: string;
}

export default function OralRoutineTemplateManager({
  className = '',
}: OralRoutineTemplateManagerProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OralRoutineTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleFr: '',
    description: '',
    descriptionEn: '',
    descriptionFr: '',
    outcomes: [] as string[],
  });

  // Fetch data
  const { data: templates = [], isLoading } = useOralRoutineTemplates();
  const { data: outcomes = [] } = useOutcomes();
  const { t, getLocalizedField } = useLanguage();

  // Mutations
  const createTemplate = useCreateOralRoutineTemplate();
  const updateTemplate = useUpdateOralRoutineTemplate();
  const deleteTemplate = useDeleteOralRoutineTemplate();

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      title: '',
      titleEn: '',
      titleFr: '',
      description: '',
      descriptionEn: '',
      descriptionFr: '',
      outcomes: [],
    });
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: OralRoutineTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      titleEn: template.titleEn || '',
      titleFr: template.titleFr || '',
      description: template.description || '',
      descriptionEn: template.descriptionEn || '',
      descriptionFr: template.descriptionFr || '',
      outcomes: template.outcomes.map((o) => o.outcome.id),
    });
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!formData.title.trim()) return;

    const templateData = {
      title: formData.title.trim(),
      titleEn: formData.titleEn.trim() || undefined,
      titleFr: formData.titleFr.trim() || undefined,
      description: formData.description.trim() || undefined,
      descriptionEn: formData.descriptionEn.trim() || undefined,
      descriptionFr: formData.descriptionFr.trim() || undefined,
      outcomes: formData.outcomes,
    };

    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, data: templateData },
        {
          onSuccess: () => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
          },
        },
      );
    } else {
      createTemplate.mutate(templateData, {
        onSuccess: () => {
          setIsEditorOpen(false);
        },
      });
    }
  };

  const handleDeleteTemplate = (template: OralRoutineTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.title}"?`)) {
      deleteTemplate.mutate(template.id);
    }
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setEditingTemplate(null);
    setFormData({
      title: '',
      titleEn: '',
      titleFr: '',
      description: '',
      descriptionEn: '',
      descriptionFr: '',
      outcomes: [],
    });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Oral Routine Templates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create reusable templates for daily French oral language routines
          </p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Template
        </button>
      </div>

      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {getLocalizedField(template, 'title')}
                  </h3>
                  {getLocalizedField(template, 'description') && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {getLocalizedField(template, 'description')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Edit template"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Delete template"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Linked Outcomes */}
              {template.outcomes.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Linked Outcomes:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.outcomes.map(({ outcome }) => (
                      <span
                        key={outcome.id}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {outcome.code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Stats */}
              <div className="text-xs text-gray-500 border-t pt-2">
                📊 Used {template._count?.dailyRoutines || 0} times
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates created yet</h3>
          <p className="text-sm mb-4">
            Create your first oral routine template to get started with daily French practice
          </p>
          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Template
          </button>
        </div>
      )}

      {/* Template Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={handleClose}>
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {editingTemplate ? 'Edit Template' : 'Create Oral Routine Template'}
            </h3>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTemplate();
            }}
            className="space-y-4"
          >
            {/* Title */}
            <BilingualTextInput
              label={t('title')}
              valueEn={formData.titleEn}
              valueFr={formData.titleFr}
              onChangeEn={(value) => setFormData({ ...formData, titleEn: value, title: value })}
              onChangeFr={(value) =>
                setFormData({ ...formData, titleFr: value, title: formData.title || value })
              }
              placeholderEn="e.g., Morning Greeting Routine"
              placeholderFr="e.g., Routine de salutation matinale"
              required
            />

            {/* Description */}
            <BilingualTextInput
              label={`${t('description')} (${t('optional', 'Optional')})`}
              valueEn={formData.descriptionEn}
              valueFr={formData.descriptionFr}
              onChangeEn={(value) =>
                setFormData({ ...formData, descriptionEn: value, description: value })
              }
              onChangeFr={(value) =>
                setFormData({
                  ...formData,
                  descriptionFr: value,
                  description: formData.description || value,
                })
              }
              placeholderEn="e.g., Students greet each other and respond to question of the day"
              placeholderFr="e.g., Les élèves se saluent et répondent à la question du jour"
              multiline
              rows={3}
            />

            {/* Linked Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linked Outcomes (Optional)
              </label>
              <OutcomeSelect
                value={formData.outcomes}
                onChange={(outcomes) => setFormData({ ...formData, outcomes })}
                placeholder="Select outcomes that this routine supports..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link to curriculum outcomes like CO.0 (oral awareness) or CO.1 (sound blending)
              </p>
            </div>

            {/* Preview */}
            {formData.title && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Preview:</h4>
                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📢</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
                  )}
                  {formData.outcomes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.outcomes.map((outcomeId) => {
                        const outcome = outcomes.find((o) => o.id === outcomeId);
                        return outcome ? (
                          <span
                            key={outcomeId}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {outcome.code}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
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
                disabled={!formData.title.trim()}
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
