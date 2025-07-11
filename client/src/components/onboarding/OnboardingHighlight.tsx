import { motion } from 'framer-motion';
import React from 'react';

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

export function OnboardingHighlight({ highlightPosition, onClick }: OnboardingHighlightProps): React.ReactElement | null {
  if (highlightPosition === null || highlightPosition === undefined) {
return null;
}

  return (
    <motion.div
      animate={{ scale: 1 }}
      className="absolute bg-transparent"
      initial={{ scale: 0 }}
      style={{
        top: highlightPosition.top,
        left: highlightPosition.left,
        width: highlightPosition.width,
        height: highlightPosition.height,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        pointerEvents: 'none',
      }}
      transition={{ type: 'spring', damping: 25 }}
      onClick={onClick}
    />
  );
}