import React, { useState, useCallback } from 'react';
import { useSaveTimetable, useSubjects } from '../api';
import { Button } from './ui/Button';
import Dialog from './Dialog';
import { useToast } from './ui/use-toast';

interface TimeSlot {
  day: number;
  startMin: number;
  endMin: number;
  subjectId?: number;
  tempId?: string;
}

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
];

const COMMON_SCHEDULES = [
  {
    name: 'Elementary Standard',
    description: '8:30 AM - 3:00 PM with lunch and recess',
    slots: [
      { start: '08:30', end: '09:15', subject: 'Morning Circle' },
      { start: '09:15', end: '10:15', subject: 'Language Arts' },
      { start: '10:15', end: '10:30', subject: 'Recess' },
      { start: '10:30', end: '11:30', subject: 'Mathematics' },
      { start: '11:30', end: '12:15', subject: 'Science' },
      { start: '12:15', end: '13:00', subject: 'Lunch' },
      { start: '13:00', end: '13:45', subject: 'Reading' },
      { start: '13:45', end: '14:30', subject: 'Social Studies' },
      { start: '14:30', end: '15:00', subject: 'Art/Music/PE' },
    ],
  },
  {
    name: 'French Immersion',
    description: 'Bilingual schedule with language blocks',
    slots: [
      { start: '08:30', end: '09:00', subject: 'Accueil' },
      { start: '09:00', end: '10:00', subject: 'Français' },
      { start: '10:00', end: '10:15', subject: 'Récréation' },
      { start: '10:15', end: '11:15', subject: 'Mathématiques' },
      { start: '11:15', end: '12:00', subject: 'Sciences' },
      { start: '12:00', end: '12:45', subject: 'Dîner' },
      { start: '12:45', end: '13:30', subject: 'English' },
      { start: '13:30', end: '14:15', subject: 'Études sociales' },
      { start: '14:15', end: '15:00', subject: 'Arts/Musique/ÉP' },
    ],
  },
];

interface TimetableSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TimetableSetupWizard({ isOpen, onClose, onSuccess }: TimetableSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<'template' | 'customize' | 'review'>('template');
  const [customSlots, setCustomSlots] = useState<TimeSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  const { data: subjects = [] } = useSubjects();
  const saveTimetable = useSaveTimetable();
  const { toast } = useToast();

  const timeToMinutes = useCallback((timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }, []);

  const handleTemplateSelect = useCallback((templateIndex: number) => {
    setSelectedTemplate(templateIndex);
    const template = COMMON_SCHEDULES[templateIndex];
    
    // Create slots for all weekdays
    const slots: TimeSlot[] = [];
    DAYS.forEach(day => {
      template.slots.forEach(slot => {
        slots.push({
          day: day.value,
          startMin: timeToMinutes(slot.start),
          endMin: timeToMinutes(slot.end),
          subjectId: undefined, // Will be set in customize step
          tempId: `${day.value}-${slot.start}-${slot.end}`,
        });
      });
    });
    
    setCustomSlots(slots);
    setCurrentStep('customize');
  }, [timeToMinutes]);

  const handleCustomSchedule = useCallback(() => {
    setSelectedTemplate(null);
    setCustomSlots([]);
    setCurrentStep('customize');
  }, []);

  const addNewSlot = useCallback(() => {
    const newSlot: TimeSlot = {
      day: 0,
      startMin: 540, // 9:00 AM
      endMin: 600,   // 10:00 AM
      subjectId: undefined,
      tempId: `new-${Date.now()}`,
    };
    setEditingSlot(newSlot);
  }, []);

  const handleSlotEdit = useCallback((slot: TimeSlot) => {
    setEditingSlot({ ...slot });
  }, []);

  const handleSlotSave = useCallback((slot: TimeSlot) => {
    if (slot.tempId?.startsWith('new-')) {
      // Adding new slot
      setCustomSlots(prev => [...prev, slot]);
    } else {
      // Editing existing slot
      setCustomSlots(prev => prev.map(s => 
        s.tempId === slot.tempId ? slot : s
      ));
    }
    setEditingSlot(null);
  }, []);

  const handleSlotDelete = useCallback((slot: TimeSlot) => {
    setCustomSlots(prev => prev.filter(s => s.tempId !== slot.tempId));
  }, []);

  const duplicateToAllDays = useCallback((slot: TimeSlot) => {
    const newSlots: TimeSlot[] = [];
    DAYS.forEach(day => {
      if (day.value !== slot.day) {
        newSlots.push({
          ...slot,
          day: day.value,
          tempId: `${day.value}-${slot.startMin}-${slot.endMin}`,
        });
      }
    });
    setCustomSlots(prev => [...prev, ...newSlots]);
  }, []);

  const handleSaveTimetable = useCallback(async () => {
    try {
      const slotsToSave = customSlots.map(slot => ({
        day: slot.day,
        startMin: slot.startMin,
        endMin: slot.endMin,
        subjectId: slot.subjectId,
      }));

      await saveTimetable.mutateAsync(slotsToSave);
      
      toast({
        title: 'Timetable Saved',
        description: 'Your schedule has been updated successfully.',
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Save timetable error:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save timetable. Please try again.',
        variant: 'destructive',
      });
    }
  }, [customSlots, saveTimetable, toast, onSuccess]);

  const handleClose = useCallback(() => {
    setCurrentStep('template');
    setSelectedTemplate(null);
    setCustomSlots([]);
    setEditingSlot(null);
    onClose();
  }, [onClose]);

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Schedule</h2>
        <p className="text-gray-600">
          Select a template to get started quickly, or create a custom schedule.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {COMMON_SCHEDULES.map((template, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
            onClick={() => handleTemplateSelect(index)}
          >
            <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="space-y-1">
              {template.slots.slice(0, 4).map((slot, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-500">
                  <span>{slot.start} - {slot.end}</span>
                  <span>{slot.subject}</span>
                </div>
              ))}
              {template.slots.length > 4 && (
                <div className="text-xs text-gray-400 text-center">
                  +{template.slots.length - 4} more periods
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={handleCustomSchedule}
          className="w-full max-w-md"
        >
          Create Custom Schedule
        </Button>
      </div>
    </div>
  );

  const renderCustomizeStep = () => {
    const slotsByDay = DAYS.map(day => ({
      ...day,
      slots: customSlots
        .filter(slot => slot.day === day.value)
        .sort((a, b) => a.startMin - b.startMin),
    }));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customize Your Schedule</h2>
            <p className="text-gray-600">Add, edit, or remove time slots for each day.</p>
          </div>
          <Button onClick={addNewSlot}>Add Time Slot</Button>
        </div>

        <div className="grid gap-6">
          {slotsByDay.map(day => (
            <div key={day.value} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{day.label}</h3>
              {day.slots.length > 0 ? (
                <div className="space-y-2">
                  {day.slots.map(slot => (
                    <div
                      key={slot.tempId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-mono text-sm">
                          {minutesToTime(slot.startMin)} - {minutesToTime(slot.endMin)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {slot.subjectId
                            ? subjects.find(s => s.id === slot.subjectId)?.name || 'Unknown Subject'
                            : 'No subject assigned'
                          }
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => duplicateToAllDays(slot)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Copy to all days"
                        >
                          Copy All
                        </button>
                        <button
                          onClick={() => handleSlotEdit(slot)}
                          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSlotDelete(slot)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic text-center py-4">
                  No time slots for this day
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('template')}>
            Back to Templates
          </Button>
          <Button
            onClick={() => setCurrentStep('review')}
            disabled={customSlots.length === 0}
          >
            Review Schedule
          </Button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    const totalSlots = customSlots.length;
    const slotsWithSubjects = customSlots.filter(slot => slot.subjectId).length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Schedule</h2>
          <p className="text-gray-600">
            {totalSlots} time slots configured • {slotsWithSubjects} have subjects assigned
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Subject Assignment Optional
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You can assign subjects to time slots now or later. Unassigned slots can be used flexibly in your daily planning.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {DAYS.map(day => {
                const daySlots = customSlots
                  .filter(slot => slot.day === day.value)
                  .sort((a, b) => a.startMin - b.startMin);
                
                return daySlots.map((slot, index) => (
                  <tr key={slot.tempId}>
                    {index === 0 && (
                      <td className="px-4 py-4 text-sm font-medium text-gray-900" rowSpan={daySlots.length}>
                        {day.label}
                      </td>
                    )}
                    <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                      {minutesToTime(slot.startMin)} - {minutesToTime(slot.endMin)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {slot.subjectId
                        ? subjects.find(s => s.id === slot.subjectId)?.name || 'Unknown'
                        : 'Not assigned'
                      }
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {slot.endMin - slot.startMin} min
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('customize')}>
            Back to Edit
          </Button>
          <Button
            onClick={handleSaveTimetable}
            disabled={saveTimetable.isPending}
          >
            {saveTimetable.isPending ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Timetable Setup</h1>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center">
              {(['template', 'customize', 'review'] as const).map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep === step || (index < ['template', 'customize', 'review'].indexOf(currentStep))
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < ['template', 'customize', 'review'].indexOf(currentStep)
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Template</span>
              <span>Customize</span>
              <span>Review</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 'template' && renderTemplateStep()}
          {currentStep === 'customize' && renderCustomizeStep()}
          {currentStep === 'review' && renderReviewStep()}
        </div>
      </div>

      {/* Slot Edit Modal */}
      {editingSlot && (
        <SlotEditModal
          slot={editingSlot}
          subjects={subjects}
          onSave={handleSlotSave}
          onCancel={() => setEditingSlot(null)}
          minutesToTime={minutesToTime}
          timeToMinutes={timeToMinutes}
        />
      )}
    </Dialog>
  );
}

interface SlotEditModalProps {
  slot: TimeSlot;
  subjects: Array<{ id: number; name: string }>;
  onSave: (slot: TimeSlot) => void;
  onCancel: () => void;
  minutesToTime: (minutes: number) => string;
  timeToMinutes: (time: string) => number;
}

function SlotEditModal({ slot, subjects, onSave, onCancel, minutesToTime, timeToMinutes }: SlotEditModalProps) {
  const [editedSlot, setEditedSlot] = useState<TimeSlot>({ ...slot });

  const handleSave = () => {
    if (editedSlot.startMin >= editedSlot.endMin) {
      alert('End time must be after start time');
      return;
    }
    onSave(editedSlot);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {slot.tempId?.startsWith('new-') ? 'Add Time Slot' : 'Edit Time Slot'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={editedSlot.day}
              onChange={(e) => setEditedSlot(prev => ({ ...prev, day: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={minutesToTime(editedSlot.startMin)}
                onChange={(e) => setEditedSlot(prev => ({ ...prev, startMin: timeToMinutes(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={minutesToTime(editedSlot.endMin)}
                onChange={(e) => setEditedSlot(prev => ({ ...prev, endMin: timeToMinutes(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Optional)</label>
            <select
              value={editedSlot.subjectId || ''}
              onChange={(e) => setEditedSlot(prev => ({ 
                ...prev, 
                subjectId: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No subject assigned</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}