import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Meh, Check, Edit2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/core/client';
import type { ETFOLessonPlan } from '../../hooks/useETFOPlanning';

interface QuickAssessmentWidgetProps {
  lessonPlan: ETFOLessonPlan;
  onAssessmentComplete?: () => void;
  compact?: boolean;
}

type AssessmentType = 'thumbs-up' | 'thumbs-okay' | 'thumbs-down';

const assessmentConfig = {
  'thumbs-up': {
    icon: ThumbsUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    label: 'Great lesson!',
    emoji: '👍',
  },
  'thumbs-okay': {
    icon: Meh,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    hoverColor: 'hover:bg-yellow-100',
    label: 'Okay lesson',
    emoji: '👌',
  },
  'thumbs-down': {
    icon: ThumbsDown,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100',
    label: 'Needs improvement',
    emoji: '👎',
  },
};

export function QuickAssessmentWidget({
  lessonPlan,
  onAssessmentComplete,
  compact = false,
}: QuickAssessmentWidgetProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(lessonPlan.quickAssessmentNotes || '');
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(
    lessonPlan.quickAssessment as AssessmentType | null
  );
  const queryClient = useQueryClient();

  const quickAssessmentMutation = useMutation({
    mutationFn: async (data: { quickAssessment: AssessmentType; quickAssessmentNotes?: string }) => {
      const response = await apiClient.patch(
        `/api/etfo-lesson-plans/${lessonPlan.id}/quick-assessment`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Assessment saved successfully');
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-stats'] });
      setShowNotes(false);
      onAssessmentComplete?.();
    },
    onError: () => {
      toast.error('Failed to save assessment');
    },
  });

  const handleAssessmentClick = (assessment: AssessmentType) => {
    if (selectedAssessment === assessment && !showNotes) {
      // If clicking the same assessment, show notes
      setShowNotes(true);
    } else {
      // Select new assessment
      setSelectedAssessment(assessment);
      setShowNotes(true);
    }
  };

  const handleSaveAssessment = () => {
    if (!selectedAssessment) return;
    
    quickAssessmentMutation.mutate({
      quickAssessment: selectedAssessment,
      quickAssessmentNotes: notes.trim() || undefined,
    });
  };

  const handleCancelNotes = () => {
    setShowNotes(false);
    setNotes(lessonPlan.quickAssessmentNotes || '');
  };

  if (compact && lessonPlan.quickAssessment) {
    const config = assessmentConfig[lessonPlan.quickAssessment];
    return (
      <div className="inline-flex items-center gap-1">
        <span className="text-lg">{config.emoji}</span>
        {lessonPlan.quickAssessmentNotes && (
          <span className="text-xs text-gray-500" title={lessonPlan.quickAssessmentNotes}>
            📝
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Assessment Buttons */}
        <div className="flex items-center gap-1">
          {(Object.entries(assessmentConfig) as [AssessmentType, typeof assessmentConfig[AssessmentType]][]).map(
            ([key, config]) => {
              const Icon = config.icon;
              const isSelected = selectedAssessment === key;
              const isAssessed = lessonPlan.quickAssessment === key;
              
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAssessmentClick(key)}
                  className={`
                    relative p-2 rounded-lg transition-all duration-200
                    ${isSelected || isAssessed 
                      ? `${config.bgColor} ${config.color}` 
                      : 'bg-gray-50 text-gray-400 hover:text-gray-600'
                    }
                    ${config.hoverColor}
                  `}
                  title={config.label}
                >
                  <Icon className="w-5 h-5" />
                  {isAssessed && !showNotes && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Check className="w-3 h-3 text-green-600 bg-white rounded-full" />
                    </motion.div>
                  )}
                </motion.button>
              );
            }
          )}
        </div>

        {/* Existing Assessment Indicator */}
        {lessonPlan.quickAssessment && !showNotes && (
          <button
            onClick={() => setShowNotes(true)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            {lessonPlan.assessedAt && (
              <span>
                {new Date(lessonPlan.assessedAt).toLocaleDateString()}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Notes Section */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="mb-2">
                <label htmlFor="assessment-notes" className="text-sm font-medium text-gray-700">
                  Quick Notes (optional)
                </label>
                <textarea
                  id="assessment-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any quick thoughts or observations..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelNotes}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssessment}
                  disabled={!selectedAssessment || quickAssessmentMutation.isPending}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quickAssessmentMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}