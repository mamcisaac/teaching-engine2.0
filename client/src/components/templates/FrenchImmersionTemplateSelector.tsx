import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/Button';
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
import { getAllGrade1FITemplates } from '../../data/templates/french-immersion/grade1-templates';
import { PlanTemplate } from '../../types/template';
import { FrenchImmersionTemplateMetadata } from '../../types/frenchImmersion';

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

export default function FrenchImmersionTemplateSelector({
  onTemplateSelect,
  grade = 1,
  filterByType,
}: FrenchImmersionTemplateSelectorProps) {
  const [selectedPersona, setSelectedPersona] = React.useState<PersonaType | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTimeOfYear, setSelectedTimeOfYear] = React.useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = React.useState(false);

  const { lessonTemplates, unitTemplates } = getAllGrade1FITemplates();

  // Combine all templates
  let allTemplates = [...lessonTemplates, ...unitTemplates];

  // Apply type filter if provided
  if (filterByType) {
    allTemplates = allTemplates.filter((t) => t.type === filterByType);
  }

  // Apply search filter
  if (searchTerm) {
    allTemplates = allTemplates.filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.titleFr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (!selectedPersona) return true;

    const persona = TEACHER_PERSONAS.find((p) => p.id === selectedPersona);
    if (!persona) return true;

    // Check if template matches persona preferences
    if (selectedPersona === 'jean-luc') {
      return (
        ('culturalConnections' in template.content && !!template.content.culturalConnections) ||
        template.tags.includes('art-integration') ||
        template.tags.includes('cultural')
      );
    } else if (selectedPersona === 'sophie') {
      return (
        ('assessments' in template.content && !!template.content.assessments) ||
        ('assessmentNotes' in template.content && !!template.content.assessmentNotes) ||
        ('lessonStructure' in template && !!template.lessonStructure)
      );
    } else if (selectedPersona === 'marie-claire') {
      return (
        ('parentCommunication' in template.content && !!template.content.parentCommunication) ||
        template.description?.includes('structured') ||
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
            <span>🇨🇦</span>
            <span>🦞</span>
            <span>🇫🇷</span>
          </div>
        </div>
      </Card>

      {/* Teacher Persona Selector */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Select Your Teaching Style</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {TEACHER_PERSONAS.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(selectedPersona === persona.id ? null : persona.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedPersona === persona.id
                  ? `border-${persona.color}-500 bg-${persona.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-${persona.color}-600`}>{persona.icon}</div>
                <div>
                  <h4 className="font-medium">{persona.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{persona.description}</p>
                  <div className="mt-2 space-y-1">
                    {persona.preferences.map((pref, idx) => (
                      <div key={idx} className="text-xs text-gray-500">
                        • {pref}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <select
            value={selectedTimeOfYear}
            onChange={(e) => setSelectedTimeOfYear(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Months</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
          </select>

          <Button
            variant={showOnlyFavorites ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            <Star className="h-4 w-4 mr-1" />
            Favorites
          </Button>
        </div>
      </Card>

      {/* Quick Start Suggestions */}
      {!selectedPersona && (
        <Card className="p-6 bg-yellow-50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Quick Start Suggestions for New Teachers
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium text-sm mb-1">Start with Family Unit</h4>
              <p className="text-xs text-gray-600">
                &ldquo;Ma famille&rdquo; is perfect for September - familiar topic with basic
                vocabulary
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium text-sm mb-1">Use Color Lessons for Art</h4>
              <p className="text-xs text-gray-600">
                Integrate French colors with art class for natural language practice
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium text-sm mb-1">Numbers Through Games</h4>
              <p className="text-xs text-gray-600">
                Count everything! Make math time bilingual with number games
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium text-sm mb-1">Weekly Themes Work Best</h4>
              <p className="text-xs text-gray-600">
                Focus on one theme per week for deeper vocabulary retention
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const fiMetadata = (
            template as PlanTemplate & { fiMetadata?: FrenchImmersionTemplateMetadata }
          ).fiMetadata;

          return (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {template.type === 'LESSON_PLAN' ? (
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Calendar className="h-4 w-4 text-purple-600" />
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {template.type === 'LESSON_PLAN' ? 'Lesson Plan' : 'Unit Plan'}
                      </span>
                      {fiMetadata?.timeOfYear && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          {fiMetadata.timeOfYear}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-lg">{template.title}</h4>
                    {template.titleFr && (
                      <p className="text-sm text-gray-600 italic">{template.titleFr}</p>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-yellow-500">
                    <Star className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{template.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.type === 'LESSON_PLAN'
                      ? `${template.estimatedMinutes} min`
                      : `${template.estimatedWeeks} weeks`}
                  </div>
                  {fiMetadata?.frenchProficiencyLevel && (
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {fiMetadata.frenchProficiencyLevel}
                    </div>
                  )}
                </div>

                {/* Persona Match Indicator */}
                {selectedPersona && getPersonaRecommendations(template) && (
                  <div className="mb-3 p-2 bg-green-50 rounded text-xs text-green-700">
                    ✓ Recommended for your teaching style
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => onTemplateSelect(template)}
                >
                  Use This Template
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            No templates found matching your criteria. Try adjusting your filters.
          </p>
        </Card>
      )}

      {/* Help Section */}
      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-3">French Immersion Teaching Tips</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">For Jean-Luc Types:</h4>
            <p className="text-gray-700">
              Add your own cultural activities! These templates are starting points - make them come
              alive with music, art, and movement.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">For Sophie Types:</h4>
            <p className="text-gray-700">
              All templates include assessment rubrics and time estimates. Track progress
              efficiently with built-in observation tools.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">For Marie-Claire Types:</h4>
            <p className="text-gray-700">
              Start with one lesson at a time. Each template has clear steps and example phrases.
              You&apos;ve got this!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
