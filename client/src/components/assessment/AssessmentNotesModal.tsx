import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, TrendingUp, TrendingDown, Users, Clock, Package, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/core/client';
import type { ETFOLessonPlan } from '../../hooks/useETFOPlanning';

interface AssessmentNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonPlan: ETFOLessonPlan;
}

interface DetailedReflection {
  studentEngagement?: 'high' | 'medium' | 'low';
  paceAssessment?: 'too-fast' | 'just-right' | 'too-slow';
  materialEffectiveness?: 'very-effective' | 'effective' | 'needs-improvement';
  wouldRepeat?: boolean;
  modificationNotes?: string;
}

export function AssessmentNotesModal({ isOpen, onClose, lessonPlan }: AssessmentNotesModalProps) {
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState<DetailedReflection>({
    studentEngagement: lessonPlan.studentEngagement,
    paceAssessment: lessonPlan.paceAssessment,
    materialEffectiveness: lessonPlan.materialEffectiveness,
    wouldRepeat: lessonPlan.wouldRepeat,
    modificationNotes: lessonPlan.modificationNotes || '',
  });

  const detailedReflectionMutation = useMutation({
    mutationFn: async (data: DetailedReflection) => {
      const response = await apiClient.patch(
        `/api/etfo-lesson-plans/${lessonPlan.id}/detailed-reflection`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Detailed reflection saved successfully');
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-stats'] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to save detailed reflection');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    detailedReflectionMutation.mutate(reflection);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detailed Lesson Reflection</h2>
              <p className="text-sm text-gray-500 mt-1">{lessonPlan.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Student Engagement */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                Student Engagement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'medium', 'low'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setReflection({ ...reflection, studentEngagement: level })}
                    className={`
                      px-4 py-2 rounded-lg border transition-all capitalize
                      ${reflection.studentEngagement === level
                        ? level === 'high'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : level === 'medium'
                          ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                          : 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {level === 'high' && <TrendingUp className="w-4 h-4 inline mr-1" />}
                    {level === 'low' && <TrendingDown className="w-4 h-4 inline mr-1" />}
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Pace Assessment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Lesson Pace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['too-fast', 'just-right', 'too-slow'] as const).map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setReflection({ ...reflection, paceAssessment: pace })}
                    className={`
                      px-4 py-2 rounded-lg border transition-all
                      ${reflection.paceAssessment === pace
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {pace === 'too-fast' ? 'Too Fast' : pace === 'just-right' ? 'Just Right' : 'Too Slow'}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Effectiveness */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4" />
                Material Effectiveness
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['very-effective', 'effective', 'needs-improvement'] as const).map((effectiveness) => (
                  <button
                    key={effectiveness}
                    type="button"
                    onClick={() => setReflection({ ...reflection, materialEffectiveness: effectiveness })}
                    className={`
                      px-4 py-2 rounded-lg border transition-all
                      ${reflection.materialEffectiveness === effectiveness
                        ? effectiveness === 'very-effective'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : effectiveness === 'effective'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {effectiveness === 'very-effective' 
                      ? 'Very Effective' 
                      : effectiveness === 'effective' 
                      ? 'Effective' 
                      : 'Needs Work'}
                  </button>
                ))}
              </div>
            </div>

            {/* Would Repeat */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <RefreshCw className="w-4 h-4" />
                Would You Repeat This Lesson?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setReflection({ ...reflection, wouldRepeat: value })}
                    className={`
                      px-4 py-2 rounded-lg border transition-all
                      ${reflection.wouldRepeat === value
                        ? value
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {value ? '✓ Yes, I would' : '✗ No, needs changes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Modification Notes */}
            <div>
              <label htmlFor="modification-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Modifications for Next Time
              </label>
              <textarea
                id="modification-notes"
                value={reflection.modificationNotes}
                onChange={(e) => setReflection({ ...reflection, modificationNotes: e.target.value })}
                placeholder="What would you change or improve for next time?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={detailedReflectionMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {detailedReflectionMutation.isPending ? 'Saving...' : 'Save Reflection'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}