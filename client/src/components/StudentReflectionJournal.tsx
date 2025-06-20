import { useState } from 'react';
import {
  useStudentReflections,
  useCreateStudentReflection,
  useDeleteStudentReflection,
  useOutcomes,
  useThematicUnits,
} from '../api';
import type { StudentReflectionInput } from '../types';
import { Modal } from './ui/Modal';

interface StudentReflectionJournalProps {
  studentId: number;
  studentName: string;
}

interface ReflectionFormData {
  date: string;
  text: string;
  emoji: string;
  outcomeId?: string;
  themeId?: number;
}

const EMOJI_OPTIONS = [
  { emoji: '🙂', label: 'Happy/Good', labelFr: 'Content/Bien' },
  { emoji: '😐', label: 'Okay/Neutral', labelFr: 'Correct/Neutre' },
  { emoji: '😕', label: 'Confused/Hard', labelFr: 'Confus/Difficile' },
  { emoji: '😍', label: 'Loved it!', labelFr: "J'ai adoré!" },
  { emoji: '🤔', label: 'Thinking/Learning', labelFr: 'Je réfléchis' },
  { emoji: '😴', label: 'Tired/Bored', labelFr: 'Fatigué/Ennuyé' },
];

export default function StudentReflectionJournal({
  studentId,
  studentName,
}: StudentReflectionJournalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ReflectionFormData>({
    date: new Date().toISOString().split('T')[0],
    text: '',
    emoji: '🙂',
  });

  // Fetch data
  const { data: reflections = [], isLoading } = useStudentReflections(studentId);
  const { data: outcomes = [] } = useOutcomes();
  const { data: themes = [] } = useThematicUnits();

  // Mutations
  const createReflection = useCreateStudentReflection();
  const deleteReflection = useDeleteStudentReflection();

  const handleCreateReflection = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      text: '',
      emoji: '🙂',
    });
    setIsModalOpen(true);
  };

  const handleSaveReflection = () => {
    const reflectionData: StudentReflectionInput = {
      date: formData.date + 'T12:00:00.000Z',
      text: formData.text || undefined,
      emoji: formData.emoji || undefined,
      outcomeId: formData.outcomeId,
      themeId: formData.themeId,
    };

    createReflection.mutate(
      { studentId, data: reflectionData },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      },
    );
  };

  const handleDeleteReflection = (reflectionId: number) => {
    if (confirm('Are you sure you want to delete this reflection?')) {
      deleteReflection.mutate({ studentId, reflectionId });
    }
  };

  const groupReflectionsByMonth = () => {
    const grouped: { [key: string]: typeof reflections } = {};

    reflections.forEach((reflection) => {
      const date = new Date(reflection.date || reflection.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(reflection);
    });

    // Sort each month's reflections by date (newest first)
    Object.keys(grouped).forEach((month) => {
      grouped[month].sort(
        (a, b) =>
          new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime(),
      );
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const groupedReflections = groupReflectionsByMonth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          🧠 {studentName}'s Reflection Journal
        </h3>
        <button
          onClick={handleCreateReflection}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
        >
          ➕ Add Reflection
        </button>
      </div>

      {/* Reflections Timeline */}
      {Object.keys(groupedReflections).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedReflections)
            .sort(([a], [b]) => new Date(b + ' 1').getTime() - new Date(a + ' 1').getTime())
            .map(([month, monthReflections]) => (
              <div key={month} className="space-y-3">
                <h4 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1">
                  {month}
                </h4>
                <div className="space-y-3">
                  {monthReflections.map((reflection) => (
                    <div
                      key={reflection.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{reflection.emoji}</span>
                            <span className="text-sm font-medium text-gray-600">
                              {new Date(
                                reflection.date || reflection.createdAt,
                              ).toLocaleDateString()}
                            </span>
                            {reflection.outcome && (
                              <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {reflection.outcome.code}
                              </span>
                            )}
                            {reflection.theme && (
                              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                {reflection.theme.title}
                              </span>
                            )}
                          </div>

                          {reflection.text && (
                            <div className="bg-gray-50 p-3 rounded-md mb-2">
                              <p className="text-sm text-gray-800 italic">"{reflection.text}"</p>
                            </div>
                          )}

                          {reflection.voicePath && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>🎙️</span>
                              <span>Voice recording available</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteReflection(reflection.id)}
                          className="text-red-600 hover:text-red-800 text-sm ml-4"
                          title="Delete reflection"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-lg mb-1">No reflections yet</p>
          <p className="text-sm mb-4">Help {studentName} reflect on their learning!</p>
          <button
            onClick={handleCreateReflection}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add First Reflection
          </button>
        </div>
      )}

      {/* Reflection Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Reflection for ${studentName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How did you feel? / Comment tu te sens?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EMOJI_OPTIONS.map(({ emoji, label, labelFr }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    formData.emoji === emoji
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-xs text-gray-600">{labelFr}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tell us more (optional) / Dis-nous plus
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="J'ai aimé... / C'était difficile... / J'ai appris..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About which learning outcome? (optional)
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
              About which theme? (optional)
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

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReflection}
              disabled={!formData.emoji}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Save Reflection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
