import { useState } from 'react';
import {
  useThematicUnits,
  useCreateThematicUnit,
  useUpdateThematicUnit,
  useDeleteThematicUnit,
  useOutcomes,
  useActivities,
} from '../api';
import Dialog from './Dialog';
import OutcomeSelect from './OutcomeSelect';
import BilingualTextInput from './BilingualTextInput';
import { useLanguage } from '../contexts/LanguageContext';
import type { ThematicUnit, Activity } from '../types/index';

interface ThematicUnitPlannerPageProps {
  className?: string;
}

export default function ThematicUnitPlannerPage({ className = '' }: ThematicUnitPlannerPageProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ThematicUnit | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleFr: '',
    description: '',
    descriptionEn: '',
    descriptionFr: '',
    startDate: '',
    endDate: '',
    outcomes: [] as string[],
    activities: [] as number[],
  });

  // Fetch data
  const { data: thematicUnits = [], isLoading } = useThematicUnits();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: outcomes = [] } = useOutcomes();
  const { data: activities = [] } = useActivities();
  const { t, getLocalizedField } = useLanguage();

  // Mutations
  const createUnit = useCreateThematicUnit();
  const updateUnit = useUpdateThematicUnit();
  const deleteUnit = useDeleteThematicUnit();

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setFormData({
      title: '',
      titleEn: '',
      titleFr: '',
      description: '',
      descriptionEn: '',
      descriptionFr: '',
      startDate: '',
      endDate: '',
      outcomes: [],
      activities: [],
    });
    setIsEditorOpen(true);
  };

  const handleEditUnit = (unit: ThematicUnit) => {
    setEditingUnit(unit);
    setFormData({
      title: unit.title,
      titleEn: unit.titleEn || '',
      titleFr: unit.titleFr || '',
      description: unit.description || '',
      descriptionEn: unit.descriptionEn || '',
      descriptionFr: unit.descriptionFr || '',
      startDate: new Date(unit.startDate).toISOString().slice(0, 16),
      endDate: new Date(unit.endDate).toISOString().slice(0, 16),
      outcomes: unit.outcomes?.map((o) => o.outcome.id) || [],
      activities: unit.activities?.map((a) => a.activity.id) || [],
    });
    setIsEditorOpen(true);
  };

  const handleSaveUnit = () => {
    if (!formData.title.trim() || !formData.startDate || !formData.endDate) return;

    const unitData = {
      title: formData.title.trim(),
      titleEn: formData.titleEn.trim() || undefined,
      titleFr: formData.titleFr.trim() || undefined,
      description: formData.description.trim() || undefined,
      descriptionEn: formData.descriptionEn.trim() || undefined,
      descriptionFr: formData.descriptionFr.trim() || undefined,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      outcomes: formData.outcomes,
      activities: formData.activities,
    };

    if (editingUnit) {
      updateUnit.mutate(
        { id: editingUnit.id, data: unitData },
        {
          onSuccess: () => {
            setIsEditorOpen(false);
            setEditingUnit(null);
          },
        },
      );
    } else {
      createUnit.mutate(unitData, {
        onSuccess: () => {
          setIsEditorOpen(false);
        },
      });
    }
  };

  const handleDeleteUnit = (unit: ThematicUnit) => {
    if (confirm(`Are you sure you want to delete "${unit.title}"?`)) {
      deleteUnit.mutate(unit.id);
    }
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setEditingUnit(null);
    setFormData({
      title: '',
      titleEn: '',
      titleFr: '',
      description: '',
      descriptionEn: '',
      descriptionFr: '',
      startDate: '',
      endDate: '',
      outcomes: [],
      activities: [],
    });
  };

  const getSubjectTags = (activities: Activity[]) => {
    const subjects = new Set<string>();
    activities.forEach((activity) => {
      if (activity.milestone?.subject?.name) {
        subjects.add(activity.milestone.subject.name);
      }
    });
    return Array.from(subjects);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
    };

    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }

    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
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
          <h2 className="text-xl font-semibold text-gray-900">Thematic Unit Planner</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create cross-curricular thematic units that span multiple subjects and engage students
            in integrated learning
          </p>
        </div>
        <button
          onClick={handleCreateUnit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Thematic Unit
        </button>
      </div>

      {thematicUnits.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {thematicUnits.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {getLocalizedField(unit, 'title')}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {formatDateRange(unit.startDate, unit.endDate)}
                  </p>
                  {getLocalizedField(unit, 'description') && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {getLocalizedField(unit, 'description')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditUnit(unit)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Edit unit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(unit)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Delete unit"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Subject Tags */}
              {unit.activities && unit.activities.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Subjects:</div>
                  <div className="flex flex-wrap gap-1">
                    {getSubjectTags(unit.activities.map((a) => a.activity)).map((subject) => (
                      <span
                        key={subject}
                        className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Outcomes */}
              {unit.outcomes && unit.outcomes.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Curriculum Outcomes:</div>
                  <div className="flex flex-wrap gap-1">
                    {unit.outcomes.slice(0, 3).map(({ outcome }) => (
                      <span
                        key={outcome.id}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {outcome.code}
                      </span>
                    ))}
                    {unit.outcomes.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{unit.outcomes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Count */}
              <div className="text-xs text-gray-500 border-t pt-3 flex justify-between">
                <span>📚 {unit.activities?.length || 0} activities</span>
                <span>🎯 {unit.outcomes?.length || 0} outcomes</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No thematic units created yet</h3>
          <p className="text-sm mb-4">
            Create your first thematic unit to integrate learning across multiple subjects
          </p>
          <button
            onClick={handleCreateUnit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Unit
          </button>
        </div>
      )}

      {/* Unit Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={handleClose}>
        <div className="w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {editingUnit ? 'Edit Thematic Unit' : 'Create Thematic Unit'}
            </h3>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveUnit();
            }}
            className="space-y-6"
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
              placeholderEn="e.g., Ocean Life & Marine Conservation"
              placeholderFr="e.g., La vie océanique et la conservation marine"
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
              placeholderEn="e.g., Students explore ocean ecosystems through science, French literature, and environmental action projects"
              placeholderFr="e.g., Les élèves explorent les écosystèmes océaniques par la science, la littérature française et les projets d'action environnementale"
              multiline
              rows={3}
            />

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Linked Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curriculum Outcomes (Optional)
              </label>
              <OutcomeSelect
                value={formData.outcomes}
                onChange={(outcomes) => setFormData({ ...formData, outcomes })}
                placeholder="Select outcomes that this thematic unit will address..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose outcomes from multiple subjects that will be integrated in this unit
              </p>
            </div>

            {/* Linked Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activities (Optional)
              </label>
              <select
                multiple
                value={formData.activities.map(String)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activities: Array.from(e.target.selectedOptions, (option) =>
                      Number(option.value),
                    ),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              >
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title} ({activity.milestone?.subject?.name})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple activities. Activities will maintain their original
                subject tags.
              </p>
            </div>

            {/* Preview */}
            {formData.title && formData.startDate && formData.endDate && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Preview:</h4>
                <div className="bg-white p-4 rounded border-l-4 border-green-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🌍</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    {formatDateRange(formData.startDate, formData.endDate)}
                  </p>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mb-3">{formData.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {formData.outcomes.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formData.outcomes.length} outcomes
                      </span>
                    )}
                    {formData.activities.length > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {formData.activities.length} activities
                      </span>
                    )}
                  </div>
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
                disabled={!formData.title.trim() || !formData.startDate || !formData.endDate}
              >
                {editingUnit ? 'Update Unit' : 'Create Unit'}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
