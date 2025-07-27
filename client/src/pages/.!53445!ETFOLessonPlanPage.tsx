
import { format } from 'date-fns';
import {
  Plus,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle,
  Sparkles,
  Printer,
  Download,
  Save,
  RefreshCw,
  BookTemplate,
} from 'lucide-react';
import { useState, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { Dialog } from '../components/Dialog';
import { ExpectationSelector } from '../components/planning/ExpectationSelector';
import { BlankTemplateQuickActions } from '../components/printing/BlankTemplatePrinter';
import { RichTextEditor } from '../components/RichTextEditor';
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
import { AutoSaveIndicator } from '../components/ui/AutoSaveIndicator';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { MobileOptimizedForm, CollapsibleSection } from '../components/ui/MobileOptimizedForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/Textarea';
import { InfoTooltip } from '../components/ui/Tooltip';
import { useAutoSave, useUnsavedChangesWarning } from '../hooks/useAutoSave';
import {
  useUnitPlan,
  useETFOLessonPlans,
  useETFOLessonPlan,
  useCreateETFOLessonPlan,
  useUpdateETFOLessonPlan,
  useDeleteETFOLessonPlan,
} from '../hooks/useETFOPlanning';
import { useTemplates, useApplyTemplate } from '../hooks/useTemplates';
import type { PlanTemplate, LessonPlanContent } from '../types/template';
import { isLessonPlanTemplate } from '../types/template';
import { logger } from '../utils/logger';
import { generateLessonPlanHTML, printHTML, downloadHTML } from '../utils/printUtils';
import { SafeHtmlRenderer } from '../utils/sanitization';

// Lazy load AI components for better performance
const AILessonPlanPanel = lazy(() =>
  import('../components/ai/AILessonPlanPanel').then((m) => ({ default: m.AILessonPlanPanel })),
);
const WithAIErrorBoundary = lazy(() =>
  import('../components/ai/AIErrorBoundary').then((m) => ({ default: m.WithAIErrorBoundary })),
);
export default function ETFOLessonPlanPage(): React.ReactElement {
  const { unitId, lessonId } = useParams();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);

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

  // Template-related hooks
  const { data: lessonTemplatesResult } = useTemplates({
    type: 'LESSON_PLAN',
    subject: unitPlan?.longRangePlan?.subject,
    gradeMin: unitPlan?.longRangePlan?.grade,
    gradeMax: unitPlan?.longRangePlan?.grade,
    limit: 20,
  });
  const applyTemplate = useApplyTemplate();

  const lessonTemplates = lessonTemplatesResult?.templates ?? [];

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

  // Auto-save functionality for existing lessons
  const autoSaveData = editingLesson
    ? {
        ...formData,
        expectationIds: formData.expectationIds,
      }
    : null;

  const { lastSaved, isSaving, hasUnsavedChanges, saveNow } = useAutoSave({
    data: autoSaveData,
    saveFn: async (data) => {
      if (editingLesson && data) {
        const cleanedData = {
          ...data,
          unitPlanId: unitId || '',
          materials: data.materials.filter((m: string) => m.trim()),
          accommodations: data.accommodations.filter((a: string) => a.trim()),
          modifications: data.modifications.filter((m: string) => m.trim()),
          extensions: data.extensions.filter((e: string) => e.trim()),
        };
        await updateLesson.mutateAsync({ id: editingLesson, data: cleanedData });
      }
    },
    enabled: !!editingLesson && !!autoSaveData,
    delay: 30000, // 30 seconds
  });

  useUnsavedChangesWarning(hasUnsavedChanges);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const cleanedData = {
      ...formData,
      unitPlanId: unitId || '',
      materials: formData.materials.filter((m) => m.trim()),
      accommodations: formData.accommodations.filter((a) => a.trim()),
      modifications: formData.modifications.filter((m) => m.trim()),
      extensions: formData.extensions.filter((e) => e.trim()),
    };

    if (!editingLesson= null) {
      await updateLesson.mutateAsync({ id: editingLesson, data: cleanedData });
      setEditingLesson(null);
    } else {
      await createLesson.mutateAsync(cleanedData);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = (): void => {
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

  const handleDelete = async (id: string): Promise<void> => {
    await deleteLesson.mutateAsync(id);
    setDeleteConfirmId(null);
    if (lessonId === id) {
      navigate(`/planner/units/${unitId}/lessons`);
    }
  };

  const addMaterial = (): void => {
    setFormData({ ...formData, materials: [...formData.materials, ''] });
  };

  const updateMaterial = (index: number, value: string): void => {
    const updated = [...formData.materials];
    updated[index] = value;
    setFormData({ ...formData, materials: updated });
  };

  const removeMaterial = (index: number): void => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => !i= index),
    });
  };

  const addAccommodation = (): void => {
    setFormData({ ...formData, accommodations: [...formData.accommodations, ''] });
  };

  const updateAccommodation = (index: number, value: string): void => {
    const updated = [...formData.accommodations];
    updated[index] = value;
    setFormData({ ...formData, accommodations: updated });
  };

  const removeAccommodation = (index: number): void => {
    setFormData({
      ...formData,
      accommodations: formData.accommodations.filter((_, i) => !i= index),
    });
  };

  const addModification = (): void => {
    setFormData({ ...formData, modifications: [...formData.modifications, ''] });
  };

  const updateModification = (index: number, value: string): void => {
    const updated = [...formData.modifications];
    updated[index] = value;
    setFormData({ ...formData, modifications: updated });
  };

  const removeModification = (index: number): void => {
    setFormData({
      ...formData,
      modifications: formData.modifications.filter((_, i) => !i= index),
    });
  };

  const addExtension = (): void => {
    setFormData({ ...formData, extensions: [...formData.extensions, ''] });
  };

  const updateExtension = (index: number, value: string): void => {
    const updated = [...formData.extensions];
    updated[index] = value;
    setFormData({ ...formData, extensions: updated });
  };

  const removeExtension = (index: number): void => {
    setFormData({
      ...formData,
      extensions: formData.extensions.filter((_, i) => !i= index),
    });
  };

  // AI suggestion handlers
  const handleAISuggestionAccepted = (type: string, content: string[]): void => {
    switch (type) {
      case 'mindson':
        setFormData({ ...formData, mindsOn: content.join('\n\n') });
        break;
      case 'handson':
        setFormData({ ...formData, action: content.join('\n\n') });
        break;
      case 'mindson_reflection':
        setFormData({ ...formData, consolidation: content.join('\n\n') });
        break;
      case 'materials': {
        const existingMaterials = formData.materials.filter((m) => m.trim());
        setFormData({ ...formData, materials: [...existingMaterials, ...content] });
        break;
      }
      case 'assessments':
        setFormData({ ...formData, assessmentNotes: content.join('\n\n') });
        break;
      default:
      // Unhandled suggestion type
    }
  };

  const handleAILessonGenerated = (lessonPlan: {
    title?: string;
    learningGoals?: string[];
    structure?: {
      mindsOn?: { activities?: string[] };
      handsOn?: { activities?: string[] };
      mindsOnReflection?: { activities?: string[] };
    };
    materials?: string[];
    duration?: number;
    mindsOn?: { activities: string[]; duration: number; materials: string[] };
    handsOn?: { activities: string[]; duration: number; materials: string[] };
    mindsOnReflection?: { activities: string[]; duration: number; materials: string[] };
  }): void => {
    // Handle both the old interface and the new ThreePartStructure interface
    if ('mindsOn' in lessonPlan && 'handsOn' in lessonPlan && 'mindsOnReflection' in lessonPlan) {
      // ThreePartStructure format
      const structure = lessonPlan as {
        mindsOn: { activities: string[]; duration: number; materials: string[] };
        handsOn: { activities: string[]; duration: number; materials: string[] };
        mindsOnReflection: { activities: string[]; duration: number; materials: string[] };
      };

      setFormData({
        ...formData,
        mindsOn: structure.mindsOn.activities.join('\n\n'),
        action: structure.handsOn.activities.join('\n\n'),
        consolidation: structure.mindsOnReflection.activities.join('\n\n'),
        materials: [
          ...new Set([
            ...structure.mindsOn.materials,
            ...structure.handsOn.materials,
            ...structure.mindsOnReflection.materials,
          ]),
        ],
        duration:
          structure.mindsOn.duration +
          structure.handsOn.duration +
          structure.mindsOnReflection.duration,
      });
    } else {
      // Legacy format
      setFormData({
        ...formData,
        title: lessonPlan.title ?? formData.title,
        learningGoals: lessonPlan.learningGoals?.join('\n') ?? formData.learningGoals,
        mindsOn: lessonPlan.structure?.mindsOn?.activities?.join('\n\n') ?? formData.mindsOn,
        action: lessonPlan.structure?.handsOn?.activities?.join('\n\n') ?? formData.action,
        consolidation:
          lessonPlan.structure?.mindsOnReflection?.activities?.join('\n\n') ??
          formData.consolidation,
        materials: lessonPlan.materials ?? formData.materials,
        duration: lessonPlan.duration ?? formData.duration,
      });
    }
  };

  const handleApplyTemplate = async (template: PlanTemplate): Promise<void> => {
    try {
      const applied = await applyTemplate.mutateAsync({ id: template.id });

      if (isLessonPlanTemplate(template) && applied.appliedContent) {
        // Pre-populate form with template data
        const templateContent = applied.appliedContent as LessonPlanContent;
        setFormData({
          ...formData,
          title: '',
          titleFr: '',
          duration: templateContent.duration ?? 60,
          learningGoals: '',
          learningGoalsFr: '',
          mindsOn: templateContent.mindsOn || '',
          mindsOnFr: '',
          action: templateContent.action || '',
          actionFr: '',
          consolidation: templateContent.consolidation || '',
          consolidationFr: '',
          materials: templateContent.materials ?? [''],
          grouping: templateContent.grouping ?? 'whole',
          accommodations: templateContent.accommodations ?? [''],
          modifications: templateContent.modifications ?? [''],
          extensions: templateContent.extensions ?? [''],
          assessmentType:
            (templateContent.assessmentType as 'diagnostic' | 'formative' | 'summative') ??
            'formative',
          assessmentNotes: templateContent.assessmentNotes || '',
          isSubFriendly: false,
          subNotes: '',
        });
      }

      setIsTemplateModalOpen(false);
      setSelectedTemplate(null);
      setIsCreateModalOpen(true);
    } catch (_error) {
      logger.error('Failed to apply template:', _error);
    }
  };

  // If we're in detail mode (lessonId provided), show the detail view
  if (lessonId && selectedLesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link className="hover:text-indigo-600" to="/planner/long-range">
            Long-Range Plans
          </Link>
