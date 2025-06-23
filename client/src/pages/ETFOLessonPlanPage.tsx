import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, startOfWeek } from 'date-fns';
import { useETFOLessonPlans, useUnitPlans, useCurriculumExpectations, useCreateETFOLessonPlan, useUpdateETFOLessonPlan, useDeleteETFOLessonPlan } from '../hooks/useETFOPlanning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, BookOpen, Users, Target, CheckCircle, FileText, Printer, Sparkles, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LessonFormData {
  title: string;
  date: Date;
  duration: number;
  unitPlanId: string;
  mindsOnDescription: string;
  mindsOnDuration: number;
  actionDescription: string;
  actionDuration: number;
  consolidationDescription: string;
  consolidationDuration: number;
  learningGoals: string[];
  successCriteria: string[];
  resources: string[];
  accommodations: string;
  assessmentFor: boolean;
  assessmentAs: boolean;
  assessmentOf: boolean;
  reflection?: string;
  isSubFriendly: boolean;
  subNotes?: string;
  curriculumExpectationIds: string[];
}

export default function ETFOLessonPlanPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    date: new Date(),
    duration: 45,
    unitPlanId: unitId || '',
    mindsOnDescription: '',
    mindsOnDuration: 10,
    actionDescription: '',
    actionDuration: 25,
    consolidationDescription: '',
    consolidationDuration: 10,
    learningGoals: [''],
    successCriteria: [''],
    resources: [''],
    accommodations: '',
    assessmentFor: false,
    assessmentAs: false,
    assessmentOf: false,
    reflection: '',
    isSubFriendly: false,
    subNotes: '',
    curriculumExpectationIds: [],
  });

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 4); // Monday to Friday

  const { data: lessons = [], isLoading: lessonsLoading } = useETFOLessonPlans({
    unitPlanId: unitId,
    startDate: weekStart,
    endDate: weekEnd,
  });

  const { data: unitPlans = [] } = useUnitPlans();
  const { data: expectations = [] } = useCurriculumExpectations();
  
  const createMutation = useCreateETFOLessonPlan();
  const updateMutation = useUpdateETFOLessonPlan();
  const deleteMutation = useDeleteETFOLessonPlan();

  const currentUnit = unitPlans.find(u => u.id === unitId);

  const handleCreateLesson = () => {
    setFormData({
      ...formData,
      unitPlanId: unitId || '',
      curriculumExpectationIds: currentUnit?.curriculumExpectationIds || [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      date: new Date(lesson.date),
      duration: lesson.duration,
      unitPlanId: lesson.unitPlanId,
      mindsOnDescription: lesson.mindsOnDescription || '',
      mindsOnDuration: lesson.mindsOnDuration || 10,
      actionDescription: lesson.actionDescription || '',
      actionDuration: lesson.actionDuration || 25,
      consolidationDescription: lesson.consolidationDescription || '',
      consolidationDuration: lesson.consolidationDuration || 10,
      learningGoals: lesson.learningGoals || [''],
      successCriteria: lesson.successCriteria || [''],
      resources: lesson.resources || [''],
      accommodations: lesson.accommodations || '',
      assessmentFor: lesson.assessmentFor || false,
      assessmentAs: lesson.assessmentAs || false,
      assessmentOf: lesson.assessmentOf || false,
      reflection: lesson.reflection || '',
      isSubFriendly: lesson.isSubFriendly || false,
      subNotes: lesson.subNotes || '',
      curriculumExpectationIds: lesson.curriculumExpectationIds || [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const lessonData = {
        ...formData,
        date: formData.date.toISOString(),
      };

      if (editingLesson) {
        await updateMutation.mutateAsync({
          id: editingLesson.id,
          data: lessonData,
        });
        toast({
          title: 'Success',
          description: 'Lesson plan updated successfully',
        });
      } else {
        await createMutation.mutateAsync(lessonData);
        toast({
          title: 'Success',
          description: 'Lesson plan created successfully',
        });
      }

      setIsCreateDialogOpen(false);
      setEditingLesson(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save lesson plan',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Lesson plan deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lesson plan',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date(),
      duration: 45,
      unitPlanId: unitId || '',
      mindsOnDescription: '',
      mindsOnDuration: 10,
      actionDescription: '',
      actionDuration: 25,
      consolidationDescription: '',
      consolidationDuration: 10,
      learningGoals: [''],
      successCriteria: [''],
      resources: [''],
      accommodations: '',
      assessmentFor: false,
      assessmentAs: false,
      assessmentOf: false,
      reflection: '',
      isSubFriendly: false,
      subNotes: '',
      curriculumExpectationIds: [],
    });
  };

  const addArrayItem = (field: 'learningGoals' | 'successCriteria' | 'resources') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const updateArrayItem = (field: 'learningGoals' | 'successCriteria' | 'resources', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({
      ...formData,
      [field]: updated,
    });
  };

  const removeArrayItem = (field: 'learningGoals' | 'successCriteria' | 'resources', index: number) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [field]: updated.length > 0 ? updated : [''],
    });
  };

  const getDayLessons = (date: Date) => {
    return lessons.filter(lesson => 
      format(new Date(lesson.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lesson Plans</h1>
          <p className="text-muted-foreground">
            Plan your daily lessons using the ETFO three-part structure
          </p>
          {currentUnit && (
            <Badge variant="outline" className="mt-2">
              Unit: {currentUnit.title}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
          <Button onClick={handleCreateLesson} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Lesson
          </Button>
        </div>
      </div>

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
                Previous Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(new Date())}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
              >
                Next Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {weekDays.map((day) => {
              const dayLessons = getDayLessons(day);
              return (
                <div key={day.toISOString()} className="space-y-2">
                  <div className="font-semibold text-sm text-muted-foreground">
                    {format(day, 'EEEE')}
                  </div>
                  <div className="text-lg font-medium">
                    {format(day, 'MMM d')}
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {dayLessons.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No lessons planned
                      </div>
                    ) : (
                      dayLessons.map((lesson) => (
                        <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="font-medium text-sm">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration} min
                                </div>
                                <div className="flex gap-1 mt-2">
                                  {lesson.assessmentFor && (
                                    <Badge variant="secondary" className="text-xs">For</Badge>
                                  )}
                                  {lesson.assessmentAs && (
                                    <Badge variant="secondary" className="text-xs">As</Badge>
                                  )}
                                  {lesson.assessmentOf && (
                                    <Badge variant="secondary" className="text-xs">Of</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEditLesson(lesson)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDelete(lesson.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
            </DialogTitle>
            <DialogDescription>
              Plan your lesson using the ETFO three-part structure: Minds On, Action, and Consolidation
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="structure">Lesson Structure</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lesson Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter lesson title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Plan</Label>
                  <Select
                    value={formData.unitPlanId}
                    onValueChange={(value) => setFormData({ ...formData, unitPlanId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitPlans.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={format(formData.date, 'yyyy-MM-dd')}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Learning Goals</Label>
                {formData.learningGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateArrayItem('learningGoals', index, e.target.value)}
                      placeholder={`Learning goal ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('learningGoals', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('learningGoals')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Learning Goal
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Success Criteria</Label>
                {formData.successCriteria.map((criteria, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={criteria}
                      onChange={(e) => updateArrayItem('successCriteria', index, e.target.value)}
                      placeholder={`Success criteria ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('successCriteria', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('successCriteria')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Success Criteria
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The three-part lesson structure helps engage students and consolidate learning effectively.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Minds On</CardTitle>
                    <CardDescription>
                      Hook students' interest and activate prior knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={formData.mindsOnDuration}
                        onChange={(e) => setFormData({ ...formData, mindsOnDuration: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.mindsOnDescription}
                        onChange={(e) => setFormData({ ...formData, mindsOnDescription: e.target.value })}
                        placeholder="Describe the opening activity..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Action</CardTitle>
                    <CardDescription>
                      Main learning activities and student exploration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={formData.actionDuration}
                        onChange={(e) => setFormData({ ...formData, actionDuration: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.actionDescription}
                        onChange={(e) => setFormData({ ...formData, actionDescription: e.target.value })}
                        placeholder="Describe the main activities..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Consolidation</CardTitle>
                    <CardDescription>
                      Reflect on learning and make connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={formData.consolidationDuration}
                        onChange={(e) => setFormData({ ...formData, consolidationDuration: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.consolidationDescription}
                        onChange={(e) => setFormData({ ...formData, consolidationDescription: e.target.value })}
                        placeholder="Describe the closing activity..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Assessment Types</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select the types of assessment used in this lesson
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assessmentFor"
                        checked={formData.assessmentFor}
                        onCheckedChange={(checked) => setFormData({ ...formData, assessmentFor: checked as boolean })}
                      />
                      <Label htmlFor="assessmentFor" className="font-normal">
                        Assessment FOR Learning (Diagnostic)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assessmentAs"
                        checked={formData.assessmentAs}
                        onCheckedChange={(checked) => setFormData({ ...formData, assessmentAs: checked as boolean })}
                      />
                      <Label htmlFor="assessmentAs" className="font-normal">
                        Assessment AS Learning (Formative)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assessmentOf"
                        checked={formData.assessmentOf}
                        onCheckedChange={(checked) => setFormData({ ...formData, assessmentOf: checked as boolean })}
                      />
                      <Label htmlFor="assessmentOf" className="font-normal">
                        Assessment OF Learning (Summative)
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Accommodations & Modifications</Label>
                  <Textarea
                    value={formData.accommodations}
                    onChange={(e) => setFormData({ ...formData, accommodations: e.target.value })}
                    placeholder="Describe any accommodations or modifications for diverse learners..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Teacher Reflection (Post-Lesson)</Label>
                  <Textarea
                    value={formData.reflection}
                    onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                    placeholder="To be completed after teaching the lesson..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="space-y-2">
                <Label>Resources & Materials</Label>
                {formData.resources.map((resource, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={resource}
                      onChange={(e) => updateArrayItem('resources', index, e.target.value)}
                      placeholder={`Resource ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('resources', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('resources')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSubFriendly"
                    checked={formData.isSubFriendly}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSubFriendly: checked as boolean })}
                  />
                  <Label htmlFor="isSubFriendly">
                    This lesson is substitute-friendly
                  </Label>
                </div>

                {formData.isSubFriendly && (
                  <div className="space-y-2">
                    <Label>Substitute Teacher Notes</Label>
                    <Textarea
                      value={formData.subNotes}
                      onChange={(e) => setFormData({ ...formData, subNotes: e.target.value })}
                      placeholder="Provide clear instructions for a substitute teacher..."
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingLesson ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}