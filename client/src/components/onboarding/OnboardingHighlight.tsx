import React from 'react';
import { motion } from 'framer-motion';

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingHighlightProps {
  highlightPosition: HighlightPosition | null;
  onClick?: (e: React.MouseEvent) => void;
}

export function OnboardingHighlight({ highlightPosition, onClick }: OnboardingHighlightProps) {
  if (!highlightPosition) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 25 }}
      className="absolute bg-transparent"
      style={{
        top: highlightPosition.top,
        left: highlightPosition.left,
        width: highlightPosition.width,
        height: highlightPosition.height,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        pointerEvents: 'none',
      }}
      onClick={onClick}
    />
  );
}