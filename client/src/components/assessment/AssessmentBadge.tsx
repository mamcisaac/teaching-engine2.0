import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Meh, AlertCircle } from 'lucide-react';
import type { ETFOLessonPlan } from '../../hooks/useETFOPlanning';

interface AssessmentBadgeProps {
  lessonPlan: ETFOLessonPlan;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const assessmentStyles = {
  'thumbs-up': {
    icon: ThumbsUp,
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    label: 'Great',
  },
  'thumbs-okay': {
    icon: Meh,
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    label: 'Okay',
  },
  'thumbs-down': {
    icon: ThumbsDown,
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-700',
    label: 'Needs Work',
  },
  'not-assessed': {
    icon: AlertCircle,
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-500',
    label: 'Not Assessed',
  },
};

const sizeClasses = {
  sm: {
    container: 'px-2 py-1',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
};

export function AssessmentBadge({ lessonPlan, showLabel = true, size = 'md' }: AssessmentBadgeProps) {
  const assessmentType = lessonPlan.quickAssessment || 'not-assessed';
  const style = assessmentStyles[assessmentType as keyof typeof assessmentStyles];
  const sizeClass = sizeClasses[size];
  const Icon = style.icon;

  // Check if lesson is past due for assessment (e.g., more than 24 hours old)
  const isPastDue = !lessonPlan.quickAssessment && 
    new Date(lessonPlan.date) < new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        ${style.bgColor} ${style.borderColor} ${style.textColor} ${sizeClass.container}
        ${isPastDue ? 'animate-pulse' : ''}
      `}
      title={
        lessonPlan.quickAssessmentNotes 
          ? `${style.label}: ${lessonPlan.quickAssessmentNotes}`
          : style.label
      }
    >
      <Icon className={sizeClass.icon} />
      {showLabel && (
        <span className={`font-medium ${sizeClass.text}`}>
          {style.label}
        </span>
      )}
      {lessonPlan.quickAssessmentNotes && (
        <span className={`${sizeClass.text} opacity-60`}>📝</span>
      )}
    </motion.div>
  );
}