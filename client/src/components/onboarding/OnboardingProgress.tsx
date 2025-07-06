import { motion } from 'framer-motion';
import React from 'react';

interface OnboardingProgressProps {
  completionMessage: string;
}

export function OnboardingProgress({ completionMessage }: OnboardingProgressProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
    >
      <p className="text-green-800 font-medium">{completionMessage}</p>
    </motion.div>
  );
}