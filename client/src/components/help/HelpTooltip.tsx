import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpTooltipProps } from '../../types/help';
import { clsx } from 'clsx';

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  position = 'top',
  trigger = 'hover',
  delay = 200,
  maxWidth = 300,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    // Ensure tooltip stays within viewport
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  }, [position]);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible, position, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone the child element and add event handlers
  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    ...(trigger === 'hover'
      ? {
          onMouseEnter: showTooltip,
          onMouseLeave: hideTooltip,
        }
      : {
          onClick: () => {
            if (isVisible) {
              hideTooltip();
            } else {
              showTooltip();
            }
          },
        }),
  });

  const getArrowClasses = () => {
    const base = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    switch (position) {
      case 'top':
        return `${base} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${base} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${base} left-full top-1/2 -translate-y-1/2 -translate-x-1/2`;
      case 'right':
        return `${base} right-full top-1/2 -translate-y-1/2 translate-x-1/2`;
      default:
        return base;
    }
  };

  return (
    <>
      {triggerElement}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={clsx(
              'fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
              'transition-opacity duration-200',
            )}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              maxWidth: maxWidth,
            }}
            role="tooltip"
          >
            {content}
            <div className={getArrowClasses()} />
          </div>,
          document.body,
        )}
    </>
  );
};
