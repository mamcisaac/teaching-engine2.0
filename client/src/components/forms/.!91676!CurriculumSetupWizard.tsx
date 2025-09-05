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
import React, { useState } from 'react';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Progress } from '../ui/Progress';
import { Textarea } from '../ui/Textarea';

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

export function CurriculumSetupWizard({
  onComplete,
  onCancel,
}: CurriculumSetupWizardProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CurriculumSetupData>({
    academicYear: `${new Date().getFullYear()  }-${  new Date().getFullYear() + 1}`,
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
      completed: formData.academicYear !== '' && formData.grade !== 0 && formData.subject !== '',
    },
    {
      id: 'planning-preferences',
      title: 'Planning Preferences',
      description: 'Choose your preferred planning approach and structure',
      completed: Boolean(formData.planningStyle) && Boolean(formData.termStructure),
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
      completed: formData.yearStartDate !== '' && formData.yearEndDate !== '' && formData.unitCount !== 0,
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

  const nextStep = (): void => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (): void => {
    onComplete(formData);
  };

  const addToArray = (field: keyof CurriculumSetupData, value: string): void => {
    const currentArray = formData[field] as string[];
    if (!currentArray.includes(value) && value.trim() !== '') {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      });
    }
  };

  const removeFromArray = (field: keyof CurriculumSetupData, value: string): void => {
    const currentArray = formData[field] as string[];
    setFormData({
      ...formData,
      [field]: currentArray.filter(item => item !== value),
    });
  };

  const renderStepContent = (): JSX.Element => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="academic-year">Academic Year</Label>
                <Input
                  id="academic-year"
                  placeholder="2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => {
 setFormData({ ...formData, academicYear: e.target.value }); 
}}
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => {
 setFormData({ ...formData, grade: parseInt(e.target.value) }); 
}}
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
                placeholder="e.g., Mathematics, Science, Language Arts"
                value={formData.subject}
                onChange={(e) => {
 setFormData({ ...formData, subject: e.target.value }); 
}}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="teacher-name">Teacher Name</Label>
                <Input
                  id="teacher-name"
                  placeholder="Your name"
                  value={formData.teacherName}
                  onChange={(e) => {
 setFormData({ ...formData, teacherName: e.target.value }); 
}}
                />
              </div>
              <div>
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  placeholder="School or institution name"
                  value={formData.schoolName}
                  onChange={(e) => {
 setFormData({ ...formData, schoolName: e.target.value }); 
}}
                />
              </div>
            </div>
          </div>
        );

      case 1: // Planning Preferences
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="input">Planning Style</Label>
              <div className="grid gap-3 mt-2">
                {[
                  { value: 'thematic', label: 'Thematic', desc: 'Organize learning around themes and big ideas' },
                  { value: 'subject-based', label: 'Subject-Based', desc: 'Traditional subject-focused approach' },
                  { value: 'inquiry-based', label: 'Inquiry-Based', desc: 'Student-driven questions and investigations' },
                ].map((option, _index) => (
                  <label key={option.value} aria-label={option.label} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50" htmlFor={`planning-style-${option.value}`}>
                    <input
                      checked={formData.planningStyle === option.value}
                      className="mt-1"
                      id={`planning-style-${option.value}`}
                      name="planning-style"
                      type="radio"
                      value={option.value}
                      onChange={(e) => {
 setFormData({ ...formData, planningStyle: e.target.value as 'thematic' | 'subject-based' | 'inquiry-based' }); 
}}
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
              <Label htmlFor="input">Term Structure</Label>
              <select
                className="w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.termStructure}
                onChange={(e) => {
 setFormData({ ...formData, termStructure: e.target.value as 'semester' | 'trimester' | 'quarters' | 'full-year' }); 
}}
              >
                <option value="semester">Semester (2 terms)</option>
                <option value="trimester">Trimester (3 terms)</option>
                <option value="quarters">Quarters (4 terms)</option>
                <option value="full-year">Full Year</option>
              </select>
            </div>
            <div>
              <Label htmlFor="input">Assessment Frequency</Label>
              <select
                className="w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.assessmentFrequency}
                onChange={(e) => {
 setFormData({ ...formData, assessmentFrequency: e.target.value as 'weekly' | 'bi-weekly' | 'monthly' | 'unit-based' }); 
}}
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
              <Label htmlFor="input">Priority Curriculum Strands</Label>
              <p className="text-sm text-gray-600 mb-2">Add the main curriculum strands you'll focus on</p>
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
                    if (input.value !== '') {
                      addToArray('priorityStrands', input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.priorityStrands.map((strand, _index) => (
                  <Badge key={strand} className="flex items-center gap-1" variant="secondary">
                    {strand}
                    <button
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      type="button"
                      onClick={() => {
 removeFromArray('priorityStrands', strand); 
}}
                    >
