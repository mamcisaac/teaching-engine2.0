import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useUnitPlan,
  useETFOLessonPlans,
  useETFOLessonPlan,
  useCreateETFOLessonPlan,
  useUpdateETFOLessonPlan,
  useDeleteETFOLessonPlan,
} from '../hooks/useETFOPlanning';
import Dialog from '../components/Dialog';
import { Button } from '../components/ui/Button';
import RichTextEditor from '../components/RichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Trash2, Clock, Calendar, BookOpen, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '../components/ui/Checkbox';
import { Badge } from '../components/ui/Badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import ExpectationSelector from '../components/planning/ExpectationSelector';

export default function ETFOLessonPlanPage() {
  const { unitId, lessonId } = useParams();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch data
  const { data: unitPlan } = useUnitPlan(unitId || '');
  const { data: lessonPlans = [], isLoading: isLoadingLessons } = useETFOLessonPlans(
    unitId ? { unitPlanId: unitId } : {},
  );
  const { data: selectedLesson } = useETFOLessonPlan(lessonId || '');

  // Mutations
  const createLesson = useCreateETFOLessonPlan();
  const updateLesson = useUpdateETFOLessonPlan();
  const deleteLesson = useDeleteETFOLessonPlan();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    titleFr: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    mindsOn: '',
    mindsOnFr: '',
    action: '',
    actionFr: '',
    consolidation: '',
    consolidationFr: '',
    learningGoals: '',
    learningGoalsFr: '',
    materials: [''],
    grouping: 'whole',
    accommodations: [''],
    modifications: [''],
    extensions: [''],
    assessmentType: 'formative' as 'diagnostic' | 'formative' | 'summative',
    assessmentNotes: '',
    isSubFriendly: false,
    subNotes: '',
    expectationIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedData = {
      ...formData,
      unitPlanId: unitId || '',
      materials: formData.materials.filter((m) => m.trim()),
      accommodations: formData.accommodations.filter((a) => a.trim()),
      modifications: formData.modifications.filter((m) => m.trim()),
      extensions: formData.extensions.filter((e) => e.trim()),
    };

    if (editingLesson) {
      await updateLesson.mutateAsync({ id: editingLesson, data: cleanedData });
      setEditingLesson(null);
    } else {
      await createLesson.mutateAsync(cleanedData);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleFr: '',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      mindsOn: '',
      mindsOnFr: '',
      action: '',
      actionFr: '',
      consolidation: '',
      consolidationFr: '',
      learningGoals: '',
      learningGoalsFr: '',
      materials: [''],
      grouping: 'whole',
      accommodations: [''],
      modifications: [''],
      extensions: [''],
      assessmentType: 'formative',
      assessmentNotes: '',
      isSubFriendly: false,
      subNotes: '',
      expectationIds: [],
    });
  };

  const handleDelete = async (id: string) => {
    await deleteLesson.mutateAsync(id);
    setDeleteConfirmId(null);
    if (lessonId === id) {
      navigate(`/planner/units/${unitId}/lessons`);
    }
  };

  const addMaterial = () => {
    setFormData({ ...formData, materials: [...formData.materials, ''] });
  };

  const updateMaterial = (index: number, value: string) => {
    const updated = [...formData.materials];
    updated[index] = value;
    setFormData({ ...formData, materials: updated });
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index),
    });
  };

  const addAccommodation = () => {
    setFormData({ ...formData, accommodations: [...formData.accommodations, ''] });
  };

  const updateAccommodation = (index: number, value: string) => {
    const updated = [...formData.accommodations];
    updated[index] = value;
    setFormData({ ...formData, accommodations: updated });
  };

  const removeAccommodation = (index: number) => {
    setFormData({
      ...formData,
      accommodations: formData.accommodations.filter((_, i) => i !== index),
    });
  };

  const addModification = () => {
    setFormData({ ...formData, modifications: [...formData.modifications, ''] });
  };

  const updateModification = (index: number, value: string) => {
    const updated = [...formData.modifications];
    updated[index] = value;
    setFormData({ ...formData, modifications: updated });
  };

  const removeModification = (index: number) => {
    setFormData({
      ...formData,
      modifications: formData.modifications.filter((_, i) => i !== index),
    });
  };

  const addExtension = () => {
    setFormData({ ...formData, extensions: [...formData.extensions, ''] });
  };

  const updateExtension = (index: number, value: string) => {
    const updated = [...formData.extensions];
    updated[index] = value;
    setFormData({ ...formData, extensions: updated });
  };

  const removeExtension = (index: number) => {
    setFormData({
      ...formData,
      extensions: formData.extensions.filter((_, i) => i !== index),
    });
  };

  // If we're in detail mode (lessonId provided), show the detail view
  if (lessonId && selectedLesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link to="/planner/long-range" className="hover:text-indigo-600">
            Long-Range Plans
          </Link>
          <span>›</span>
          <Link to="/planner/units" className="hover:text-indigo-600">
            Unit Plans
          </Link>
          {unitPlan && (
            <>
              <span>›</span>
              <Link to={`/planner/units/${unitId}`} className="hover:text-indigo-600">
                {unitPlan.title}
              </Link>
            </>
          )}
          <span>›</span>
          <Link to={`/planner/units/${unitId}/lessons`} className="hover:text-indigo-600">
            Lessons
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{selectedLesson.title}</span>
        </div>

        {/* Lesson Detail View */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h1>
                {selectedLesson.titleFr && (
                  <p className="text-sm text-gray-600 mt-1">{selectedLesson.titleFr}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedLesson.date), 'MMMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedLesson.duration} minutes
                  </span>
                  {selectedLesson.isSubFriendly && <Badge variant="secondary">Sub-Friendly</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingLesson(selectedLesson.id);
                    setFormData({
                      title: selectedLesson.title,
                      titleFr: selectedLesson.titleFr || '',
                      date: selectedLesson.date.split('T')[0],
                      duration: selectedLesson.duration,
                      mindsOn: selectedLesson.mindsOn || '',
                      mindsOnFr: selectedLesson.mindsOnFr || '',
                      action: selectedLesson.action || '',
                      actionFr: selectedLesson.actionFr || '',
                      consolidation: selectedLesson.consolidation || '',
                      consolidationFr: selectedLesson.consolidationFr || '',
                      learningGoals: selectedLesson.learningGoals || '',
                      learningGoalsFr: selectedLesson.learningGoalsFr || '',
                      materials: selectedLesson.materials || [''],
                      grouping: selectedLesson.grouping || 'whole',
                      accommodations: selectedLesson.accommodations || [''],
                      modifications: selectedLesson.modifications || [''],
                      extensions: selectedLesson.extensions || [''],
                      assessmentType: selectedLesson.assessmentType || 'formative',
                      assessmentNotes: selectedLesson.assessmentNotes || '',
                      isSubFriendly: selectedLesson.isSubFriendly,
                      subNotes: selectedLesson.subNotes || '',
                      expectationIds:
                        selectedLesson.expectations?.map((e) => e.expectation.id) || [],
                    });
                    setIsCreateModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                {selectedLesson.daybookEntry ? (
                  <Link to={`/planner/daybook?date=${selectedLesson.date}`}>
                    <Button variant="outline">View in Daybook</Button>
                  </Link>
                ) : (
                  <Link
                    to={`/planner/daybook?date=${selectedLesson.date}&lessonPlanId=${selectedLesson.id}`}
                  >
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Create Daybook Entry
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Three-Part Lesson Structure */}
          <div className="p-6 space-y-6">
            {selectedLesson.learningGoals && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Goals</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.learningGoals }}
                />
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Minds On</CardTitle>
                  <CardDescription>Activating prior knowledge</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedLesson.mindsOn ? (
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.mindsOn }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">No content provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Action</CardTitle>
                  <CardDescription>Main learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedLesson.action ? (
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.action }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">No content provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Consolidation</CardTitle>
                  <CardDescription>Summarizing and reflection</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedLesson.consolidation ? (
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.consolidation }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">No content provided</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Materials and Resources */}
            {selectedLesson.materials && selectedLesson.materials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials Needed</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedLesson.materials.map((material, index) => (
                    <li key={index} className="text-gray-700">
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assessment */}
            {(selectedLesson.assessmentType || selectedLesson.assessmentNotes) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment</h3>
                {selectedLesson.assessmentType && (
                  <Badge className="mb-2">{selectedLesson.assessmentType}</Badge>
                )}
                {selectedLesson.assessmentNotes && (
                  <p className="text-gray-700 mt-2">{selectedLesson.assessmentNotes}</p>
                )}
              </div>
            )}

            {/* Differentiation */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedLesson.accommodations && selectedLesson.accommodations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Accommodations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedLesson.accommodations.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLesson.modifications && selectedLesson.modifications.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modifications</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedLesson.modifications.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLesson.extensions && selectedLesson.extensions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Extensions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedLesson.extensions.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sub Notes */}
            {selectedLesson.isSubFriendly && selectedLesson.subNotes && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-base">Substitute Teacher Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{selectedLesson.subNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Curriculum Expectations */}
            {selectedLesson.expectations && selectedLesson.expectations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Curriculum Expectations
                </h3>
                <div className="space-y-2">
                  {selectedLesson.expectations.map(({ expectation }) => (
                    <div key={expectation.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-sm">{expectation.code}</span>
                          <p className="text-sm text-gray-700 mt-1">{expectation.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {expectation.strand}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view when showing all lessons for a unit
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link to="/planner/long-range" className="hover:text-indigo-600">
            Long-Range Plans
          </Link>
          <span>›</span>
          <Link to="/planner/units" className="hover:text-indigo-600">
            Unit Plans
          </Link>
          {unitPlan && (
            <>
              <span>›</span>
              <Link to={`/planner/units/${unitId}`} className="hover:text-indigo-600">
                {unitPlan.title}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-gray-900 font-medium">Lesson Plans</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lesson Plans</h1>
            {unitPlan && (
              <p className="mt-2 text-gray-600">
                {unitPlan.title} • {format(new Date(unitPlan.startDate), 'MMM d')} -{' '}
                {format(new Date(unitPlan.endDate), 'MMM d, yyyy')}
              </p>
            )}
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Create Lesson Plan
          </Button>
        </div>
      </div>

      {/* Lesson Plans List */}
      {isLoadingLessons ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : lessonPlans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No lesson plans yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Start by creating your first lesson plan for this unit
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create Lesson Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessonPlans.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(lesson.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/planner/lessons/${lesson.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      {lesson.title}
                    </Link>
                    {lesson.isSubFriendly && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Sub-Friendly
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lesson.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lesson.assessmentType && (
                      <Badge variant="outline" className="text-xs">
                        {lesson.assessmentType}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lesson.daybookEntry ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Taught
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Planned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingLesson(lesson.id);
                          setFormData({
                            title: lesson.title,
                            titleFr: lesson.titleFr || '',
                            date: lesson.date.split('T')[0],
                            duration: lesson.duration,
                            mindsOn: lesson.mindsOn || '',
                            mindsOnFr: lesson.mindsOnFr || '',
                            action: lesson.action || '',
                            actionFr: lesson.actionFr || '',
                            consolidation: lesson.consolidation || '',
                            consolidationFr: lesson.consolidationFr || '',
                            learningGoals: lesson.learningGoals || '',
                            learningGoalsFr: lesson.learningGoalsFr || '',
                            materials: lesson.materials || [''],
                            grouping: lesson.grouping || 'whole',
                            accommodations: lesson.accommodations || [''],
                            modifications: lesson.modifications || [''],
                            extensions: lesson.extensions || [''],
                            assessmentType: lesson.assessmentType || 'formative',
                            assessmentNotes: lesson.assessmentNotes || '',
                            isSubFriendly: lesson.isSubFriendly,
                            subNotes: lesson.subNotes || '',
                            expectationIds: lesson.expectations?.map((e) => e.expectation.id) || [],
                          });
                          setIsCreateModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(lesson.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Lesson Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <div className="p-6 max-w-5xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {editingLesson ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
          </h3>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="three-part">Three-Part Lesson</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="differentiation">Differentiation</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lesson Title *</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Introduction to Ecosystems"
                    />
                  </div>
                  <div>
                    <Label>Title (French)</Label>
                    <Input
                      value={formData.titleFr}
                      onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                      placeholder="e.g., Introduction aux écosystèmes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes) *</Label>
                    <Input
                      type="number"
                      required
                      min="15"
                      max="300"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Grouping</Label>
                    <select
                      value={formData.grouping}
                      onChange={(e) => setFormData({ ...formData, grouping: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="whole">Whole Class</option>
                      <option value="small">Small Groups</option>
                      <option value="pairs">Pairs</option>
                      <option value="individual">Individual</option>
                      <option value="mixed">Mixed Groupings</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Learning Goals</Label>
                  <RichTextEditor
                    value={formData.learningGoals}
                    onChange={(value) => setFormData({ ...formData, learningGoals: value })}
                  />
                </div>

                <div>
                  <Label>Learning Goals (French)</Label>
                  <RichTextEditor
                    value={formData.learningGoalsFr}
                    onChange={(value) => setFormData({ ...formData, learningGoalsFr: value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subFriendly"
                    checked={formData.isSubFriendly}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isSubFriendly: checked as boolean })
                    }
                  />
                  <Label htmlFor="subFriendly" className="font-normal">
                    This lesson is substitute teacher friendly
                  </Label>
                </div>

                {formData.isSubFriendly && (
                  <div>
                    <Label>Substitute Teacher Notes</Label>
                    <Textarea
                      value={formData.subNotes}
                      onChange={(e) => setFormData({ ...formData, subNotes: e.target.value })}
                      placeholder="Special instructions for substitute teachers..."
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <ExpectationSelector
                    selectedIds={formData.expectationIds}
                    onChange={(ids) => setFormData({ ...formData, expectationIds: ids })}
                    grade={unitPlan?.longRangePlan?.grade}
                    subject={unitPlan?.longRangePlan?.subject}
                    label="Curriculum Expectations"
                    placeholder="Select curriculum expectations for this lesson..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="three-part" className="space-y-6 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Minds On</CardTitle>
                    <CardDescription>
                      Hook and activate prior knowledge (typically 10-15% of lesson time)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Activities (English)</Label>
                      <RichTextEditor
                        value={formData.mindsOn}
                        onChange={(value) => setFormData({ ...formData, mindsOn: value })}
                      />
                    </div>
                    <div>
                      <Label>Activities (French)</Label>
                      <RichTextEditor
                        value={formData.mindsOnFr}
                        onChange={(value) => setFormData({ ...formData, mindsOnFr: value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Action</CardTitle>
                    <CardDescription>
                      Main learning activities and exploration (typically 60-70% of lesson time)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Activities (English)</Label>
                      <RichTextEditor
                        value={formData.action}
                        onChange={(value) => setFormData({ ...formData, action: value })}
                      />
                    </div>
                    <div>
                      <Label>Activities (French)</Label>
                      <RichTextEditor
                        value={formData.actionFr}
                        onChange={(value) => setFormData({ ...formData, actionFr: value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Consolidation</CardTitle>
                    <CardDescription>
                      Summarize, reflect, and assess understanding (typically 20% of lesson time)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Activities (English)</Label>
                      <RichTextEditor
                        value={formData.consolidation}
                        onChange={(value) => setFormData({ ...formData, consolidation: value })}
                      />
                    </div>
                    <div>
                      <Label>Activities (French)</Label>
                      <RichTextEditor
                        value={formData.consolidationFr}
                        onChange={(value) => setFormData({ ...formData, consolidationFr: value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4 mt-4">
                <div>
                  <Label>Materials and Resources</Label>
                  <div className="space-y-2 mt-2">
                    {formData.materials.map((material, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={material}
                          onChange={(e) => updateMaterial(index, e.target.value)}
                          placeholder="e.g., Chart paper, markers, science textbook p.45-48"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterial(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMaterial}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="differentiation" className="space-y-6 mt-4">
                <div>
                  <Label>Accommodations</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Supports for students to access the curriculum
                  </p>
                  <div className="space-y-2">
                    {formData.accommodations.map((accommodation, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={accommodation}
                          onChange={(e) => updateAccommodation(index, e.target.value)}
                          placeholder="e.g., Provide visual aids, allow extra time"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAccommodation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAccommodation}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Accommodation
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Modifications</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Changes to curriculum expectations for individual students
                  </p>
                  <div className="space-y-2">
                    {formData.modifications.map((modification, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={modification}
                          onChange={(e) => updateModification(index, e.target.value)}
                          placeholder="e.g., Simplified text, reduced number of questions"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeModification(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addModification}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Modification
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Extensions</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Enrichment activities for students who finish early
                  </p>
                  <div className="space-y-2">
                    {formData.extensions.map((extension, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={extension}
                          onChange={(e) => updateExtension(index, e.target.value)}
                          placeholder="e.g., Research project, advanced problems"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExtension(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExtension}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Extension
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assessment" className="space-y-4 mt-4">
                <div>
                  <Label>Assessment Type</Label>
                  <select
                    value={formData.assessmentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assessmentType: e.target.value as 'diagnostic' | 'formative' | 'summative',
                      })
                    }
                    className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="diagnostic">Diagnostic (Assessment FOR Learning)</option>
                    <option value="formative">Formative (Assessment AS Learning)</option>
                    <option value="summative">Summative (Assessment OF Learning)</option>
                  </select>
                </div>

                <div>
                  <Label>Assessment Notes</Label>
                  <Textarea
                    value={formData.assessmentNotes}
                    onChange={(e) => setFormData({ ...formData, assessmentNotes: e.target.value })}
                    placeholder="Describe assessment strategies, success criteria, and evaluation methods..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingLesson(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLesson.isPending || updateLesson.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {createLesson.isPending || updateLesson.isPending
                  ? 'Saving...'
                  : editingLesson
                    ? 'Update Lesson Plan'
                    : 'Create Lesson Plan'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lesson plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
