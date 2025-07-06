import React from 'react';

import { cn } from '../../lib/utils';

interface SkeletonLayoutItem {
  type: 'avatar' | 'text' | 'button' | 'image';
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  lines?: number;
}

interface LoadingSkeletonProps {
  variant?: 'default' | 'card' | 'list' | 'table' | 'text' | 'avatar' | 'complex';
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
  columns?: number;
  lines?: number;
  height?: string;
  width?: string;
  className?: string;
  animate?: boolean;
  layout?: SkeletonLayoutItem[];
  'aria-label'?: string;
}

export function LoadingSkeleton({
  variant = 'default',
  size = 'md',
  rows = 3,
  columns = 3,
  lines = 3,
  height,
  width,
  className,
  animate = true,
  layout = [],
  'aria-label': ariaLabel = 'Loading...',
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = animate ? 'animate-pulse' : '';
  
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  const containerStyle: React.CSSProperties = {};
  if (height) {
containerStyle.height = height;
}
  if (width) {
containerStyle.width = width;
}

  const SkeletonBox = ({ 
    className: boxClassName = '', 
    style = {},
    'data-testid': testId,
    role,
    'aria-label': ariaLabelProp,
  }: { 
    className?: string; 
    style?: React.CSSProperties;
    'data-testid'?: string;
    role?: string;
    'aria-label'?: string;
  }) => (
    <div
      aria-label={ariaLabelProp}
      className={cn(baseClasses, animationClasses, boxClassName)}
      data-testid={testId}
      role={role}
      style={style}
    />
  );

  const renderComplexLayout = () => (
    <div className="flex items-start space-x-3">
      {layout.map((item, index) => {
        switch (item.type) {
          case 'avatar':
            return (
              <SkeletonBox
                key={index}
                className={cn(
                  'rounded-full flex-shrink-0',
                  item.size === 'sm' ? 'h-8 w-8' : 
                  item.size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'
                )}
                data-testid="skeleton-avatar"
              />
            );
          case 'text':
            return (
              <div key={index} className="flex-1 space-y-2" data-testid="skeleton-text">
                {Array.from({ length: item.lines || 2 }).map((_, lineIndex) => (
                  <SkeletonBox
                    key={lineIndex}
                    className={cn(
                      'h-4',
                      lineIndex === (item.lines || 2) - 1 ? 'w-3/4' : 'w-full'
                    )}
                  />
                ))}
              </div>
            );
          case 'button':
            return (
              <SkeletonBox
                key={index}
                className="h-9 rounded-md"
                data-testid="skeleton-button"
                style={{ width: item.width || '100px' }}
              />
            );
          case 'image':
            return (
              <SkeletonBox
                key={index}
                className={cn(
                  'rounded-lg',
                  item.size === 'sm' ? 'h-20 w-20' :
                  item.size === 'lg' ? 'h-48 w-48' : 'h-32 w-32'
                )}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );

  switch (variant) {
    case 'card':
      return (
        <div
          aria-label={ariaLabel}
          className={cn('p-4 border rounded-lg', className)}
          data-testid="loading-skeleton"
          role="status"
          style={containerStyle}
        >
          <div className="space-y-4">
            <SkeletonBox 
              className={cn('h-6', sizeClasses[size])} 
              data-testid="skeleton-title"
            />
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-4/5" />
              <SkeletonBox className="h-4 w-3/5" />
            </div>
            <div className="flex space-x-2">
              <SkeletonBox className="h-8 w-20 rounded-md" />
              <SkeletonBox className="h-8 w-16 rounded-md" />
            </div>
          </div>
          <SkeletonBox 
            className="h-4 mt-4" 
            data-testid="skeleton-content"
          />
        </div>
      );

    case 'list':
      return (
        <div
          aria-label={ariaLabel}
          className={cn('space-y-3', className)}
          data-testid="loading-skeleton"
          role="status"
          style={containerStyle}
        >
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3" data-testid={`skeleton-row-${index}`}>
              <SkeletonBox className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-4 w-3/4" />
                <SkeletonBox className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div
          aria-label={ariaLabel}
          className={cn('w-full', className)}
          data-testid="loading-skeleton"
          role="status"
          style={containerStyle}
        >
          {/* Table Header */}
          <div className="flex space-x-4 mb-4" data-testid="skeleton-table-header">
            {Array.from({ length: columns }).map((_, index) => (
              <SkeletonBox key={index} className="h-4 flex-1" />
            ))}
          </div>
          
          {/* Table Rows */}
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4" data-testid={`skeleton-table-row-${rowIndex}`}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <SkeletonBox 
                    key={colIndex} 
                    className="h-4 flex-1" 
                    data-testid={`skeleton-table-cell-${rowIndex}-${colIndex}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    case 'text':
      return (
        <div
          aria-label={ariaLabel}
          className={cn('space-y-2', className)}
          data-testid="loading-skeleton"
          role="status"
          style={containerStyle}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <SkeletonBox
              key={index}
              className={cn(
                'h-4',
                index === lines - 1 ? 'w-3/4' : 'w-full'
              )}
              data-testid={`skeleton-text-line-${index}`}
            />
          ))}
        </div>
      );

    case 'avatar':
      return (
        <SkeletonBox
          aria-label={ariaLabel}
          className={cn(
            'rounded-full',
            size === 'sm' ? 'h-8 w-8' :
            size === 'lg' ? 'h-16 w-16' : 'h-12 w-12',
            className
          )}
          data-testid="loading-skeleton"
          role="status"
          style={containerStyle}
        />
      );

    case 'complex':
      return (
        <div
          aria-label={ariaLabel}
          className={cn('p-4', className)}
          data-testid="loading-skeleton"
          role="status"
          style={containerStyle}
        >
          {renderComplexLayout()}
        </div>
      );

    default:
      return (
        <SkeletonBox
          aria-label={ariaLabel}
          className={cn(sizeClasses[size], 'w-full', className)}
          data-testid="loading-skeleton"
          role="status"
          style={containerStyle}
        />
      );
  }
}