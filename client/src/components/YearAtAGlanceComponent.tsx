import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useSubjects,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useThematicUnits,
} from '../api';
import type { Milestone, ThematicUnit } from '../types';
import Dialog from './Dialog';
import OutcomeSelect from './OutcomeSelect';

interface Props {
  teacherId: number;
  year: number;
}

// School year months (September to June)
const SCHOOL_MONTHS = [
  { name: 'September', value: 8 }, // JS months are 0-indexed
  { name: 'October', value: 9 },
  { name: 'November', value: 10 },
  { name: 'December', value: 11 },
  { name: 'January', value: 0 },
  { name: 'February', value: 1 },
  { name: 'March', value: 2 },
  { name: 'April', value: 3 },
  { name: 'May', value: 4 },
  { name: 'June', value: 5 },
];

// Subject colors for consistency
const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-red-100 text-red-800 border-red-200',
];

interface MilestoneCardProps {
  milestone: Milestone;
  subjectColor: string;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
}

function MilestoneCard({ milestone, subjectColor, onEdit, onDelete }: MilestoneCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const outcomeCount = milestone.outcomes?.length || 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${subjectColor}`}
      >
        <div className="flex justify-between items-start mb-2">
          <Link to={`/planner/unit/${milestone.id}`} className="flex-1">
            <h4 className="font-medium text-sm leading-tight hover:text-gray-900">
              {milestone.title}
            </h4>
          </Link>
          <div className="flex gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(milestone);
              }}
              className="text-xs px-1 py-0.5 bg-white/50 rounded hover:bg-white/80"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(milestone);
              }}
              className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              ×
            </button>
          </div>
        </div>

        <Link to={`/planner/unit/${milestone.id}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-white/60 rounded">
              {milestone.subject?.name}
            </span>
            {outcomeCount > 0 && (
              <span className="text-xs bg-white/40 px-1 py-0.5 rounded">📘 {outcomeCount}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Tooltip showing outcomes */}
      {showTooltip && outcomeCount > 0 && (
        <div className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
          <div className="font-medium mb-2">Linked Outcomes:</div>
          <div className="space-y-1">
            {milestone.outcomes?.map((outcome) => (
              <div key={outcome.outcome.id} className="flex gap-2">
                <span className="font-mono text-yellow-300">{outcome.outcome.code}</span>
                <span className="text-gray-200">{outcome.outcome.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ThematicUnitCardProps {
  thematicUnit: ThematicUnit;
  onView: (thematicUnit: ThematicUnit) => void;
}

function ThematicUnitCard({ thematicUnit, onView }: ThematicUnitCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const outcomeCount = thematicUnit.outcomes?.length || 0;
  const activityCount = thematicUnit.activities?.length || 0;
  const subjects = new Set(
    thematicUnit.activities?.map((a) => a.activity.milestone?.subject?.name).filter(Boolean) || [],
  );

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}-${end.getDate()}`;
    }

    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-emerald-100 text-emerald-800 border-emerald-200">
        <div className="flex justify-between items-start mb-2">
          <button onClick={() => onView(thematicUnit)} className="flex-1 text-left">
            <h4 className="font-medium text-sm leading-tight hover:text-emerald-900">
              🌍 {thematicUnit.title}
            </h4>
          </button>
        </div>

        <button onClick={() => onView(thematicUnit)} className="w-full text-left">
          <div className="text-xs text-emerald-600 mb-2">
            {formatDateRange(thematicUnit.startDate, thematicUnit.endDate)}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {Array.from(subjects)
              .slice(0, 2)
              .map((subject) => (
                <span key={subject} className="text-xs font-medium px-2 py-1 bg-white/60 rounded">
                  {subject}
                </span>
              ))}
            {subjects.size > 2 && (
              <span className="text-xs bg-white/40 px-1 py-0.5 rounded">+{subjects.size - 2}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {outcomeCount > 0 && (
              <span className="text-xs bg-white/40 px-1 py-0.5 rounded">🎯 {outcomeCount}</span>
            )}
            {activityCount > 0 && (
              <span className="text-xs bg-white/40 px-1 py-0.5 rounded">📚 {activityCount}</span>
            )}
          </div>
        </button>
      </div>

      {/* Tooltip showing details */}
      {showTooltip && (outcomeCount > 0 || activityCount > 0) && (
        <div className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
          <div className="font-medium mb-2">Thematic Unit Details:</div>
          {thematicUnit.description && (
            <div className="mb-2 text-gray-200">{thematicUnit.description}</div>
          )}
          {subjects.size > 0 && (
            <div className="mb-2">
              <span className="font-medium text-yellow-300">Subjects: </span>
              <span className="text-gray-200">{Array.from(subjects).join(', ')}</span>
            </div>
          )}
          {outcomeCount > 0 && (
            <div className="mb-1">
              <span className="font-medium text-yellow-300">Outcomes: </span>
              <span className="text-gray-200">{outcomeCount} linked</span>
            </div>
          )}
          {activityCount > 0 && (
            <div>
              <span className="font-medium text-yellow-300">Activities: </span>
              <span className="text-gray-200">{activityCount} planned</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function YearAtAGlanceComponent({ year }: Props) {
  const { data: subjects } = useSubjects();
  const { data: thematicUnits } = useThematicUnits();
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);

  // Get all milestones from all subjects
  const allMilestones =
    subjects?.flatMap((subject) =>
      subject.milestones.map((milestone) => ({
        ...milestone,
        subject: subject,
      })),
    ) || [];

  // Group milestones by month (for demo purposes, we'll distribute them)
  const getMilestonesForMonth = (monthValue: number) => {
    // For demo, we'll show milestones based on their ID mod 10 to distribute across months
    return allMilestones.filter((_, index) => index % 10 === monthValue % 10);
  };

  // Get thematic units for a specific month
  const getThematicUnitsForMonth = (monthValue: number, year: number) => {
    if (!thematicUnits) return [];

    return thematicUnits.filter((unit) => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);

      // Check if the unit spans or occurs within this month
      const monthStart = new Date(year, monthValue, 1);
      const monthEnd = new Date(year, monthValue + 1, 0);

      // Unit overlaps with month if:
      // - Unit starts before month ends AND unit ends after month starts
      return startDate <= monthEnd && endDate >= monthStart;
    });
  };

  const handleViewThematicUnit = (unit: ThematicUnit) => {
    // For now, we'll just log it. Later this could open a detailed view or redirect
    console.log('Viewing thematic unit:', unit);
    // Could redirect to: `/thematic-units/${unit.id}` or open a modal
  };

  const openCreateModal = () => {
    setEditingMilestone(null);
    setTitle('');
    setDescription('');
    setSelectedSubjectId(subjects?.[0]?.id || null);
    setSelectedOutcomes([]);
    setIsModalOpen(true);
  };

  const openEditModal = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title);
    setDescription(milestone.description || '');
    setSelectedSubjectId(milestone.subjectId);
    setSelectedOutcomes(milestone.outcomes?.map((o) => o.outcome.code) || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedSubjectId) return;

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      subjectId: selectedSubjectId,
      outcomes: selectedOutcomes,
    };

    if (editingMilestone) {
      updateMilestone.mutate({ ...data, id: editingMilestone.id });
    } else {
      createMilestone.mutate(data);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (milestone: Milestone) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestone.mutate({ id: milestone.id, subjectId: milestone.subjectId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Year at a Glance - {year}/{year + 1}
        </h2>
        <div className="text-sm text-gray-600">
          Total Milestones: {allMilestones.length} • Thematic Units: {thematicUnits?.length || 0}
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-5 gap-4 lg:grid-cols-10">
        {SCHOOL_MONTHS.map((month) => {
          const monthMilestones = getMilestonesForMonth(month.value);
          const monthThematicUnits = getThematicUnitsForMonth(month.value, year);
          const hasContent = monthMilestones.length > 0 || monthThematicUnits.length > 0;

          return (
            <div key={month.value} className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
              {/* Month Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">{month.name}</h3>
                <button
                  onClick={() => openCreateModal()}
                  className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                >
                  + Add
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Thematic Units */}
                {monthThematicUnits.map((unit) => (
                  <ThematicUnitCard
                    key={`theme-${unit.id}`}
                    thematicUnit={unit}
                    onView={handleViewThematicUnit}
                  />
                ))}

                {/* Milestones */}
                {monthMilestones.map((milestone) => (
                  <MilestoneCard
                    key={`milestone-${milestone.id}`}
                    milestone={milestone}
                    subjectColor={SUBJECT_COLORS[milestone.subjectId % SUBJECT_COLORS.length]}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}

                {!hasContent && (
                  <div className="text-gray-400 text-xs text-center py-4">
                    No milestones or thematic units
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Milestone Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingMilestone ? 'Edit Milestone' : 'Create New Milestone'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="milestone-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <input
                id="milestone-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter milestone title"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="milestone-subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject *
              </label>
              <select
                id="milestone-subject"
                value={selectedSubjectId || ''}
                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a subject</option>
                {subjects?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="milestone-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="milestone-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter milestone description"
              />
            </div>

            {/* Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linked Outcomes
              </label>
              <OutcomeSelect
                value={selectedOutcomes}
                onChange={setSelectedOutcomes}
                placeholder="Search and select outcomes"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {editingMilestone ? 'Update' : 'Create'} Milestone
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
