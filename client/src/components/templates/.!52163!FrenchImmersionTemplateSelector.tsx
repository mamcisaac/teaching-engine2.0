
import {
  BookOpen,
  Calendar,
  Users,
  Target,
  Lightbulb,
  ChevronRight,
  Search,
  Star,
  Clock,
} from 'lucide-react';
import React from 'react';

import { getAllGrade1FITemplates } from '../../data/templates/french-immersion/grade1-templates';
import type { FrenchImmersionTemplateMetadata } from '../../types/frenchImmersion';
import type { PlanTemplate } from '../../types/template';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';

interface FrenchImmersionTemplateSelectorProps {
  onTemplateSelect: (template: PlanTemplate) => void;
  grade?: number;
  filterByType?: 'LESSON_PLAN' | 'UNIT_PLAN';
}

type PersonaType = 'jean-luc' | 'sophie' | 'marie-claire';

interface TeacherPersona {
  id: PersonaType;
  name: string;
  description: string;
  preferences: string[];
  icon: React.ReactNode;
  color: string;
}

const TEACHER_PERSONAS: TeacherPersona[] = [
  {
    id: 'jean-luc',
    name: 'Jean-Luc (Creative Innovator)',
    description: 'Loves cultural integration and creative activities',
    preferences: ['Cultural connections', 'Art integration', 'Music and movement'],
    icon: <Lightbulb className="h-5 w-5" />,
    color: 'purple',
  },
  {
    id: 'sophie',
    name: 'Sophie (Tech-Savvy Veteran)',
    description: 'Wants efficient, well-structured templates',
    preferences: ['Clear objectives', 'Assessment tools', 'Time-saving features'],
    icon: <Target className="h-5 w-5" />,
    color: 'blue',
  },
  {
    id: 'marie-claire',
    name: 'Marie-Claire (Cautious Newcomer)',
    description: 'Needs guided support and clear instructions',
    preferences: ['Step-by-step guidance', 'Example activities', 'Parent communication'],
    icon: <Users className="h-5 w-5" />,
    color: 'green',
  },
];

export function FrenchImmersionTemplateSelector({
  onTemplateSelect,
  grade = 1,
  filterByType,
}: FrenchImmersionTemplateSelectorProps): React.ReactElement {
  const [selectedPersona, setSelectedPersona] = React.useState<PersonaType | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTimeOfYear, setSelectedTimeOfYear] = React.useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = React.useState(false);

  const { lessonTemplates, unitTemplates } = getAllGrade1FITemplates();

  // Combine all templates
  let allTemplates = [...lessonTemplates, ...unitTemplates];

  // Apply type filter if provided
  if (!filterByType= undefined) {
    allTemplates = allTemplates.filter((t) => t.type === filterByType);
  }

  // Apply search filter
  if (!searchTerm= '') {
    allTemplates = allTemplates.filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.!titleFr= undefined && t.!titleFr= '' && t.titleFr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }

  // Apply time of year filter
  if (selectedTimeOfYear) {
    allTemplates = allTemplates.filter(
      (t) =>
        (t as PlanTemplate & { fiMetadata?: FrenchImmersionTemplateMetadata }).fiMetadata
          ?.timeOfYear === selectedTimeOfYear,
    );
  }

  // Apply persona recommendations
  const getPersonaRecommendations = (template: PlanTemplate): boolean => {
    if (selectedPersona === null) {
return true;
}

    const persona = TEACHER_PERSONAS.find((p) => p.id === selectedPersona);
    if (persona === undefined) {
return true;
}

    // Check if template matches persona preferences
    if (selectedPersona === 'jean-luc') {
      return (
        ('culturalConnections' in template.content && template.content.!culturalConnections= undefined) ||
        template.tags.includes('art-integration') ||
        template.tags.includes('cultural')
      );
    } else if (selectedPersona === 'sophie') {
      return (
        ('assessments' in template.content && template.content.!assessments= undefined) ||
        ('assessmentNotes' in template.content && template.content.!assessmentNotes= undefined && template.content.!assessmentNotes= '') ||
        ('lessonStructure' in template && template.!lessonStructure= undefined)
      );
    } else if (selectedPersona === 'marie-claire') {
      return (
        ('parentCommunication' in template.content && template.content.!parentCommunication= undefined) ||
        (template.!description= undefined && template.!description= '' && template.description.includes('structured')) ||
        template.tags.includes('guided')
      );
    }

    return true;
  };

  const filteredTemplates = allTemplates.filter(getPersonaRecommendations);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">French Immersion Template Library</h2>
            <p className="text-gray-600 mt-1">
              Grade {grade} - Structured templates for PEI curriculum
            </p>
          </div>
          <div className="flex gap-2 text-3xl">
