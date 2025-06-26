import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Book, Target, FileText, CheckCircle } from 'lucide-react';
import { PEICurriculumAlignment, PEILearningOutcome } from '../../types/frenchImmersion';

interface PEICurriculumConnectorProps {
  grade: number;
  subject: string;
  onOutcomeSelect?: (outcome: PEILearningOutcome) => void;
  selectedOutcomes?: PEILearningOutcome[];
}

// PEI Grade 1 French Immersion Curriculum Outcomes
const PEI_GRADE1_OUTCOMES: Record<string, PEICurriculumAlignment> = {
  'French Language Arts': {
    grade: 1,
    subject: 'French Language Arts',
    strand: 'Oral Communication',
    outcomes: [
      {
        code: 'FLA-OC-1.1',
        descriptionEn: 'Listen and respond to simple oral French texts',
        descriptionFr: 'Écouter et répondre à des textes oraux simples en français',
        indicators: [
          'Follows simple classroom instructions in French',
          'Responds to basic questions with gestures or single words',
          'Demonstrates understanding through actions'
        ],
        frenchLanguageSupport: [
          'Use visual aids and gestures',
          'Repeat key vocabulary',
          'Provide wait time for processing'
        ]
      },
      {
        code: 'FLA-OC-1.2',
        descriptionEn: 'Communicate basic needs and ideas in French',
        descriptionFr: 'Communiquer des besoins et idées de base en français',
        indicators: [
          'Uses learned phrases for daily routines',
          'Attempts to express simple ideas',
          'Participates in songs and chants'
        ],
        frenchLanguageSupport: [
          'Model correct pronunciation',
          'Create safe speaking opportunities',
          'Use repetitive language structures'
        ]
      },
      {
        code: 'FLA-OC-1.3',
        descriptionEn: 'Develop French vocabulary through thematic units',
        descriptionFr: 'Développer le vocabulaire français à travers des unités thématiques',
        indicators: [
          'Recognizes and uses theme-related vocabulary',
          'Makes connections between French and English words',
          'Shows growing vocabulary through play'
        ],
        frenchLanguageSupport: [
          'Use cognates to build confidence',
          'Create word walls with visuals',
          'Practice through games and songs'
        ]
      }
    ]
  },
  'Reading and Viewing': {
    grade: 1,
    subject: 'French Language Arts',
    strand: 'Reading and Viewing',
    outcomes: [
      {
        code: 'FLA-RV-1.1',
        descriptionEn: 'Demonstrate readiness for French literacy',
        descriptionFr: 'Démontrer une préparation à la littératie française',
        indicators: [
          'Shows interest in French books',
          'Recognizes some French letters and sounds',
          'Understands that print carries meaning'
        ],
        frenchLanguageSupport: [
          'Read aloud daily in French',
          'Use predictable pattern books',
          'Connect sounds to letters explicitly'
        ]
      },
      {
        code: 'FLA-RV-1.2',
        descriptionEn: 'Begin to decode simple French words',
        descriptionFr: 'Commencer à décoder des mots français simples',
        indicators: [
          'Recognizes high-frequency French words',
          'Uses picture cues to support understanding',
          'Attempts to sound out simple words'
        ],
        frenchLanguageSupport: [
          'Focus on phonemic awareness',
          'Use word families',
          'Provide decodable texts'
        ]
      }
    ]
  },
  'Writing and Representing': {
    grade: 1,
    subject: 'French Language Arts',
    strand: 'Writing and Representing',
    outcomes: [
      {
        code: 'FLA-WR-1.1',
        descriptionEn: 'Express ideas through drawing and emergent French writing',
        descriptionFr: "Exprimer des idées par le dessin et l'écriture émergente en français",
        indicators: [
          'Labels drawings with French words',
          'Attempts to write simple French words',
          'Uses inventive spelling in French'
        ],
        frenchLanguageSupport: [
          'Accept developmental spelling',
          'Provide French word banks',
          'Model writing process'
        ]
      }
    ]
  },
  'Mathematics': {
    grade: 1,
    subject: 'Mathematics',
    strand: 'Number Sense',
    outcomes: [
      {
        code: 'MATH-NS-1.1',
        descriptionEn: 'Count to 20 in French and English',
        descriptionFr: 'Compter jusqu\'à 20 en français et en anglais',
        indicators: [
          'Counts objects in French',
          'Recognizes French number words',
          'Uses numbers in daily routines'
        ],
        frenchLanguageSupport: [
          'Use counting songs and rhymes',
          'Practice with manipulatives',
          'Integrate into calendar time'
        ]
      }
    ]
  },
  'Social Studies': {
    grade: 1,
    subject: 'Social Studies',
    strand: 'People and Communities',
    outcomes: [
      {
        code: 'SS-PC-1.1',
        descriptionEn: 'Explore Francophone communities in PEI and Canada',
        descriptionFr: 'Explorer les communautés francophones de l\'Î.-P.-É. et du Canada',
        indicators: [
          'Identifies French-speaking communities',
          'Recognizes French cultural symbols',
          'Shows respect for linguistic diversity'
        ],
        frenchLanguageSupport: [
          'Use maps and visuals',
          'Invite Francophone guests',
          'Celebrate French culture'
        ]
      }
    ]
  }
};

export default function PEICurriculumConnector({
  grade,
  subject,
  onOutcomeSelect,
  selectedOutcomes = []
}: PEICurriculumConnectorProps) {
  const [expandedStrand, setExpandedStrand] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Get relevant outcomes based on subject filter
  const getRelevantOutcomes = () => {
    if (subject === 'All' || !subject) {
      return PEI_GRADE1_OUTCOMES;
    }
    
    return Object.entries(PEI_GRADE1_OUTCOMES).reduce((acc, [key, value]) => {
      if (value.subject.toLowerCase().includes(subject.toLowerCase())) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, PEICurriculumAlignment>);
  };

  const relevantOutcomes = getRelevantOutcomes();

  const isOutcomeSelected = (outcome: PEILearningOutcome) => {
    return selectedOutcomes.some(o => o.code === outcome.code);
  };

  const toggleOutcome = (outcome: PEILearningOutcome) => {
    if (onOutcomeSelect) {
      onOutcomeSelect(outcome);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              PEI Curriculum Integration
            </h2>
            <p className="text-gray-600 mt-1">
              Grade {grade} French Immersion Learning Outcomes
            </p>
          </div>
          <div className="text-4xl">🦞</div>
        </div>
      </Card>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search outcomes..."
            className="flex-1 p-2 border rounded-lg"
          />
          <Button variant="outline" size="sm">
            Filter by Strand
          </Button>
        </div>
      </Card>

      {/* Curriculum Outcomes by Subject */}
      {Object.entries(relevantOutcomes).map(([strandName, alignment]) => (
        <Card key={strandName} className="overflow-hidden">
          <div
            className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setExpandedStrand(
              expandedStrand === strandName ? null : strandName
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Book className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{alignment.subject}</h3>
                  {alignment.strand && (
                    <p className="text-sm text-gray-600">{alignment.strand}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {alignment.outcomes.length} outcomes
                </span>
                <span className="text-gray-400">
                  {expandedStrand === strandName ? '▼' : '▶'}
                </span>
              </div>
            </div>
          </div>

          {expandedStrand === strandName && (
            <div className="p-4 space-y-4">
              {alignment.outcomes.map((outcome) => (
                <div
                  key={outcome.code}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isOutcomeSelected(outcome)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {outcome.code}
                        </span>
                        {isOutcomeSelected(outcome) && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      <h4 className="font-medium mb-1">{outcome.descriptionEn}</h4>
                      <p className="text-sm text-gray-600 italic mb-3">
                        {outcome.descriptionFr}
                      </p>

                      {outcome.indicators && outcome.indicators.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">
                            Success Indicators:
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {outcome.indicators.map((indicator, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {outcome.frenchLanguageSupport && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-yellow-900 mb-1">
                            French Language Support Strategies:
                          </h5>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            {outcome.frenchLanguageSupport.map((support, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span>💡</span>
                                {support}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant={isOutcomeSelected(outcome) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => toggleOutcome(outcome)}
                      className="ml-4"
                    >
                      {isOutcomeSelected(outcome) ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      {/* Quick Reference Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Grade 1 French Immersion Focus Areas
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Language Development Priorities:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Oral comprehension and expression</li>
              <li>• Basic vocabulary (500-800 words)</li>
              <li>• Simple sentence structures</li>
              <li>• French phonemic awareness</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">PEI Cultural Connections:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Acadian heritage and traditions</li>
              <li>• Local Francophone communities</li>
              <li>• Island French vocabulary</li>
              <li>• Maritime French culture</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Assessment Guidelines */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PEI French Immersion Assessment Guidelines
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-green-50 rounded-lg">
            <strong className="text-green-900">Formative Assessment:</strong>
            <p className="text-green-800 mt-1">
              Daily observation of oral language use, participation in French activities, 
              and willingness to take risks with the language.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <strong className="text-blue-900">Summative Assessment:</strong>
            <p className="text-blue-800 mt-1">
              Portfolio-based assessment showcasing language growth through recordings, 
              writing samples, and project work.
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <strong className="text-purple-900">Communication with Parents:</strong>
            <p className="text-purple-800 mt-1">
              Regular updates in both languages about curriculum expectations and 
              home support strategies for French language development.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}