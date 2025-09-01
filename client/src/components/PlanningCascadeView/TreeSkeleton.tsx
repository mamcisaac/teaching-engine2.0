import React from 'react';
import { cn } from '../../lib/utils';

interface TreeSkeletonProps {
  count?: number;
  className?: string;
}

export function TreeSkeleton({ count = 5, className }: TreeSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2 px-2 h-8"
          style={{ paddingLeft: `${(index % 3) * 20 + 8}px` }}
        >
          {/* Expand icon skeleton */}
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          
          {/* Icon skeleton */}
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          
          {/* Label skeleton */}
          <div 
            className="h-4 bg-gray-200 rounded animate-pulse" 
            style={{ width: `${Math.random() * 40 + 30}%` }}
          />
          
          {/* Progress skeleton (sometimes) */}
          {Math.random() > 0.5 && (
            <div className="ml-auto flex items-center gap-2">
              <div className="w-8 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-12 h-1 bg-gray-200 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}