import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
// import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { 
  Download, 
  FileText, 
  Calendar, 
  BookOpen, 
  Users, 
  Target,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { UnitPlanFormData } from './UnitPlanForm';
import { LessonPlanFormData } from './LessonPlanForm';

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'lesson' | 'curriculum';
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fields: string[];
}

const TEMPLATE_LIBRARY: TemplateConfig[] = [
  {
    id: 'basic-unit',
    name: 'Basic Unit Plan',
    description: 'Essential fields for a simple unit plan',
    type: 'unit',
    icon: <BookOpen className="h-5 w-5" />,
    difficulty: 'beginner',
    fields: ['title', 'description', 'startDate', 'endDate', 'bigIdeas', 'essentialQuestions', 'expectationIds'],
  },
  {
    id: 'comprehensive-unit',
    name: 'Comprehensive Unit Plan',
    description: 'Complete ETFO-aligned unit plan with all fields',
    type: 'unit',
    icon: <Target className="h-5 w-5" />,
    difficulty: 'advanced',
    fields: ['all'],
  },
  {
    id: 'basic-lesson',
    name: 'Basic Lesson Plan',
    description: 'Three-part lesson structure with core fields',
    type: 'lesson',
    icon: <Calendar className="h-5 w-5" />,
    difficulty: 'beginner',
    fields: ['title', 'date', 'duration', 'mindsOn', 'action', 'consolidation', 'expectationIds'],
  },
  {
    id: 'detailed-lesson',
    name: 'Detailed Lesson Plan',
    description: 'Complete lesson plan with differentiation and assessment',
    type: 'lesson',
    icon: <CheckCircle2 className="h-5 w-5" />,
    difficulty: 'intermediate',
    fields: ['all'],
  },
  {
    id: 'sub-friendly-lesson',
    name: 'Sub-Friendly Lesson',
    description: 'Lesson plan optimized for substitute teachers',
    type: 'lesson',
    icon: <Users className="h-5 w-5" />,
    difficulty: 'intermediate',
    fields: ['title', 'date', 'duration', 'action', 'materials', 'isSubFriendly', 'subNotes', 'expectationIds'],
  },
];

interface FormTemplatesProps {
  onTemplateGenerate: (templateId: string, config: Record<string, unknown>) => void;
  onTemplateDownload: (templateId: string, data: Record<string, unknown>) => void;
}

export default function FormTemplates({
  onTemplateGenerate,
  onTemplateDownload,
}: FormTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [customConfig, setCustomConfig] = useState({
    quantity: 1,
    prefix: '',
    dateRange: {
      start: '',
      end: '',
    },
    includeFields: [] as string[],
  });

  const generateBasicUnitTemplate = (quantity: number = 1): UnitPlanFormData[] => {
    return Array.from({ length: quantity }, (_, index) => ({
      title: `${customConfig.prefix}Unit ${index + 1}`,
      description: '',
      bigIdeas: '',
      essentialQuestions: [''],
      startDate: customConfig.dateRange.start || '',
      endDate: customConfig.dateRange.end || '',
      estimatedHours: 20,
      assessmentPlan: '',
      successCriteria: [''],
      expectationIds: [],
      longRangePlanId: '',
      crossCurricularConnections: '',
      learningSkills: [],
      culminatingTask: '',
      keyVocabulary: [''],
      priorKnowledge: '',
      parentCommunicationPlan: '',
      fieldTripsAndGuestSpeakers: '',
      differentiationStrategies: {
        forStruggling: [''],
        forAdvanced: [''],
        forELL: [''],
        forIEP: [''],
      },
      indigenousPerspectives: '',
      environmentalEducation: '',
      socialJusticeConnections: '',
      technologyIntegration: '',
      communityConnections: '',
    }));
  };

  const generateBasicLessonTemplate = (quantity: number = 1): LessonPlanFormData[] => {
    return Array.from({ length: quantity }, (_, index) => ({
      title: `${customConfig.prefix}Lesson ${index + 1}`,
      titleFr: '',
      unitPlanId: '',
      date: customConfig.dateRange.start || new Date().toISOString().split('T')[0],
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
      grouping: 'whole class',
      accommodations: [''],
      modifications: [''],
      extensions: [''],
      assessmentType: 'formative' as const,
      assessmentNotes: '',
      isSubFriendly: true,
      subNotes: '',
      expectationIds: [],
    }));
  };

  const generateSubFriendlyLessonTemplate = (quantity: number = 1): LessonPlanFormData[] => {
    return Array.from({ length: quantity }, (_, index) => ({
      title: `${customConfig.prefix}Sub Plan ${index + 1}`,
      titleFr: '',
      unitPlanId: '',
      date: customConfig.dateRange.start || new Date().toISOString().split('T')[0],
      duration: 60,
      mindsOn: 'Simple review activity that requires minimal setup',
      mindsOnFr: '',
      action: 'Independent work or structured activity with clear instructions',
      actionFr: '',
      consolidation: 'Quick reflection or closure activity',
      consolidationFr: '',
      learningGoals: 'Continue learning in teacher\'s absence',
      learningGoalsFr: '',
      materials: ['Student textbook', 'Worksheets (prepared)', 'Basic supplies available in class'],
      grouping: 'individual',
      accommodations: ['Clear written instructions', 'Visual aids available'],
      modifications: ['Simplified tasks available'],
      extensions: ['Additional practice available'],
      assessmentType: 'formative' as const,
      assessmentNotes: 'Collect completed work for review',
      isSubFriendly: true,
      subNotes: 'All materials are pre-arranged. Students know routine. Contact office for any issues.',
      expectationIds: [],
    }));
  };

  const handleTemplateGenerate = () => {
    if (!selectedTemplate) return;

    let templateData: Array<Record<string, unknown>> = [];

    switch (selectedTemplate.id) {
      case 'basic-unit':
      case 'comprehensive-unit':
        templateData = generateBasicUnitTemplate(customConfig.quantity);
        break;
      case 'basic-lesson':
      case 'detailed-lesson':
        templateData = generateBasicLessonTemplate(customConfig.quantity);
        break;
      case 'sub-friendly-lesson':
        templateData = generateSubFriendlyLessonTemplate(customConfig.quantity);
        break;
    }

    onTemplateGenerate(selectedTemplate.id, {
      template: selectedTemplate,
      data: templateData,
      config: customConfig,
    });
  };

  const handleTemplateDownload = () => {
    if (!selectedTemplate) return;

    let templateData: Array<Record<string, unknown>> = [];

    switch (selectedTemplate.id) {
      case 'basic-unit':
      case 'comprehensive-unit':
        templateData = generateBasicUnitTemplate(customConfig.quantity);
        break;
      case 'basic-lesson':
      case 'detailed-lesson':
        templateData = generateBasicLessonTemplate(customConfig.quantity);
        break;
      case 'sub-friendly-lesson':
        templateData = generateSubFriendlyLessonTemplate(customConfig.quantity);
        break;
    }

    const filename = `${selectedTemplate.id}-template.json`;
    const data = JSON.stringify(templateData, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    onTemplateDownload(selectedTemplate.id, templateData);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Library
          </CardTitle>
          <CardDescription>
            Choose from pre-built templates for common curriculum planning scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_LIBRARY.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-indigo-600">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {template.type}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Configuration */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Configure {selectedTemplate.name}
            </CardTitle>
            <CardDescription>
              Customize the template generation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="quantity">Number of entries</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="50"
                  value={customConfig.quantity}
                  onChange={(e) =>
                    setCustomConfig({
                      ...customConfig,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="prefix">Title prefix</Label>
                <Input
                  id="prefix"
                  value={customConfig.prefix}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, prefix: e.target.value })
                  }
                  placeholder="e.g., Grade 3 - "
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="start-date">Start date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customConfig.dateRange.start}
                  onChange={(e) =>
                    setCustomConfig({
                      ...customConfig,
                      dateRange: { ...customConfig.dateRange, start: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="end-date">End date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customConfig.dateRange.end}
                  onChange={(e) =>
                    setCustomConfig({
                      ...customConfig,
                      dateRange: { ...customConfig.dateRange, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleTemplateGenerate} className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate Template
              </Button>
              <Button
                variant="outline"
                onClick={handleTemplateDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
            <CardDescription>
              Preview of the fields included in this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="font-medium">Included fields:</div>
              <div className="flex flex-wrap gap-1">
                {selectedTemplate.fields.includes('all') ? (
                  <Badge variant="outline">All available fields</Badge>
                ) : (
                  selectedTemplate.fields.map((field) => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}