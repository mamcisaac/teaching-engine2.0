import React from 'react';
import { FolderOpen, Search, Filter, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'filtered-empty' | 'error';
  onAction?: () => void;
  searchQuery?: string;
}

export function EmptyState({ type, onAction, searchQuery }: EmptyStateProps) {
  const configs = {
    'no-data': {
      icon: <BookOpen className="h-16 w-16 text-gray-300 mb-4" />,
      title: "No Planning Data Yet",
      description: "Start by creating your first Long Range Plan to organize your curriculum.",
      actionLabel: "Create Long Range Plan",
      actionIcon: <BookOpen className="h-4 w-4 mr-2" />
    },
    'no-results': {
      icon: <Search className="h-16 w-16 text-gray-300 mb-4" />,
      title: `No results for "${searchQuery}"`,
      description: "Try adjusting your search terms or clearing filters.",
      actionLabel: "Clear Search",
      actionIcon: null
    },
    'filtered-empty': {
      icon: <Filter className="h-16 w-16 text-gray-300 mb-4" />,
      title: "No items match your filters",
      description: "Try adjusting your filters or clear them to see all items.",
      actionLabel: "Clear Filters",
      actionIcon: null
    },
    'error': {
      icon: <FolderOpen className="h-16 w-16 text-red-300 mb-4" />,
      title: "Unable to load data",
      description: "There was a problem loading your planning data. Please try again.",
      actionLabel: "Retry",
      actionIcon: null
    }
  };
  
  const config = configs[type];
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
      {config.icon}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        {config.description}
      </p>
      {onAction && (
        <Button onClick={onAction} variant="outline">
          {config.actionIcon}
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
}