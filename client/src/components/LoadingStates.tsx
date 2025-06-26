import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';

// Generic loading spinner
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  message?: string;
  className?: string;
}> = ({ size = 'md', message, className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

// Full page loading state
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" message={message} />
  </div>
);

// Card skeleton for list items
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      </div>
      
      {/* Body */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-gray-200 rounded flex-1"
                  style={{ 
                    width: `${Math.random() * 30 + 70}%` 
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    {/* Title field */}
    <div>
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    
    {/* Description field */}
    <div>
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>
    
    {/* Date fields */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    {/* Buttons */}
    <div className="flex justify-end gap-3 pt-6 border-t">
      <div className="h-10 bg-gray-200 rounded w-20"></div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

// Tab content skeleton
export const TabContentSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4 mt-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="mt-6 grid gap-4">
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Lesson plan skeleton
export const LessonPlanSkeleton: React.FC = () => (
  <div className="bg-white shadow rounded-lg animate-pulse">
    <div className="px-6 py-4 border-b">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
    </div>
    <div className="p-6 space-y-6">
      {/* Three-part lesson structure */}
      <div className="grid gap-6 lg:grid-cols-3">
        {['Minds On', 'Action', 'Consolidation'].map((section) => (
          <Card key={section}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Unit plan skeleton
export const UnitPlanSkeleton: React.FC = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <CardSkeleton count={6} />
  </div>
);

// Empty state component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className = '' }) => (
  <div className={`text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
    {icon && (
      <div className="mx-auto h-12 w-12 text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
    {action && (
      <div className="mt-6">
        {action}
      </div>
    )}
  </div>
);

// Retry component for failed loads
export const RetryLoad: React.FC<{
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message = 'Failed to load data' }) => (
  <div className="text-center py-8">
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </button>
  </div>
);