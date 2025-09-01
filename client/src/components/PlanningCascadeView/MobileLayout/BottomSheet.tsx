import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  height?: 'auto' | 'half' | 'full';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  height = 'auto',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(100);
  
  useEffect(() => {
    setTranslateY(isOpen ? 0 : 100);
  }, [isOpen]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const diff = touch.clientY - startY;
    
    // Only allow dragging down
    if (diff > 0) {
      setCurrentY(diff);
      const sheetHeight = sheetRef.current?.offsetHeight || 0;
      const percentage = (diff / sheetHeight) * 100;
      setTranslateY(Math.min(percentage, 100));
    }
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged more than 30%, close the sheet
    const sheetHeight = sheetRef.current?.offsetHeight || 0;
    const percentage = (currentY / sheetHeight) * 100;
    
    if (percentage > 30) {
      onClose();
      setTranslateY(100);
    } else {
      setTranslateY(0);
    }
    
    setCurrentY(0);
  };
  
  const getHeightClass = () => {
    switch (height) {
      case 'half':
        return 'h-1/2';
      case 'full':
        return 'h-full';
      default:
        return 'max-h-[90vh]';
    }
  };
  
  if (!isOpen && translateY === 100) {
    return null;
  }
  
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl',
          getHeightClass(),
          className
        )}
        style={{
          transform: `translateY(${translateY}%)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bottom sheet'}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center py-2 cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          'overflow-y-auto',
          height === 'auto' ? 'max-h-[70vh]' : 'flex-1'
        )}>
          {children}
        </div>
      </div>
    </>
  );
};

BottomSheet.displayName = 'BottomSheet';