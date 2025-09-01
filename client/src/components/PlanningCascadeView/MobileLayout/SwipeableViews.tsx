import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface SwipeableViewsProps {
  index: number;
  onChangeIndex: (index: number) => void;
  children: React.ReactNode[];
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const SwipeableViews: React.FC<SwipeableViewsProps> = ({
  index,
  onChangeIndex,
  children,
  className,
  threshold = 50,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const childrenArray = React.Children.toArray(children);
  
  useEffect(() => {
    setTranslateX(-index * 100);
  }, [index]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const diff = e.touches[0].clientX - startX;
    setCurrentX(diff);
    
    // Apply resistance at boundaries
    let newTranslateX = -index * 100 + (diff / window.innerWidth) * 100;
    
    if (index === 0 && diff > 0) {
      // Resistance when swiping right at first view
      newTranslateX = (diff / window.innerWidth) * 20;
    } else if (index === childrenArray.length - 1 && diff < 0) {
      // Resistance when swiping left at last view
      newTranslateX = -index * 100 + (diff / window.innerWidth) * 20;
    }
    
    setTranslateX(newTranslateX);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    
    const diff = currentX;
    const width = window.innerWidth;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && index > 0) {
        // Swipe right - go to previous
        onChangeIndex(index - 1);
      } else if (diff < 0 && index < childrenArray.length - 1) {
        // Swipe left - go to next
        onChangeIndex(index + 1);
      } else {
        // Snap back
        setTranslateX(-index * 100);
      }
    } else {
      // Snap back
      setTranslateX(-index * 100);
    }
    
    setCurrentX(0);
  };
  
  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setStartX(e.clientX);
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const diff = e.clientX - startX;
    setCurrentX(diff);
    
    let newTranslateX = -index * 100 + (diff / window.innerWidth) * 100;
    
    if (index === 0 && diff > 0) {
      newTranslateX = (diff / window.innerWidth) * 20;
    } else if (index === childrenArray.length - 1 && diff < 0) {
      newTranslateX = -index * 100 + (diff / window.innerWidth) * 20;
    }
    
    setTranslateX(newTranslateX);
  };
  
  const handleMouseUp = () => {
    handleTouchEnd();
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };
  
  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(${translateX}%)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {childrenArray.map((child, i) => (
          <div
            key={i}
            className="w-full h-full flex-shrink-0"
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Page indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {childrenArray.map((_, i) => (
          <button
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i === index ? 'bg-blue-600' : 'bg-gray-300'
            )}
            onClick={() => onChangeIndex(i)}
            aria-label={`Go to view ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

SwipeableViews.displayName = 'SwipeableViews';