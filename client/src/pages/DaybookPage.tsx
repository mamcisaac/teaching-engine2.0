import React, { useState, useRef } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { useDaybookEntries, useETFOLessonPlans, useCreateDaybookEntry, useUpdateDaybookEntry } from '../hooks/useETFOPlanning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Calendar, Clock, BookOpen, FileText, Printer, ChevronLeft, ChevronRight, PenTool, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useReactToPrint } from 'react-to-print';

interface DayEntryProps {
  date: Date;
  entry?: any;
  lessons: any[];
  onSave: (data: any) => void;
  isToday: boolean;
}

function DayEntry({ date, entry, lessons, onSave, isToday: isDayToday }: DayEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize all ETFO-aligned fields
  const [formData, setFormData] = useState({
    notes: entry?.notes || '',
    privateNotes: entry?.privateNotes || '',
    whatWorked: entry?.whatWorked || '',
    whatDidntWork: entry?.whatDidntWork || '',
    nextSteps: entry?.nextSteps || '',
    studentEngagement: entry?.studentEngagement || '',
    studentChallenges: entry?.studentChallenges || '',
    studentSuccesses: entry?.studentSuccesses || '',
    overallRating: entry?.overallRating || 3,
    wouldReuseLesson: entry?.wouldReuseLesson ?? true,
  });

  const handleSave = () => {
    onSave({
      date: date.toISOString(),
      ...formData,
      lessonPlanId: lessons.length > 0 ? lessons[0].id : undefined,
    });
    setIsEditing(false);
  };

  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

  return (
    <Card className={`${isDayToday ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {format(date, 'EEEE, MMMM d')}
            </CardTitle>
            {isDayToday && (
              <Badge variant="default" className="mt-1">Today</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
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
            <div className="text-sm text-muted-foreground italic">
              No lessons scheduled
            </div>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-start justify-between p-2 bg-muted rounded-md">
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
                  {lesson.assessmentType && <Badge variant="secondary" className="text-xs">{lesson.assessmentType}</Badge>}
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
              <Label>Overall Day Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant={formData.overallRating === rating ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, overallRating: rating })}
                  >
                    {rating}
                  </Button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {formData.overallRating === 1 && 'Challenging'}
                  {formData.overallRating === 2 && 'Below Expectations'}
                  {formData.overallRating === 3 && 'Satisfactory'}
                  {formData.overallRating === 4 && 'Good'}
                  {formData.overallRating === 5 && 'Excellent'}
                </span>
              </div>
            </div>

            {/* What Worked Well */}
            <div className="space-y-2">
              <Label>What Worked Well?</Label>
              <Textarea
                value={formData.whatWorked}
                onChange={(e) => setFormData({ ...formData, whatWorked: e.target.value })}
                placeholder="Describe successful strategies, activities, or moments..."
                rows={2}
              />
            </div>

            {/* What Didn't Work */}
            <div className="space-y-2">
              <Label>What Could Be Improved?</Label>
              <Textarea
                value={formData.whatDidntWork}
                onChange={(e) => setFormData({ ...formData, whatDidntWork: e.target.value })}
                placeholder="Identify challenges or areas for improvement..."
                rows={2}
              />
            </div>

            {/* Next Steps */}
            <div className="space-y-2">
              <Label>Next Steps</Label>
              <Textarea
                value={formData.nextSteps}
                onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                placeholder="What will you do differently next time? Follow-up needed?"
                rows={2}
              />
            </div>

            {/* Student Observations */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Student Observations</Label>
              
              <div className="space-y-2">
                <Label className="text-sm">Engagement Level</Label>
                <Textarea
                  value={formData.studentEngagement}
                  onChange={(e) => setFormData({ ...formData, studentEngagement: e.target.value })}
                  placeholder="How engaged were students? Note participation patterns..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Challenges Observed</Label>
                <Textarea
                  value={formData.studentChallenges}
                  onChange={(e) => setFormData({ ...formData, studentChallenges: e.target.value })}
                  placeholder="What difficulties did students encounter? Who needs support?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Successes Noted</Label>
                <Textarea
                  value={formData.studentSuccesses}
                  onChange={(e) => setFormData({ ...formData, studentSuccesses: e.target.value })}
                  placeholder="Notable achievements, breakthroughs, or growth observed..."
                  rows={2}
                />
              </div>
            </div>

            {/* General Notes */}
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any other observations, reminders, or reflections..."
                rows={2}
              />
            </div>

            {/* Would Reuse Lesson */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reuseLesson"
                checked={formData.wouldReuseLesson}
                onChange={(e) => setFormData({ ...formData, wouldReuseLesson: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="reuseLesson" className="text-sm font-normal cursor-pointer">
                I would use this lesson plan again
              </Label>
            </div>

            {/* Substitute Notes */}
            <div className="space-y-2">
              <Label>Substitute Teacher Notes</Label>
              <Textarea
                value={formData.privateNotes}
                onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
                placeholder="Important information for a substitute teacher..."
                rows={2}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Display saved reflections */}
            {formData.overallRating && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Day Rating:</span>
                <Badge variant={formData.overallRating >= 4 ? "default" : "secondary"}>
                  {formData.overallRating}/5
                </Badge>
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
            
            {!formData.whatWorked && !formData.whatDidntWork && !formData.nextSteps && (
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
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DaybookPage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printType, setPrintType] = useState<'day' | 'week' | 'substitute'>('week');

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const { data: entries = [], isLoading: entriesLoading } = useDaybookEntries({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useETFOLessonPlans({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  const createMutation = useCreateDaybookEntry();
  const updateMutation = useUpdateDaybookEntry();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Daybook - Week of ${format(weekStart, 'MMM d, yyyy')}`,
  });

  const handleSaveEntry = async (date: Date, data: any) => {
    try {
      const existingEntry = entries.find(e => 
        format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save daybook entry',
        variant: 'destructive',
      });
    }
  };

  const getDayEntry = (date: Date) => {
    return entries.find(e => 
      format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getDayLessons = (date: Date) => {
    return lessons.filter(lesson => 
      format(new Date(lesson.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const generateInsights = () => {
    const totalLessons = lessons.length;
    const totalReflections = entries.filter(e => e.notes).length;
    const assessmentTypes = {
      diagnostic: lessons.filter(l => l.assessmentType === 'diagnostic').length,
      formative: lessons.filter(l => l.assessmentType === 'formative').length,
      summative: lessons.filter(l => l.assessmentType === 'summative').length,
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
        <Button onClick={() => setIsPrintDialogOpen(true)} className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Week of {format(weekStart, 'MMMM d, yyyy')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedWeek(new Date())}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
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
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                No lessons
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Entries */}
      <div className="space-y-4" ref={printRef}>
        {weekDays.map((day) => (
          <DayEntry
            key={day.toISOString()}
            date={day}
            entry={getDayEntry(day)}
            lessons={getDayLessons(day)}
            onSave={(data) => handleSaveEntry(day, data)}
            isToday={isToday(day)}
          />
        ))}
      </div>

      {/* Reflection Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Reflection Prompts</CardTitle>
          <CardDescription>
            Use these prompts to guide your daily and weekly reflections
          </CardDescription>
        </CardHeader>
        <CardContent>
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
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Daybook</DialogTitle>
            <DialogDescription>
              Choose what you'd like to print from your daybook
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={printType} onValueChange={(value: any) => setPrintType(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="substitute">Sub Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="day" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Print today's daybook entry with lessons and reflections
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="week" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Print the entire week's daybook entries
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="substitute" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Generate a substitute-friendly version with clear instructions and notes
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handlePrint();
              setIsPrintDialogOpen(false);
            }}>
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}