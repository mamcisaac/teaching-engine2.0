import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import {
  PlanTemplate,
  TemplateSearchOptions,
  TemplateCreateData,
  TemplateType,
  TemplateCategory,
  TEMPLATE_TYPES,
  TEMPLATE_CATEGORIES,
  isUnitPlanTemplate,
  isLessonPlanTemplate,
} from '../types/template';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Dialog from '../components/Dialog';
import { LoadingSpinner } from '../components/LoadingStates';
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

export default function TemplatesPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
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

  const templates = templatesResult?.templates || [];

  // Handlers
  const handleCreateTemplate = async (e: React.FormEvent) => {
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
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: PlanTemplate) => {
    try {
      const duplicated = await duplicateTemplate.mutateAsync({
        id: template.id,
        title: `${template.title} (Copy)`,
      });
      navigate(`/templates/${duplicated.id}`);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate.mutateAsync(selectedTemplate.id);
      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);
      if (templateId === selectedTemplate.id) {
        navigate('/templates');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleApplyTemplate = async (template: PlanTemplate) => {
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
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  // const handleRateTemplate = async (template: PlanTemplate, rating: number) => {
  //   try {
  //     await rateTemplate.mutateAsync({ id: template.id, rating });
  //   } catch (error) {
  //     console.error('Failed to rate template:', error);
  //   }
  // };

  // Template card component
  const TemplateCard = ({ template }: { template: PlanTemplate }) => (
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
                  : template.gradeMin && template.gradeMax
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
          {template.tags.slice(0, 3).map((tag) => (
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
            {template.averageRating && (
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

          {template.estimatedWeeks && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{template.estimatedWeeks}w</span>
            </div>
          )}
          {template.estimatedMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{template.estimatedMinutes}m</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedTemplate(template);
              setIsPreviewModalOpen(true);
            }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleApplyTemplate(template)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Use
          </Button>

          <Button size="sm" variant="ghost" onClick={() => handleDuplicateTemplate(template)}>
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
        <LoadingSpinner size="lg" message="Loading templates..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link to="/planner" className="hover:text-indigo-600">
            Planning
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Templates</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plan Templates</h1>
            <p className="mt-2 text-gray-600">
              Reusable unit and lesson plan templates to accelerate your planning
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-testid="create-template-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>View</Label>
                  <select
                    value={view}
                    onChange={(e) =>
                      setView(e.target.value as 'all' | 'system' | 'public' | 'mine')
                    }
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="all">All Templates</option>
                    <option value="system">System Templates</option>
                    <option value="public">Public Templates</option>
                    <option value="mine">My Templates</option>
                  </select>
                </div>

                <div>
                  <Label>Type</Label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as TemplateType | 'all')}
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="all">All Types</option>
                    <option value="UNIT_PLAN">Unit Plans</option>
                    <option value="LESSON_PLAN">Lesson Plans</option>
                  </select>
                </div>

                <div>
                  <Label>Category</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as TemplateCategory | 'all')
                    }
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Subject</Label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="all">All Subjects</option>
                    {filterOptions?.subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Grade</Label>
                  <select
                    value={selectedGrade}
                    onChange={(e) =>
                      setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
                    }
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="all">All Grades</option>
                    {filterOptions?.grades.map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'title' | 'usageCount' | 'averageRating' | 'createdAt',
                      )
                    }
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="title">Title</option>
                    <option value="usageCount">Usage Count</option>
                    <option value="averageRating">Rating</option>
                  </select>
                </div>

                <div>
                  <Label>Order</Label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Templates Grid */}
      {error ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">Failed to load templates. Please try again.</p>
          </CardContent>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first template'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                data-testid="create-template-empty-state-button"
              >
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <div className="p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Create New Template</h3>

          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Template title..."
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this template..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as TemplateType })
                  }
                  className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="UNIT_PLAN">Unit Plan</option>
                  <option value="LESSON_PLAN">Lesson Plan</option>
                </select>
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as TemplateCategory })
                  }
                  className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Subject (optional)</Label>
              <Input
                value={formData.subject || ''}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Mathematics, Language Arts, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Grade (optional)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.gradeMin || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gradeMin: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div>
                <Label>Maximum Grade (optional)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.gradeMax || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gradeMax: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isPublic">
                Make this template public (other teachers can use it)
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTemplate.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {createTemplate.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <div className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedTemplate.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDuplicateTemplate(selectedTemplate)}
                  >
                    Duplicate
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Template info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      <div>{TEMPLATE_TYPES[selectedTemplate.type].label}</div>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <div>{TEMPLATE_CATEGORIES[selectedTemplate.category].label}</div>
                    </div>
                    {selectedTemplate.subject && (
                      <div>
                        <span className="font-medium">Subject:</span>
                        <div>{selectedTemplate.subject}</div>
                      </div>
                    )}
                    {(selectedTemplate.gradeMin || selectedTemplate.gradeMax) && (
                      <div>
                        <span className="font-medium">Grade:</span>
                        <div>
                          {selectedTemplate.gradeMin === selectedTemplate.gradeMax
                            ? `Grade ${selectedTemplate.gradeMin}`
                            : `Grades ${selectedTemplate.gradeMin}-${selectedTemplate.gradeMax}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content preview based on template type */}
                {isUnitPlanTemplate(selectedTemplate) && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Unit Plan Content</h4>

                    {selectedTemplate.content.overview && (
                      <div>
                        <h5 className="font-medium mb-2">Overview</h5>
                        <p className="text-gray-700">{selectedTemplate.content.overview}</p>
                      </div>
                    )}

                    {selectedTemplate.content.bigIdeas && (
                      <div>
                        <h5 className="font-medium mb-2">Big Ideas</h5>
                        <p className="text-gray-700">{selectedTemplate.content.bigIdeas}</p>
                      </div>
                    )}

                    {selectedTemplate.content.learningGoals &&
                      selectedTemplate.content.learningGoals.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Learning Goals</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedTemplate.content.learningGoals.map((goal, index) => (
                              <li key={index} className="text-gray-700">
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {selectedTemplate.content.essentialQuestions &&
                      selectedTemplate.content.essentialQuestions.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Essential Questions</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedTemplate.content.essentialQuestions.map((question, index) => (
                              <li key={index} className="text-gray-700">
                                {question}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}

                {isLessonPlanTemplate(selectedTemplate) && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Lesson Plan Content</h4>

                    {selectedTemplate.content.objectives &&
                      selectedTemplate.content.objectives.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Learning Objectives</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedTemplate.content.objectives.map((objective, index) => (
                              <li key={index} className="text-gray-700">
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {selectedTemplate.content.materials &&
                      selectedTemplate.content.materials.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Materials</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedTemplate.content.materials.map((material, index) => (
                              <li key={index} className="text-gray-700">
                                {material}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <div className="grid gap-4">
                      {selectedTemplate.content.mindsOn && (
                        <div>
                          <h5 className="font-medium mb-2">Minds On</h5>
                          <p className="text-gray-700">{selectedTemplate.content.mindsOn}</p>
                        </div>
                      )}

                      {selectedTemplate.content.action && (
                        <div>
                          <h5 className="font-medium mb-2">Action</h5>
                          <p className="text-gray-700">{selectedTemplate.content.action}</p>
                        </div>
                      )}

                      {selectedTemplate.content.consolidation && (
                        <div>
                          <h5 className="font-medium mb-2">Consolidation</h5>
                          <p className="text-gray-700">{selectedTemplate.content.consolidation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedTemplate.tags.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Delete Template</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete &quot;{selectedTemplate?.title}&quot;? This action
            cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTemplate}
              disabled={deleteTemplate.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
