import React, { useState, useEffect } from 'react';
import { useCreateParentMessage, useUpdateParentMessage } from '../api';
import { ParentMessage, ParentMessageInput } from '../types';
import { OutcomeSelector } from './OutcomeSelector';
import { ActivitySelectorMulti } from './ActivitySelectorMulti';
import RichTextEditor from './RichTextEditor';

interface Props {
  message?: ParentMessage;
  onSave?: (message: ParentMessage) => void;
  onCancel?: () => void;
  prefillData?: {
    activities?: number[];
    outcomes?: string[];
    timeframe?: string;
    title?: string;
    contentFr?: string;
    contentEn?: string;
  };
}

export function ParentMessageEditor({ message, onSave, onCancel, prefillData }: Props) {
  const [formData, setFormData] = useState<ParentMessageInput>({
    title: '',
    timeframe: '',
    contentFr: '',
    contentEn: '',
    linkedOutcomeIds: [],
    linkedActivityIds: [],
  });

  const [autoTranslate, setAutoTranslate] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'fr' | 'en'>('fr');

  const createMutation = useCreateParentMessage();
  const updateMutation = useUpdateParentMessage();

  // Initialize form data
  useEffect(() => {
    if (message) {
      setFormData({
        title: message.title,
        timeframe: message.timeframe,
        contentFr: message.contentFr,
        contentEn: message.contentEn,
        linkedOutcomeIds: message.linkedOutcomes?.map((o) => o.outcome.id) || [],
        linkedActivityIds: message.linkedActivities?.map((a) => a.activity.id) || [],
      });
    } else if (prefillData) {
      setFormData((prev) => ({
        ...prev,
        title: prefillData.title || '',
        timeframe: prefillData.timeframe || '',
        contentFr: prefillData.contentFr || '',
        contentEn: prefillData.contentEn || '',
        linkedActivityIds: prefillData.activities || [],
        linkedOutcomeIds: prefillData.outcomes || [],
      }));
    }
  }, [message, prefillData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (message) {
        const updatedMessage = await updateMutation.mutateAsync({
          id: message.id,
          data: formData,
        });
        onSave?.(updatedMessage);
      } else {
        const newMessage = await createMutation.mutateAsync(formData);
        onSave?.(newMessage);
      }
    } catch (error) {
      console.error('Failed to save parent message:', error);
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.contentFr.trim()) return;

    // For now, we'll just copy the French content to English
    // In a real implementation, this would call a translation API
    setFormData((prev) => ({
      ...prev,
      contentEn: `[Auto-translated] ${prev.contentFr}`,
    }));
  };

  const generateWeeklyTimeframe = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const format = (date: Date) => date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    return `Week of ${format(startOfWeek)} to ${format(endOfWeek)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {message ? 'Edit Newsletter' : 'Create Parent Newsletter'}
        </h2>
        <p className="text-gray-600 mt-1">
          Create a bilingual newsletter to share classroom updates with parents
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Timeframe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Newsletter Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Exploring Winter Themes"
              required
            />
          </div>
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700">
              Timeframe
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                id="timeframe"
                value={formData.timeframe}
                onChange={(e) => setFormData((prev) => ({ ...prev, timeframe: e.target.value }))}
                className="block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Week of Jan 12-19"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, timeframe: generateWeeklyTimeframe() }))
                }
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm hover:bg-gray-200"
              >
                This Week
              </button>
            </div>
          </div>
        </div>

        {/* Content Editors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Newsletter Content</h3>
            <div className="flex items-center space-x-4">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={() => setActiveLanguage('fr')}
                  className={`px-3 py-1 text-sm ${
                    activeLanguage === 'fr'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🇫🇷 Français
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLanguage('en')}
                  className={`px-3 py-1 text-sm ${
                    activeLanguage === 'en'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Auto-translate</span>
              </label>
            </div>
          </div>

          {activeLanguage === 'fr' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">French Content</label>
              <RichTextEditor
                value={formData.contentFr}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, contentFr: value }));
                  if (autoTranslate && value.trim()) {
                    // Simple auto-translate trigger
                    setTimeout(() => handleAutoTranslate(), 1000);
                  }
                }}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Content
                {autoTranslate && (
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                  >
                    Translate from French
                  </button>
                )}
              </label>
              <RichTextEditor
                value={formData.contentEn}
                onChange={(value) => setFormData((prev) => ({ ...prev, contentEn: value }))}
              />
            </div>
          )}
        </div>

        {/* Linked Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Outcomes</label>
            <OutcomeSelector
              selectedOutcomes={formData.linkedOutcomeIds || []}
              onChange={(outcomes) =>
                setFormData((prev) => ({ ...prev, linkedOutcomeIds: outcomes }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Linked Activities
            </label>
            <ActivitySelectorMulti
              selectedActivities={formData.linkedActivityIds || []}
              onSelectionChange={(activities) =>
                setFormData((prev) => ({ ...prev, linkedActivityIds: activities }))
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : message
                ? 'Update Newsletter'
                : 'Create Newsletter'}
          </button>
        </div>
      </form>
    </div>
  );
}
