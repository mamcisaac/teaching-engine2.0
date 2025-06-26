import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  // Calendar,
  // Target,
  // BookOpen,
  // Users,
  Sparkles,
  // Download,
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface CurriculumSetupData {
  // Step 1: Basic Info
  academicYear: string;
  grade: number;
  subject: string;
  teacherName: string;
  schoolName: string;
  
  // Step 2: Planning Preferences
  planningStyle: 'thematic' | 'subject-based' | 'inquiry-based';
  termStructure: 'semester' | 'trimester' | 'quarters' | 'full-year';
  assessmentFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'unit-based';
  
  // Step 3: Curriculum Expectations
  expectedOutcomes: string[];
  priorityStrands: string[];
  crossCurricularConnections: string[];
  
  // Step 4: Timeline & Pacing
  yearStartDate: string;
  yearEndDate: string;
  holidays: { name: string; date: string }[];
  unitCount: number;
  avgUnitLength: number;
  
  // Step 5: Resources & Materials
  availableResources: string[];
  technologyAccess: string[];
  specialRequirements: string;
  
  // Step 6: Output Preferences
  generateUnitPlans: boolean;
  generateLessonPlans: boolean;
  includeAssessments: boolean;
  includeDifferentiation: boolean;
  exportFormat: 'json' | 'pdf' | 'both';
}

interface CurriculumSetupWizardProps {
  onComplete: (data: CurriculumSetupData) => void;
  onCancel: () => void;
}

export default function CurriculumSetupWizard({
  onComplete,
  onCancel,
}: CurriculumSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CurriculumSetupData>({
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    grade: 1,
    subject: '',
    teacherName: '',
    schoolName: '',
    planningStyle: 'thematic',
    termStructure: 'semester',
    assessmentFrequency: 'unit-based',
    expectedOutcomes: [],
    priorityStrands: [],
    crossCurricularConnections: [],
    yearStartDate: '',
    yearEndDate: '',
    holidays: [],
    unitCount: 6,
    avgUnitLength: 4,
    availableResources: [],
    technologyAccess: [],
    specialRequirements: '',
    generateUnitPlans: true,
    generateLessonPlans: true,
    includeAssessments: true,
    includeDifferentiation: true,
    exportFormat: 'json',
  });

  const steps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Enter your teaching context and academic year details',
      completed: Boolean(formData.academicYear && formData.grade && formData.subject),
    },
    {
      id: 'planning-preferences',
      title: 'Planning Preferences',
      description: 'Choose your preferred planning approach and structure',
      completed: Boolean(formData.planningStyle && formData.termStructure),
    },
    {
      id: 'curriculum-expectations',
      title: 'Curriculum Focus',
      description: 'Define your curriculum priorities and connections',
      completed: formData.priorityStrands.length > 0,
    },
    {
      id: 'timeline-pacing',
      title: 'Timeline & Pacing',
      description: 'Set up your academic calendar and unit pacing',
      completed: Boolean(formData.yearStartDate && formData.yearEndDate && formData.unitCount),
    },
    {
      id: 'resources-materials',
      title: 'Resources & Materials',
      description: 'Specify available resources and special requirements',
      completed: formData.availableResources.length > 0,
    },
    {
      id: 'output-preferences',
      title: 'Output Preferences',
      description: 'Choose what to generate and export options',
      completed: true, // Always completed as it has defaults
    },
  ];

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const addToArray = (field: keyof CurriculumSetupData, value: string) => {
    const currentArray = formData[field] as string[];
    if (!currentArray.includes(value) && value.trim()) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      });
    }
  };

  const removeFromArray = (field: keyof CurriculumSetupData, value: string) => {
    const currentArray = formData[field] as string[];
    setFormData({
      ...formData,
      [field]: currentArray.filter(item => item !== value),
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="academic-year">Academic Year</Label>
                <Input
                  id="academic-year"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="2024-2025"
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <select
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Mathematics, Science, Language Arts"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="teacher-name">Teacher Name</Label>
                <Input
                  id="teacher-name"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="School or institution name"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Planning Preferences
        return (
          <div className="space-y-6">
            <div>
              <Label>Planning Style</Label>
              <div className="grid gap-3 mt-2">
                {[
                  { value: 'thematic', label: 'Thematic', desc: 'Organize learning around themes and big ideas' },
                  { value: 'subject-based', label: 'Subject-Based', desc: 'Traditional subject-focused approach' },
                  { value: 'inquiry-based', label: 'Inquiry-Based', desc: 'Student-driven questions and investigations' },
                ].map((option) => (
                  <label key={option.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="planning-style"
                      value={option.value}
                      checked={formData.planningStyle === option.value}
                      onChange={(e) => setFormData({ ...formData, planningStyle: e.target.value as 'thematic' | 'subject-based' | 'inquiry-based' })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Term Structure</Label>
              <select
                value={formData.termStructure}
                onChange={(e) => setFormData({ ...formData, termStructure: e.target.value as 'semester' | 'trimester' | 'quarters' | 'full-year' })}
                className="w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="semester">Semester (2 terms)</option>
                <option value="trimester">Trimester (3 terms)</option>
                <option value="quarters">Quarters (4 terms)</option>
                <option value="full-year">Full Year</option>
              </select>
            </div>
            <div>
              <Label>Assessment Frequency</Label>
              <select
                value={formData.assessmentFrequency}
                onChange={(e) => setFormData({ ...formData, assessmentFrequency: e.target.value as 'weekly' | 'bi-weekly' | 'monthly' | 'unit-based' })}
                className="w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="unit-based">Unit-based</option>
              </select>
            </div>
          </div>
        );

      case 2: // Curriculum Expectations
        return (
          <div className="space-y-6">
            <div>
              <Label>Priority Curriculum Strands</Label>
              <p className="text-sm text-gray-600 mb-2">Add the main curriculum strands you&apos;ll focus on</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Number Sense, Algebra, Data Management"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('priorityStrands', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      addToArray('priorityStrands', input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.priorityStrands.map((strand) => (
                  <Badge key={strand} variant="secondary" className="flex items-center gap-1">
                    {strand}
                    <button
                      type="button"
                      onClick={() => removeFromArray('priorityStrands', strand)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Cross-Curricular Connections</Label>
              <p className="text-sm text-gray-600 mb-2">Subjects or areas you&apos;ll integrate</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Language Arts, Science, Social Studies"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('crossCurricularConnections', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      addToArray('crossCurricularConnections', input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.crossCurricularConnections.map((connection) => (
                  <Badge key={connection} variant="outline" className="flex items-center gap-1">
                    {connection}
                    <button
                      type="button"
                      onClick={() => removeFromArray('crossCurricularConnections', connection)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Timeline & Pacing
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="year-start">Academic Year Start</Label>
                <Input
                  id="year-start"
                  type="date"
                  value={formData.yearStartDate}
                  onChange={(e) => setFormData({ ...formData, yearStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="year-end">Academic Year End</Label>
                <Input
                  id="year-end"
                  type="date"
                  value={formData.yearEndDate}
                  onChange={(e) => setFormData({ ...formData, yearEndDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="unit-count">Number of Units</Label>
                <Input
                  id="unit-count"
                  type="number"
                  min="2"
                  max="12"
                  value={formData.unitCount}
                  onChange={(e) => setFormData({ ...formData, unitCount: parseInt(e.target.value) || 6 })}
                />
              </div>
              <div>
                <Label htmlFor="unit-length">Average Unit Length (weeks)</Label>
                <Input
                  id="unit-length"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.avgUnitLength}
                  onChange={(e) => setFormData({ ...formData, avgUnitLength: parseInt(e.target.value) || 4 })}
                />
              </div>
            </div>
          </div>
        );

      case 4: // Resources & Materials
        return (
          <div className="space-y-6">
            <div>
              <Label>Available Resources</Label>
              <p className="text-sm text-gray-600 mb-2">List the resources available in your classroom</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Textbooks, Manipulatives, Interactive whiteboard"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('availableResources', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      addToArray('availableResources', input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.availableResources.map((resource) => (
                  <Badge key={resource} variant="secondary" className="flex items-center gap-1">
                    {resource}
                    <button
                      type="button"
                      onClick={() => removeFromArray('availableResources', resource)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Technology Access</Label>
              <p className="text-sm text-gray-600 mb-2">Available technology tools and platforms</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Tablets, Computers, Educational software"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('technologyAccess', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      addToArray('technologyAccess', input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologyAccess.map((tech) => (
                  <Badge key={tech} variant="outline" className="flex items-center gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeFromArray('technologyAccess', tech)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="special-requirements">Special Requirements or Considerations</Label>
              <Textarea
                id="special-requirements"
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                placeholder="Any special needs, accessibility requirements, or other considerations..."
                rows={3}
              />
            </div>
          </div>
        );

      case 5: // Output Preferences
        return (
          <div className="space-y-6">
            <div>
              <Label>What would you like to generate?</Label>
              <div className="space-y-3 mt-2">
                {[
                  { key: 'generateUnitPlans', label: 'Unit Plans', desc: 'Complete unit planning documents' },
                  { key: 'generateLessonPlans', label: 'Lesson Plans', desc: 'Individual lesson planning templates' },
                  { key: 'includeAssessments', label: 'Assessment Plans', desc: 'Assessment strategies and rubrics' },
                  { key: 'includeDifferentiation', label: 'Differentiation Strategies', desc: 'Support for diverse learners' },
                ].map((option) => (
                  <label key={option.key} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData[option.key as keyof CurriculumSetupData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [option.key]: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Export Format</Label>
              <select
                value={formData.exportFormat}
                onChange={(e) => setFormData({ ...formData, exportFormat: e.target.value as 'json' | 'pdf' | 'both' })}
                className="w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="json">JSON (for import)</option>
                <option value="pdf">PDF (for printing)</option>
                <option value="both">Both formats</option>
              </select>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Curriculum Setup Wizard
              </CardTitle>
              <CardDescription>
                Set up your complete curriculum planning structure in 6 easy steps
              </CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{currentStepData.title}</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="mb-2" />
            <p className="text-sm text-gray-600">{currentStepData.description}</p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              {currentStep === totalSteps - 1 ? (
                <Button
                  onClick={handleComplete}
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Setup
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!currentStepData.completed}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}