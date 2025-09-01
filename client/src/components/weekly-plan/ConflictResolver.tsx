import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Clock, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import type { LessonPlan } from '@shared/types';

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface ScheduleConflict {
  lesson1: LessonPlan & { timeSlot: TimeSlot };
  lesson2: LessonPlan & { timeSlot: TimeSlot };
  type: 'overlap' | 'same-time';
  severity: 'high' | 'medium' | 'low';
}

interface ConflictResolverProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ScheduleConflict[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  lessons: LessonPlan[];
}

interface ConflictResolution {
  conflictId: string;
  action: 'move' | 'swap' | 'remove' | 'ignore';
  targetLesson: string;
  newTimeSlot?: TimeSlot;
}

export function ConflictResolver({ 
  isOpen, 
  onClose, 
  conflicts, 
  onResolve,
  lessons 
}: ConflictResolverProps): React.ReactElement {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [resolving, setResolving] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getConflictId = (conflict: ScheduleConflict): string => {
    return `${conflict.lesson1.id}-${conflict.lesson2.id}`;
  };

  const availableTimeSlots = useMemo(() => {
    const occupied = new Set<string>();
    lessons.forEach(lesson => {
      if (lesson.materials) {
        try {
          const materials = JSON.parse(lesson.materials);
          if (materials.timeSlot) {
            const key = `${materials.timeSlot.dayOfWeek}-${materials.timeSlot.startTime}`;
            occupied.add(key);
          }
        } catch {}
      }
    });

    const slots: TimeSlot[] = [];
    for (let day = 1; day <= 5; day++) {
      const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
      times.forEach(time => {
        const key = `${day}-${time}`;
        if (!occupied.has(key)) {
          slots.push({
            dayOfWeek: day,
            startTime: time,
            endTime: format(new Date(`2000-01-01T${time}`).getTime() + 45 * 60000, 'HH:mm')
          });
        }
      });
    }
    return slots;
  }, [lessons]);

  const handleResolutionChange = (conflictId: string, resolution: ConflictResolution) => {
    setResolutions(prev => new Map(prev).set(conflictId, resolution));
  };

  const handleApplyResolutions = async () => {
    setResolving(true);
    try {
      await onResolve(Array.from(resolutions.values()));
      onClose();
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
    } finally {
      setResolving(false);
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Schedule Conflicts Detected
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} found in your weekly schedule. 
              Please review and resolve each conflict below.
            </AlertDescription>
          </Alert>

          {conflicts.map((conflict, index) => {
            const conflictId = getConflictId(conflict);
            const resolution = resolutions.get(conflictId);

            return (
              <div 
                key={conflictId} 
                className={`p-4 rounded-lg border ${getSeverityColor(conflict.severity)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <span className="text-sm">Conflict #{index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      conflict.severity === 'high' ? 'bg-red-200' :
                      conflict.severity === 'medium' ? 'bg-yellow-200' : 'bg-blue-200'
                    }`}>
                      {conflict.severity.toUpperCase()}
                    </span>
                  </h3>
                  {resolution && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{conflict.lesson1.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dayNames[conflict.lesson1.timeSlot.dayOfWeek]}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {conflict.lesson1.timeSlot.startTime} - {conflict.lesson1.timeSlot.endTime}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">{conflict.lesson2.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dayNames[conflict.lesson2.timeSlot.dayOfWeek]}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {conflict.lesson2.timeSlot.startTime} - {conflict.lesson2.timeSlot.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={resolution?.action === 'move' ? 'default' : 'outline'}
                    onClick={() => handleResolutionChange(conflictId, {
                      conflictId,
                      action: 'move',
                      targetLesson: conflict.lesson1.id,
                      newTimeSlot: availableTimeSlots[0]
                    })}
                  >
                    Move First
                  </Button>
                  <Button
                    size="sm"
                    variant={resolution?.action === 'swap' ? 'default' : 'outline'}
                    onClick={() => handleResolutionChange(conflictId, {
                      conflictId,
                      action: 'swap',
                      targetLesson: conflict.lesson1.id
                    })}
                  >
                    Swap Times
                  </Button>
                  <Button
                    size="sm"
                    variant={resolution?.action === 'remove' ? 'default' : 'outline'}
                    onClick={() => handleResolutionChange(conflictId, {
                      conflictId,
                      action: 'remove',
                      targetLesson: conflict.lesson1.id
                    })}
                  >
                    Remove from Schedule
                  </Button>
                  <Button
                    size="sm"
                    variant={resolution?.action === 'ignore' ? 'default' : 'outline'}
                    onClick={() => handleResolutionChange(conflictId, {
                      conflictId,
                      action: 'ignore',
                      targetLesson: conflict.lesson1.id
                    })}
                  >
                    Ignore
                  </Button>
                </div>

                {resolution?.action === 'move' && (
                  <div className="mt-3 p-2 bg-background rounded">
                    <label className="text-xs font-medium">Move to:</label>
                    <select 
                      className="w-full mt-1 p-1 text-sm border rounded"
                      value={`${resolution.newTimeSlot?.dayOfWeek}-${resolution.newTimeSlot?.startTime}`}
                      onChange={(e) => {
                        const [day, time] = e.target.value.split('-');
                        const slot = availableTimeSlots.find(
                          s => s.dayOfWeek === parseInt(day) && s.startTime === time
                        );
                        if (slot) {
                          handleResolutionChange(conflictId, { ...resolution, newTimeSlot: slot });
                        }
                      }}
                    >
                      {availableTimeSlots.map(slot => (
                        <option 
                          key={`${slot.dayOfWeek}-${slot.startTime}`}
                          value={`${slot.dayOfWeek}-${slot.startTime}`}
                        >
                          {dayNames[slot.dayOfWeek]} {slot.startTime}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={resolving}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyResolutions}
            disabled={resolutions.size !== conflicts.length || resolving}
          >
            {resolving ? 'Resolving...' : `Apply ${resolutions.size} Resolution${resolutions.size !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}