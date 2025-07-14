import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import type { ReactNode} from 'react';
import React, { useState } from 'react';

import { cn } from '../../lib/utils';

import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface MobileOptimizedFormProps {
  children: ReactNode;
  className?: string;
}

export function MobileOptimizedForm({ children, className }: MobileOptimizedFormProps): React.ReactElement {
  return (
    <div className={cn(
      "w-full max-w-full mx-auto",
      "px-4 sm:px-6", // Responsive padding
      "space-y-4 sm:space-y-6", // Responsive spacing
      className
    )}>
      {children}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  required?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  required = false,
  className,
}: CollapsibleSectionProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            {title}
            {required && <span className="text-red-500 text-sm">*</span>}
          </CardTitle>
          <Button
            className="h-8 w-8 p-0"
            size="sm"
            variant="ghost"
            onClick={(): void => {
 setIsExpanded(!isExpanded); 
}}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface MobileTabsProps {
  children: ReactNode;
  className?: string;
}

export function MobileTabs({ children, className }: MobileTabsProps): React.ReactElement {
  return (
    <div className={cn(
      "w-full",
      // Stack tabs vertically on mobile, horizontal on larger screens
      "flex flex-col sm:flex-row gap-2 sm:gap-4",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ResponsiveGrid({ children, cols = 2, className }: ResponsiveGridProps): React.ReactElement {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-4",
      gridClasses[cols],
      className
    )}>
      {children}
    </div>
  );
}

// Touch-friendly input wrapper
interface TouchFriendlyInputProps {
  children: ReactNode;
  label: string;
  required?: boolean;
  className?: string;
}

export function TouchFriendlyInput({ 
  children, 
  label, 
  required = false, 
  className 
}: TouchFriendlyInputProps): React.ReactElement {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {/* Add touch-friendly styling to child inputs */}
        <div className="[&>*]:min-h-[44px] [&>*]:text-base [&>*]:touch-manipulation">
          {children}
        </div>
      </div>
    </div>
  );
}

// Preview mode for complex forms
interface FormPreviewProps {
  data: Record<string, unknown>;
  onEdit: () => void;
  className?: string;
}

export function FormPreview({ data, onEdit, className }: FormPreviewProps): React.ReactElement {
  const [showAll, setShowAll] = useState(false);
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          <div className="flex gap-2">
            <Button
              className="h-8"
              size="sm"
              variant="ghost"
              onClick={(): void => {
 setShowAll(!showAll); 
}}
            >
              {showAll ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show All
                </>
              )}
            </Button>
            <Button
              className="h-8"
              size="sm"
              variant="outline"
              onClick={onEdit}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {Object.entries(data)
            .filter(([key, value]) => value && (showAll || key === 'title' || key === 'description'))
            .map(([key, value]) => (
              <div key={key}>
                <h4 className="font-medium text-sm text-gray-700 capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="text-sm text-gray-900">
                  {Array.isArray(value) ? (
                    <ul className="list-disc list-inside">
                      {value.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : typeof value === 'string' && value.length > 100 ? (
                    <div className="prose prose-sm max-w-none">
                      {showAll ? value : `${value.substring(0, 100)}...`}
                    </div>
                  ) : (
                    <p>{String(value)}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}