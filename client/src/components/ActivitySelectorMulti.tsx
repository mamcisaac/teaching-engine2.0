import React, { useState } from 'react';
import { useActivities } from '../api';
import { Activity } from '../types';

interface Props {
  selectedActivities: number[];
  onSelectionChange: (activities: number[]) => void;
}

export function ActivitySelectorMulti({ selectedActivities, onSelectionChange }: Props) {
  const { data: activities, isLoading } = useActivities();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set());

  // Group activities by milestone
  const activitiesByMilestone = React.useMemo(() => {
    if (!activities) return new Map();

    const grouped = new Map<
      number,
      { milestone: { id: number; title: string } | undefined; activities: Activity[] }
    >();

    activities.forEach((activity) => {
      const milestoneId = activity.milestoneId;
      if (!grouped.has(milestoneId)) {
        grouped.set(milestoneId, {
          milestone: activity.milestone,
          activities: [],
        });
      }
      grouped.get(milestoneId)!.activities.push(activity);
    });

    return grouped;
  }, [activities]);

  // Filter activities based on search
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm) return activitiesByMilestone;

    const filtered = new Map<
      number,
      { milestone: { id: number; title: string } | undefined; activities: Activity[] }
    >();
    const searchLower = searchTerm.toLowerCase();

    activitiesByMilestone.forEach((group, milestoneId) => {
      const filteredActivities = group.activities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchLower) ||
          activity.titleEn?.toLowerCase().includes(searchLower) ||
          activity.titleFr?.toLowerCase().includes(searchLower) ||
          group.milestone?.title.toLowerCase().includes(searchLower),
      );

      if (filteredActivities.length > 0) {
        filtered.set(milestoneId, {
          milestone: group.milestone,
          activities: filteredActivities,
        });
      }
    });

    return filtered;
  }, [activitiesByMilestone, searchTerm]);

  const toggleActivity = (activityId: number) => {
    const newSelection = selectedActivities.includes(activityId)
      ? selectedActivities.filter((id) => id !== activityId)
      : [...selectedActivities, activityId];
    onSelectionChange(newSelection);
  };

  const toggleMilestone = (milestoneId: number) => {
    if (expandedMilestones.has(milestoneId)) {
      setExpandedMilestones((prev) => {
        const next = new Set(prev);
        next.delete(milestoneId);
        return next;
      });
    } else {
      setExpandedMilestones((prev) => new Set(prev).add(milestoneId));
    }
  };

  const selectAllInMilestone = (milestoneId: number) => {
    const group = filteredGroups.get(milestoneId);
    if (!group) return;

    const milestoneActivityIds = group.activities.map((a) => a.id);
    const allSelected = milestoneActivityIds.every((id) => selectedActivities.includes(id));

    if (allSelected) {
      // Deselect all
      onSelectionChange(selectedActivities.filter((id) => !milestoneActivityIds.includes(id)));
    } else {
      // Select all
      const newSelection = [...new Set([...selectedActivities, ...milestoneActivityIds])];
      onSelectionChange(newSelection);
    }
  };

  if (isLoading) {
    return (
      <div className="border border-gray-300 rounded-md p-4 min-h-[200px] flex items-center justify-center">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Search bar */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Activity list */}
      <div className="max-h-[300px] overflow-y-auto">
        {filteredGroups.size === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No activities found matching your search.' : 'No activities available.'}
          </div>
        ) : (
          Array.from(filteredGroups.entries()).map(([milestoneId, group]) => {
            const milestoneActivityIds = group.activities.map((a) => a.id);
            const selectedCount = milestoneActivityIds.filter((id) =>
              selectedActivities.includes(id),
            ).length;
            const isExpanded = expandedMilestones.has(milestoneId);

            return (
              <div key={milestoneId} className="border-b last:border-b-0">
                {/* Milestone header */}
                <div
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleMilestone(milestoneId)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                    <span className="font-medium text-gray-700">
                      {group.milestone?.title || 'Uncategorized'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({selectedCount}/{group.activities.length} selected)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAllInMilestone(milestoneId);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1"
                  >
                    {selectedCount === group.activities.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Activities */}
                {isExpanded && (
                  <div className="bg-white">
                    {group.activities.map((activity) => (
                      <label
                        key={activity.id}
                        className="flex items-center px-6 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activity.id)}
                          onChange={() => toggleActivity(activity.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">{activity.title}</div>
                          {activity.titleEn && activity.titleFr && (
                            <div className="text-xs text-gray-500">
                              {activity.titleEn} / {activity.titleFr}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
        {selectedActivities.length} activities selected
      </div>
    </div>
  );
}
