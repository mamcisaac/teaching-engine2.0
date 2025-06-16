import React from 'react';
import type { Activity } from '../types';

interface CognateSummaryWidgetProps {
  activities: Record<number, Activity>;
}

export default function CognateSummaryWidget({ activities }: CognateSummaryWidgetProps) {
  // Collect all cognates from scheduled activities
  const cognateMap = new Map<
    string,
    { count: number; wordFr: string; wordEn: string; notes?: string | null }
  >();

  Object.values(activities).forEach((activity) => {
    if (activity.cognatePairs && activity.cognatePairs.length > 0) {
      activity.cognatePairs.forEach(({ cognatePair }) => {
        const key = `${cognatePair.wordFr}-${cognatePair.wordEn}`;
        const existing = cognateMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          cognateMap.set(key, {
            count: 1,
            wordFr: cognatePair.wordFr,
            wordEn: cognatePair.wordEn,
            notes: cognatePair.notes,
          });
        }
      });
    }
  });

  const cognateStats = Array.from(cognateMap.values())
    .sort((a, b) => b.count - a.count) // Sort by frequency
    .slice(0, 5); // Show top 5

  const activitiesWithCognates = Object.values(activities).filter(
    (activity) => activity.cognatePairs && activity.cognatePairs.length > 0,
  ).length;

  const totalActivities = Object.values(activities).length;

  if (cognateStats.length === 0) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">🧠</span>
          <h4 className="text-sm font-medium text-indigo-900">Language Transfer This Week</h4>
        </div>
        <p className="text-sm text-indigo-700">
          No cognate pairs scheduled this week. Consider adding some to reinforce French-English
          connections!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-lg mr-2">🧠</span>
          <h4 className="text-sm font-medium text-indigo-900">Language Transfer This Week</h4>
        </div>
        <div className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
          {activitiesWithCognates}/{totalActivities} activities
        </div>
      </div>

      <div className="space-y-2">
        {cognateStats.map(({ wordFr, wordEn, count, notes }) => (
          <div
            key={`${wordFr}-${wordEn}`}
            className="flex items-center justify-between text-sm"
            title={notes || undefined}
          >
            <span className="text-indigo-800">
              🇫🇷 <span className="font-medium">{wordFr}</span> – 🇬🇧{' '}
              <span className="font-medium">{wordEn}</span>
            </span>
            <span className="text-indigo-600 text-xs bg-indigo-100 px-2 py-0.5 rounded">
              {count} lesson{count !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>

      {cognateMap.size > 5 && (
        <div className="mt-2 pt-2 border-t border-indigo-200">
          <span className="text-xs text-indigo-600">
            +{cognateMap.size - 5} more cognate pairs this week
          </span>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-indigo-200">
        <div className="text-xs text-indigo-700">
          <strong>Tip:</strong> Use these cognates to help students recognize patterns between
          French and English!
        </div>
      </div>
    </div>
  );
}
