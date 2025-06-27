import React, { useState, ReactElement, cloneElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface OnboardingTooltipProps {
  id: string;
  title: string;
  content: string;
  children: ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  delay?: number;
  actionText?: string;
  onAction?: () => void;
}

export function OnboardingTooltip({
  id: _id,
  title,
  content,
  children,
  position = 'top',
  showOnce = true,
  delay = 1000,
  actionText,
  onAction,
}: OnboardingTooltipProps) {
  const { state } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Don't show if onboarding is active or user isn't new
  if (state.currentFlow || !state.isFirstTimeUser) {
    return children;
  }

  // Don't show if already dismissed or shown (when showOnce is true)
  if (isDismissed || (showOnce && hasBeenShown)) {
    return children;
  }

  const handleMouseEnter = () => {
    if (hasBeenShown && showOnce) return;

    setTimeout(() => {
      setIsVisible(true);
      setHasBeenShown(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const getTooltipStyles = () => {
    const base = 'absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72';

    switch (position) {
      case 'top':
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${base} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${base} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${base} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return base;
    }
  };

  const getArrowStyles = () => {
    const base = 'absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45';

    switch (position) {
      case 'top':
        return `${base} -bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0`;
      case 'bottom':
        return `${base} -top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0`;
      case 'left':
        return `${base} -right-1.5 top-1/2 -translate-y-1/2 border-l-0 border-b-0`;
      case 'right':
        return `${base} -left-1.5 top-1/2 -translate-y-1/2 border-r-0 border-t-0`;
      default:
        return base;
    }
  };

  return (
    <div className="relative inline-block">
      {cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        className: `${children.props.className || ''} ${isVisible ? 'z-40' : ''}`,
      })}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={getTooltipStyles()}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Arrow */}
            <div className={getArrowStyles()} />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss tooltip"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="pr-6">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
                </div>
              </div>

              {actionText && onAction && (
                <button
                  onClick={() => {
                    onAction();
                    handleDismiss();
                  }}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {actionText} →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
