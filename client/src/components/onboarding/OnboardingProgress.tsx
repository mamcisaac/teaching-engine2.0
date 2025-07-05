import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  completionMessage: string;
}

export function OnboardingProgress({ completionMessage }: OnboardingProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg"
    >
      <p className="text-green-800 font-medium">{completionMessage}</p>
    </motion.div>
  );
}