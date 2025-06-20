import React, { useState } from 'react';
import { useTimetable, useSubjects } from '../api';
import { TimetableSetupWizard } from '../components/TimetableSetupWizard';
import { Button } from '../components/ui/Button';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
];

export default function TimetablePage() {
  const [showWizard, setShowWizard] = useState(false);
  const { data: slots = [], refetch } = useTimetable();
  const { data: subjects = [] } = useSubjects();

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleWizardSuccess = () => {
    refetch();
  };

  const slotsByDay = DAYS.map(day => ({
    ...day,
    slots: slots
      .filter(slot => slot.day === day.value)
      .sort((a, b) => a.startMin - b.startMin),
  }));

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Timetable</h1>
          <p className="text-gray-600 mt-1">
            Set up your daily schedule to help with automated planning
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          {slots.length > 0 ? 'Edit Schedule' : 'Setup Schedule'}
        </Button>
      </div>

      {slots.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No timetable configured</h3>
            <p className="mt-2 text-gray-600">
              Set up your weekly schedule to enable smart daily planning and activity suggestions.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowWizard(true)}>
                Setup Your Schedule
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">
              {slots.length} time slots configured across the week
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slotsByDay.map(day => {
                  if (day.slots.length === 0) {
                    return (
                      <tr key={day.value}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {day.label}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>
                          No slots configured
                        </td>
                      </tr>
                    );
                  }

                  return day.slots.map((slot, index) => (
                    <tr key={slot.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {index === 0 && (
                        <td 
                          className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200" 
                          rowSpan={day.slots.length}
                        >
                          {day.label}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {minutesToTime(slot.startMin)} - {minutesToTime(slot.endMin)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {slot.subjectId
                          ? subjects.find(s => s.id === slot.subjectId)?.name || 'Unknown Subject'
                          : (
                            <span className="text-gray-400 italic">No subject assigned</span>
                          )
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {slot.endMin - slot.startMin} min
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total teaching time per week: {
                  Math.round(slots.reduce((total, slot) => total + (slot.endMin - slot.startMin), 0) / 60 * 10) / 10
                } hours
              </div>
              <Button
                variant="outline"
                onClick={() => setShowWizard(true)}
              >
                Modify Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      <TimetableSetupWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={handleWizardSuccess}
      />
    </div>
  );
}
