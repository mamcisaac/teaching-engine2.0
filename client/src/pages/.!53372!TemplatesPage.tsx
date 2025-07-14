
import {
  Search,
  Filter,
  Plus,
  Star,
  Copy,
  // Edit,
  Trash2,
  Eye,
  BookOpen,
  // FileText,
  // Users,
  ChevronDown,
  ChevronRight,
  // Tag,
  Calendar,
  Clock,
  Download,
  // Heart,
  // ThumbsUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { Dialog } from '../components/Dialog';
import { LoadingSpinner } from '../components/LoadingStates';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import {
  useTemplates,
  // useTemplate,
  useCreateTemplate,
  // useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  useApplyTemplate,
  // useRateTemplate,
  useTemplateFilterOptions,
} from '../hooks/useTemplates';
import type {
  PlanTemplate,
  TemplateSearchOptions,
  TemplateCreateData,
  TemplateType,
  TemplateCategory} from '../types/template';
import {
  TEMPLATE_TYPES,
  TEMPLATE_CATEGORIES,
  isUnitPlanTemplate,
  isLessonPlanTemplate,
} from '../types/template';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { logger } from '../utils/logger';

export default function TemplatesPage(): React.ReactElement {
  const { templateId } = useParams();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'all' | 'system' | 'public' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'usageCount' | 'averageRating' | 'createdAt'>(
    'createdAt',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  // const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state for creating/editing templates
  const [formData, setFormData] = useState<Partial<TemplateCreateData>>({
    title: '',
    description: '',
    type: 'UNIT_PLAN',
    category: 'BY_SUBJECT',
    tags: [],
    keywords: [],
    isPublic: false,
    content: {},
  });

  // Build search options
  const searchOptions: TemplateSearchOptions = {
    search: searchTerm || undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    subject: selectedSubject !== 'all' ? selectedSubject : undefined,
    gradeMin: selectedGrade !== 'all' ? selectedGrade : undefined,
    gradeMax: selectedGrade !== 'all' ? selectedGrade : undefined,
    isSystem: view === 'system' ? true : undefined,
    isPublic: view === 'public' ? true : undefined,
    sortBy,
    sortOrder,
    limit: 20,
  };

  // Hooks
  const { data: templatesResult, isLoading, error } = useTemplates(searchOptions);
  // const { data: selectedTemplateData } = useTemplate(templateId || '');
  const { data: filterOptions } = useTemplateFilterOptions();
  const createTemplate = useCreateTemplate();
  // const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const applyTemplate = useApplyTemplate();
  // const rateTemplate = useRateTemplate();

  const templates = templatesResult?.templates ?? [];

  // Handlers
  const handleCreateTemplate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const newTemplate = await createTemplate.mutateAsync(formData as TemplateCreateData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'UNIT_PLAN',
        category: 'BY_SUBJECT',
        tags: [],
        keywords: [],
        isPublic: false,
        content: {},
      });
      navigate(`/templates/${newTemplate.id}`);
    } catch (_error) {
      logger.error('Failed to create template:', _error);
    }
  };

  const handleDuplicateTemplate = async (template: PlanTemplate): Promise<void> => {
    try {
      const duplicated = await duplicateTemplate.mutateAsync({
        id: template.id,
        title: `${template.title} (Copy)`,
      });
      navigate(`/templates/${duplicated.id}`);
    } catch (_error) {
      logger.error('Failed to duplicate template:', _error);
    }
  };

  const handleDeleteTemplate = async (): Promise<void> => {
    if (!selectedTemplate) {
return;
}

    try {
      await deleteTemplate.mutateAsync(selectedTemplate.id);
      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);
      if (templateId === selectedTemplate.id) {
        navigate('/templates');
      }
    } catch (_error) {
      logger.error('Failed to delete template:', _error);
    }
  };

  const handleApplyTemplate = async (template: PlanTemplate): Promise<void> => {
    try {
      const applied = await applyTemplate.mutateAsync({ id: template.id });

      // Navigate to appropriate planning page based on template type
      if (template.type === 'UNIT_PLAN') {
        // Pass template data to unit plan creation
        navigate('/planner/units', {
          state: { templateData: applied.appliedContent },
        });
      } else {
        // Pass template data to lesson plan creation
        navigate('/planner/lessons', {
          state: { templateData: applied.appliedContent },
        });
      }
    } catch (_error) {
      logger.error('Failed to apply template:', _error);
    }
  };

  // const handleRateTemplate = async (template: PlanTemplate, rating: number) => {
  //   try {
  //     await rateTemplate.mutateAsync({ id: template.id, rating });
  //   } catch (_error) {
  //     logger.error('Failed to rate template:', _error);
  //   }
  // };

  // Template card component
  const TemplateCard = ({ template }: { template: PlanTemplate }): JSX.Element => (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TEMPLATE_TYPES[template.type].icon}</span>
            <div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription className="text-sm">
                {template.type === 'UNIT_PLAN' ? 'Unit Plan' : 'Lesson Plan'}
                {template.subject && ` • ${template.subject}`}
                {template.gradeMin === template.gradeMax
                  ? ` • Grade ${template.gradeMin}`
                  : template.gradeMin !== null && template.gradeMax !== null
                    ? ` • Grades ${template.gradeMin}-${template.gradeMax}`
                    : ''}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {template.isSystem && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                System
              </span>
            )}
            {template.isPublic && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Public
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag, _index) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              +{template.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            {template.averageRating && template.averageRating !== 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{template.averageRating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{template.usageCount}</span>
            </div>
          </div>

          {template.estimatedWeeks && template.estimatedWeeks !== 0 && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{template.estimatedWeeks}w</span>
            </div>
          )}
          {template.estimatedMinutes && template.estimatedMinutes !== 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{template.estimatedMinutes}m</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={() => {
              setSelectedTemplate(template);
              setIsPreviewModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>

          <Button
            className="flex-1"
            size="sm"
            variant="outline"
            onClick={() => {
 void handleApplyTemplate(template); 
}}
          >
            <Plus className="h-4 w-4 mr-1" />
            Use
          </Button>

          <Button aria-label="Click button" onClick={() => {
 void handleDuplicateTemplate(template); 
}}>
            <Copy className="h-4 w-4" />
          </Button>

          {template.createdByUserId && !template.isSystem && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedTemplate(template);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner message="Loading templates..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link className="hover:text-indigo-600" to="/planner">
            Planning
          </Link>
