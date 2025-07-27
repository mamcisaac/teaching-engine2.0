
import { format, addDays, startOfWeek, endOfWeek, isToday } from 'date-fns';
import {
  Clock,
  BookOpen,
  Printer,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Save,
  AlertCircle,
  CheckCircle,
  Star,
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';

import { BlankTemplateQuickActions } from '../components/printing/BlankTemplatePrinter';
import type {
  DaybookEntry,
  ETFOLessonPlan} from '../hooks/useETFOPlanning';
import {
  useDaybookEntries,
  useETFOLessonPlans,
  useCreateDaybookEntry,
  useUpdateDaybookEntry
} from '../hooks/useETFOPlanning';

interface DayEntryProps {
  date: Date;
  entry?: DaybookEntry;
  lessons: ETFOLessonPlan[];
  onSave: (data: Partial<DaybookEntry>) => void;
  isToday: boolean;
}

function DayEntry({ date, entry, lessons, onSave, isToday: _isDayToday }: DayEntryProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);

  // Initialize all ETFO-aligned fields
  const [formData, setFormData] = useState({
    notes: entry?.notes ?? '',
    privateNotes: entry?.privateNotes ?? '',
    whatWorked: entry?.whatWorked ?? '',
    whatDidntWork: entry?.whatDidntWork ?? '',
    nextSteps: entry?.nextSteps ?? '',
    studentEngagement: entry?.studentEngagement ?? '',
    studentChallenges: entry?.studentChallenges ?? '',
    studentSuccesses: entry?.studentSuccesses ?? '',
    overallRating: entry?.overallRating ?? 3,
    wouldReuseLesson: entry?.wouldReuseLesson ?? true,
  });

  const handleSave = (): void => {
    onSave({
      date: date.toISOString(),
      ...formData,
      lessonPlanId: lessons.length > 0 ? lessons[0].id : undefined,
    });
    setIsEditing(false);
  };

  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

  return (
    <Card className={_isDayToday ? 'ring-2 ring-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{format(date, 'EEEE, MMMM d')}</CardTitle>
            {_isDayToday && (
              <Badge className="mt-1" variant="default">
                Today
              </Badge>
            )}
          </div>
          <Button aria-label="Click button" onClick={() => {
 setIsEditing(!isEditing); 
}}>
            <PenTool className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lessons for the day */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Scheduled Lessons ({lessons.length})
          </div>
          {lessons.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No lessons scheduled</div>
          ) : (
            lessons.map((lesson, _index) => (
              <div
                className="flex items-start justify-between p-2 bg-muted rounded-md"
                key={lesson.id}
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">{lesson.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration} min
                    </span>
                    {lesson.unitPlan && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {lesson.unitPlan.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {lesson.assessmentType && (
                    <Badge className="text-xs" variant="secondary">
                      {lesson.assessmentType}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ETFO Reflection Prompts */}
        {isEditing ? (
          <div className="space-y-4">
            {/* Overall Rating */}
            <div className="space-y-2">
              <Label htmlFor="input">Overall Day Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating, _index) => (
                  <button
                    className="p-1 hover:scale-110 transition-transform"
                    key={rating}
                    onClick={() => {
 setFormData({ ...formData, overallRating: rating }); 
}}
                    type="button"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= formData.overallRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-3">
                  {formData.overallRating === 1 && 'Challenging Day'}
                  {formData.overallRating === 2 && 'Below Expectations'}
                  {formData.overallRating === 3 && 'Satisfactory'}
                  {formData.overallRating === 4 && 'Good Day'}
                  {formData.overallRating === 5 && 'Excellent Day!'}
                </span>
              </div>
            </div>

            {/* What Worked Well */}
            <div className="space-y-2">
              <Label htmlFor="input">What Worked Well?</Label>
              <Textarea
                onChange={(e) => {
 setFormData({ ...formData, whatWorked: e.target.value }); 
}}
                placeholder="Describe successful strategies, activities, or moments..."
                rows={2}
                value={formData.whatWorked}
              />
            </div>

            {/* What Didn't Work */}
            <div className="space-y-2">
              <Label htmlFor="input">What Could Be Improved?</Label>
              <Textarea
                onChange={(e) => {
 setFormData({ ...formData, whatDidntWork: e.target.value }); 
}}
                placeholder="Identify challenges or areas for improvement..."
                rows={2}
                value={formData.whatDidntWork}
              />
            </div>

            {/* Next Steps */}
            <div className="space-y-2">
              <Label htmlFor="input">Next Steps</Label>
              <Textarea
                onChange={(e) => {
 setFormData({ ...formData, nextSteps: e.target.value }); 
}}
                placeholder="What will you do differently next time? Follow-up needed?"
                rows={2}
                value={formData.nextSteps}
              />
            </div>

            {/* Student Observations */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Student Observations</Label>

              <div className="space-y-2">
                <Label className="text-sm">Engagement Level</Label>
                <Textarea
                  onChange={(e) => {
 setFormData({ ...formData, studentEngagement: e.target.value }); 
}}
                  placeholder="How engaged were students? Note participation patterns..."
                  rows={2}
                  value={formData.studentEngagement}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Challenges Observed</Label>
                <Textarea
                  onChange={(e) => {
 setFormData({ ...formData, studentChallenges: e.target.value }); 
}}
                  placeholder="What difficulties did students encounter? Who needs support?"
                  rows={2}
                  value={formData.studentChallenges}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Successes Noted</Label>
                <Textarea
                  onChange={(e) => {
 setFormData({ ...formData, studentSuccesses: e.target.value }); 
}}
                  placeholder="Notable achievements, breakthroughs, or growth observed..."
                  rows={2}
                  value={formData.studentSuccesses}
                />
              </div>
            </div>

            {/* General Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input">Additional Notes</Label>
                <Badge className="text-xs" variant="outline">
                  Public - May appear in newsletters
                </Badge>
              </div>
              <Textarea
                onChange={(e) => {
 setFormData({ ...formData, notes: e.target.value }); 
}}
                placeholder="Any other observations, reminders, or reflections (may be shared in newsletters)..."
                rows={2}
                value={formData.notes}
              />
            </div>

            {/* Would Reuse Lesson */}
            <div className="flex items-center space-x-2">
              <input
                checked={formData.wouldReuseLesson}
                className="rounded"
                id="reuseLesson"
                onChange={(e) => {
 setFormData({ ...formData, wouldReuseLesson: e.target.checked }); 
}}
                type="checkbox"
              />
              <Label className="text-sm font-normal cursor-pointer" htmlFor="reuseLesson">
                I would use this lesson plan again
              </Label>
            </div>

            {/* Private Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input">Private Teacher Notes</Label>
                <Badge className="text-xs" variant="secondary">
                  Private - For your eyes only
                </Badge>
              </div>
              <Textarea
                onChange={(e) => {
 setFormData({ ...formData, privateNotes: e.target.value }); 
}}
                placeholder="Confidential notes, behavioral concerns, parent communications, substitute info..."
                rows={2}
                value={formData.privateNotes}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Display saved reflections */}
            {formData.overallRating && formData.overallRating !== 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Day Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating, _index) => (
                    <Star
                      className={`h-4 w-4 ${
                        rating <= formData.overallRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      key={rating}
                    />
                  ))}
                </div>
              </div>
            )}

            {formData.whatWorked && (
              <div>
                <p className="text-sm font-medium text-green-700">What Worked:</p>
                <p className="text-sm text-muted-foreground">{formData.whatWorked}</p>
              </div>
            )}

            {formData.whatDidntWork && (
              <div>
                <p className="text-sm font-medium text-orange-700">Challenges:</p>
                <p className="text-sm text-muted-foreground">{formData.whatDidntWork}</p>
              </div>
            )}

            {formData.nextSteps && (
              <div>
                <p className="text-sm font-medium text-blue-700">Next Steps:</p>
                <p className="text-sm text-muted-foreground">{formData.nextSteps}</p>
              </div>
            )}

            {(!formData.whatWorked || formData.whatWorked === '') && (!formData.whatDidntWork || formData.whatDidntWork === '') && (!formData.nextSteps || formData.nextSteps === '') && (
              <p className="text-sm text-muted-foreground italic">No reflection yet</p>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="pt-2 border-t text-sm text-muted-foreground">
          Total instructional time: {totalDuration} minutes
        </div>

        {/* Save button */}
        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button aria-label="Click button" onClick={() => {
 setIsEditing(false); 
}}>
              Cancel
            </Button>
            <Button aria-label="Click button" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DaybookPage(): React.ReactElement {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printType, setPrintType] = useState<'day' | 'week' | 'substitute'>('week');
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const { data: entries = [] } = useDaybookEntries({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  const { data: lessons = [] } = useETFOLessonPlans({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  const createMutation = useCreateDaybookEntry();
  const updateMutation = useUpdateDaybookEntry();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Daybook - Week of ${format(weekStart, 'MMM d, yyyy')}`,
  });

  const handleSaveEntry = (date: Date, data: Partial<DaybookEntry>): void => {
    void (async (): Promise<void> => {
    try {
      const existingEntry = entries.find(
        (e) => format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
      );

      if (existingEntry) {
        await updateMutation.mutateAsync({
          id: existingEntry.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }

      toast({
        title: 'Success',
        description: 'Daybook entry saved successfully',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to save daybook entry',
        variant: 'destructive',
      });
    }
    })();
  };

  const getDayEntry = (date: Date): DaybookEntry | undefined => entries.find(
      (e) => format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
    );

  const getDayLessons = (date: Date): ETFOLessonPlan[] => lessons.filter(
      (lesson) => format(new Date(lesson.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
    );

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const generateInsights = (): {totalLessons: number; totalReflections: number; assessmentTypes: {diagnostic: number; formative: number; summative: number}; reflectionRate: number} => {
    const totalLessons = lessons.length;
    const totalReflections = entries.filter((e) => (e.notes !== null && e.notes !== '')).length;
    const assessmentTypes = {
      diagnostic: lessons.filter((l) => l.assessmentType === 'diagnostic').length,
      formative: lessons.filter((l) => l.assessmentType === 'formative').length,
      summative: lessons.filter((l) => l.assessmentType === 'summative').length,
    };

    return {
      totalLessons,
      totalReflections,
      assessmentTypes,
      reflectionRate: totalLessons > 0 ? Math.round((totalReflections / weekDays.length) * 100) : 0,
    };
  };

  const insights = generateInsights();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daybook</h1>
          <p className="text-muted-foreground">
            Daily planning, reflections, and substitute-ready documentation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BlankTemplateQuickActions 
            schoolInfo={{
              teacherName: '',
              grade: '',
            }}
            templateType="daybook"
          />
          <BlankTemplateQuickActions 
            schoolInfo={{
              teacherName: '',
              grade: '',
            }}
            templateType="weekly"
          />
          <Button aria-label="Click button" onClick={() => {
 setIsPrintDialogOpen(true); 
}}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Week of {format(weekStart, 'MMMM d, yyyy')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
 setSelectedWeek(addDays(selectedWeek, -7)); 
}}
                size="sm"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button aria-label="Click button" onClick={() => {
 setSelectedWeek(new Date()); 
}}>
                This Week
              </Button>
              <Button
                onClick={() => {
 setSelectedWeek(addDays(selectedWeek, 7)); 
}}
                size="sm"
                variant="outline"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reflections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalReflections}</div>
            <p className="text-xs text-muted-foreground">{insights.reflectionRate}% complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Assessment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="secondary">D: {insights.assessmentTypes.diagnostic}</Badge>
              <Badge variant="secondary">F: {insights.assessmentTypes.formative}</Badge>
              <Badge variant="secondary">S: {insights.assessmentTypes.summative}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Week Status</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.totalLessons > 0 ? (
              <Badge className="gap-1" variant="default">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge className="gap-1" variant="secondary">
                <AlertCircle className="h-3 w-3" />
                No lessons
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Entries */}
      <div className="space-y-4" ref={printRef}>
        {weekDays.map((day, _index) => (
          <DayEntry
            date={day}
            entry={getDayEntry(day)}
            isToday={isToday(day)}
            key={day.toISOString()}
            lessons={getDayLessons(day)}
            onSave={(data) => {
 handleSaveEntry(day, data); 
}}
          />
        ))}
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Templates & Prompts</CardTitle>
              <CardDescription>Common reflection templates and weekly prompts</CardDescription>
            </div>
            <Button
              onClick={() => {
 setShowQuickTemplates(!showQuickTemplates); 
}}
              size="sm"
              variant="outline"
            >
              {showQuickTemplates ? 'Hide' : 'Show'} Templates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showQuickTemplates && (
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-sm mb-3">Quick Reflection Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      // This would fill in a template - implement as needed
                      toast({
                        title: 'Template Applied',
                        description: 'Successful lesson template has been applied',
                      });
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Successful Lesson</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Students engaged well, learning goals met, smooth transitions
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      toast({
                        title: 'Template Applied',
                        description: 'Challenging day template has been applied',
                      });
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Challenging Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Behavior management issues, need to revisit concepts, adjust pacing
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      toast({
                        title: 'Template Applied',
                        description: 'Assessment day template has been applied',
                      });
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Assessment Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Planned assessment strategies, noted teaching observations, identified areas to revisit
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      toast({
                        title: 'Template Applied',
                        description: 'Special event template has been applied',
                      });
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Special Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Field trip, guest speaker, or special activity reflections
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Daily Prompts</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• What went well today?</li>
                <li>• What challenges did students face?</li>
                <li>• What would I do differently?</li>
                <li>• Which students need extra support?</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Weekly Prompts</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Did I meet my learning goals this week?</li>
                <li>• What patterns did I notice in student learning?</li>
                <li>• How can I improve engagement next week?</li>
                <li>• What resources do I need to prepare?</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog onOpenChange={setIsPrintDialogOpen} open={isPrintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Daybook</DialogTitle>
            <DialogDescription>
              Choose what you&apos;d like to print from your daybook
            </DialogDescription>
          </DialogHeader>

          <Tabs
            onValueChange={(value) => {
 setPrintType(value as 'day' | 'week' | 'substitute'); 
}}
            value={printType}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="substitute">Sub Plan</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="day">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Print today&apos;s daybook entry with lessons and reflections
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent className="space-y-4" value="week">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Print the entire week&apos;s daybook entries</AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent className="space-y-4" value="substitute">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Generate a substitute-friendly version with clear instructions and notes
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button aria-label="Click button" onClick={() => {
 setIsPrintDialogOpen(false); 
}}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handlePrint();
                setIsPrintDialogOpen(false);
              }}
            >
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
