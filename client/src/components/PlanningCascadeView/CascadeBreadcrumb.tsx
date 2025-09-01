import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CascadeSelection } from './types';

interface CascadeBreadcrumbProps {
  selection: CascadeSelection;
}

export function CascadeBreadcrumb({ selection }: CascadeBreadcrumbProps): JSX.Element {
  const getBreadcrumbItems = (): Array<{ label: string; type: string }> => {
    const items: Array<{ label: string; type: string }> = [];

    // Build breadcrumb based on selection type
    switch (selection.type) {
      case 'curriculum':
        items.push({ label: 'Curriculum', type: 'curriculum' });
        if (selection.data && 'code' in selection.data) {
          items.push({ label: selection.data.code, type: 'expectation' });
        }
        break;

      case 'lrp':
        items.push({ label: 'Long Range Plans', type: 'lrp' });
        if (selection.data && 'title' in selection.data) {
          items.push({ label: selection.data.title, type: 'lrp' });
        }
        break;

      case 'unit':
        items.push({ label: 'Long Range Plans', type: 'lrp' });
        if (selection.data && 'longRangePlan' in selection.data && selection.data.longRangePlan) {
          items.push({ label: selection.data.longRangePlan.title, type: 'lrp' });
        }
        items.push({ label: 'Units', type: 'unit' });
        if (selection.data && 'title' in selection.data) {
          items.push({ label: selection.data.title, type: 'unit' });
        }
        break;

      case 'lesson':
        items.push({ label: 'Long Range Plans', type: 'lrp' });
        // Would need to traverse up through unit to get LRP title
        items.push({ label: 'Units', type: 'unit' });
        // Would need unit title from parent
        items.push({ label: 'Lessons', type: 'lesson' });
        if (selection.data && 'title' in selection.data) {
          items.push({ label: selection.data.title, type: 'lesson' });
        }
        break;

      case 'daybook':
        items.push({ label: 'Daybook Entries', type: 'daybook' });
        if (selection.data && 'date' in selection.data) {
          items.push({ label: new Date(selection.data.date).toLocaleDateString(), type: 'daybook' });
        }
        break;
    }

    return items;
  };

  const items = getBreadcrumbItems();

  return (
    <nav className="flex items-center space-x-1 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          )}
          <span
            className={cn(
              "px-2 py-1 rounded",
              index === items.length - 1
                ? "font-medium text-gray-900 bg-gray-100"
                : "text-gray-600 hover:text-gray-900 cursor-pointer"
            )}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}