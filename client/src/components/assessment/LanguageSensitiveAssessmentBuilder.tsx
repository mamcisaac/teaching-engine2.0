import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOutcomes } from '../../api';
import { useCreateAssessmentTemplate, useUpdateAssessmentTemplate } from '../../api';
import { AssessmentTemplate, AssessmentInput } from '../../types';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

interface LanguageSensitiveAssessmentBuilderProps {
  template?: AssessmentTemplate;
  onSuccess?: (template: AssessmentTemplate) => void;
  onCancel?: () => void;
}

interface RubricCriterion {
  name: string;
  description: string;
  levels?: Array<{
    score: number;
    description: string;
  }>;
}

const LanguageSensitiveAssessmentBuilder: React.FC<LanguageSensitiveAssessmentBuilderProps> = ({
  template,
  onSuccess,
  onCancel,
}) => {
  const { language } = useLanguage();
  const { data: outcomes = [] } = useOutcomes();
  const createMutation = useCreateAssessmentTemplate();
  const updateMutation = useUpdateAssessmentTemplate();

  const [formData, setFormData] = useState<AssessmentInput>({
    title: '',
    type: 'oral',
    description: '',
    outcomeIds: [],
    rubricCriteria: '',
  });

  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [useDefaultCriteria, setUseDefaultCriteria] = useState(true);
  const [customCriteria, setCustomCriteria] = useState<RubricCriterion[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [culturalNotes, setCulturalNotes] = useState('');

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        type: template.type,
        description: template.description || '',
        outcomeIds: template.outcomeIds,
        rubricCriteria: template.rubricCriteria || '',
      });
      setSelectedOutcomes(template.outcomeIds);

      if (template.rubricCriteria) {
        try {
          const parsedCriteria = JSON.parse(template.rubricCriteria);
          if (parsedCriteria.criteria) {
            setCustomCriteria(parsedCriteria.criteria);
            setUseDefaultCriteria(false);
          }
          if (parsedCriteria.culturalNotes) {
            setCulturalNotes(parsedCriteria.culturalNotes);
          }
        } catch (e) {
          // If parsing fails, assume it's old format
          setUseDefaultCriteria(!template.rubricCriteria);
        }
      }
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(language === 'fr' ? 'Le titre est requis' : 'Title is required');
      return;
    }

    if (selectedOutcomes.length === 0) {
      toast.error(
        language === 'fr'
          ? "Veuillez sélectionner au moins un résultat d'apprentissage"
          : 'Please select at least one learning outcome',
      );
      return;
    }

    const rubricData = {
      criteria: useDefaultCriteria ? getDefaultCriteriaArray(formData.type) : customCriteria,
      culturalNotes: culturalNotes,
      languageSensitive: true,
    };

    const assessmentData = {
      ...formData,
      outcomeIds: selectedOutcomes,
      rubricCriteria: JSON.stringify(rubricData),
    };

    try {
      if (template) {
        const updatedTemplate = await updateMutation.mutateAsync({
          id: template.id,
          data: assessmentData,
        });
        toast.success(language === 'fr' ? 'Évaluation mise à jour' : 'Assessment updated');
        onSuccess?.(updatedTemplate);
      } else {
        const newTemplate = await createMutation.mutateAsync(assessmentData);
        toast.success(language === 'fr' ? 'Évaluation créée' : 'Assessment created');
        onSuccess?.(newTemplate);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOutcomeToggle = (outcomeId: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcomeId) ? prev.filter((id) => id !== outcomeId) : [...prev, outcomeId],
    );
  };

  const getDefaultCriteriaArray = (type: AssessmentTemplate['type']): RubricCriterion[] => {
    switch (type) {
      case 'oral':
        return language === 'fr'
          ? [
              {
                name: 'Prononciation',
                description: 'Clarté et exactitude de la prononciation',
                levels: [
                  {
                    score: 4,
                    description: "Prononciation claire et précise, peu ou pas d'erreurs",
                  },
                  { score: 3, description: 'Généralement clair avec quelques erreurs mineures' },
                  { score: 2, description: 'Compréhensible mais avec des erreurs fréquentes' },
                  { score: 1, description: 'Difficile à comprendre, erreurs majeures' },
                ],
              },
              {
                name: 'Fluidité',
                description: 'Aisance et débit de parole',
                levels: [
                  { score: 4, description: "S'exprime avec aisance et naturel" },
                  { score: 3, description: 'Généralement fluide avec quelques hésitations' },
                  { score: 2, description: 'Hésitations fréquentes mais compréhensible' },
                  { score: 1, description: 'Très hésitant, difficile à suivre' },
                ],
              },
              {
                name: 'Écoute et compréhension',
                description: 'Compréhension et réponse appropriée',
                levels: [
                  { score: 4, description: 'Comprend et répond de manière appropriée et complète' },
                  {
                    score: 3,
                    description: 'Comprend bien et répond correctement la plupart du temps',
                  },
                  {
                    score: 2,
                    description: 'Comprend les idées principales, réponses parfois incomplètes',
                  },
                  {
                    score: 1,
                    description: 'Difficulté à comprendre, réponses souvent inappropriées',
                  },
                ],
              },
              {
                name: 'Vocabulaire',
                description: 'Utilisation appropriée du vocabulaire thématique',
                levels: [
                  { score: 4, description: 'Utilise un vocabulaire riche et varié' },
                  { score: 3, description: 'Bon vocabulaire avec quelques répétitions' },
                  { score: 2, description: 'Vocabulaire limité mais fonctionnel' },
                  { score: 1, description: 'Vocabulaire très limité, répétitif' },
                ],
              },
            ]
          : [
              {
                name: 'Pronunciation',
                description: 'Clarity and accuracy of pronunciation',
                levels: [
                  {
                    score: 4,
                    description: 'Clear and accurate pronunciation with few or no errors',
                  },
                  { score: 3, description: 'Generally clear with some minor errors' },
                  { score: 2, description: 'Understandable but with frequent errors' },
                  { score: 1, description: 'Difficult to understand, major errors' },
                ],
              },
              {
                name: 'Fluency',
                description: 'Ease and flow of speech',
                levels: [
                  { score: 4, description: 'Speaks with ease and natural flow' },
                  { score: 3, description: 'Generally fluent with some hesitations' },
                  { score: 2, description: 'Frequent hesitations but understandable' },
                  { score: 1, description: 'Very hesitant, difficult to follow' },
                ],
              },
              {
                name: 'Listening & Comprehension',
                description: 'Understanding and appropriate response',
                levels: [
                  {
                    score: 4,
                    description: 'Understands and responds appropriately and completely',
                  },
                  {
                    score: 3,
                    description: 'Understands well and responds correctly most of the time',
                  },
                  {
                    score: 2,
                    description: 'Understands main ideas, responses sometimes incomplete',
                  },
                  {
                    score: 1,
                    description: 'Difficulty understanding, responses often inappropriate',
                  },
                ],
              },
              {
                name: 'Vocabulary',
                description: 'Appropriate use of thematic vocabulary',
                levels: [
                  { score: 4, description: 'Uses rich and varied vocabulary' },
                  { score: 3, description: 'Good vocabulary with some repetition' },
                  { score: 2, description: 'Limited but functional vocabulary' },
                  { score: 1, description: 'Very limited, repetitive vocabulary' },
                ],
              },
            ];
      case 'writing':
        return language === 'fr'
          ? [
              {
                name: 'Vocabulaire',
                description: 'Richesse et pertinence du vocabulaire',
                levels: [
                  { score: 4, description: 'Vocabulaire riche, varié et approprié au contexte' },
                  { score: 3, description: 'Bon vocabulaire avec quelques imprécisions' },
                  { score: 2, description: 'Vocabulaire de base, quelques erreurs de sens' },
                  { score: 1, description: 'Vocabulaire très limité, erreurs fréquentes' },
                ],
              },
              {
                name: 'Orthographe',
                description: "Exactitude de l'orthographe",
                levels: [
                  { score: 4, description: "Peu ou pas d'erreurs d'orthographe" },
                  { score: 3, description: 'Quelques erreurs mineures' },
                  { score: 2, description: 'Erreurs fréquentes mais texte compréhensible' },
                  { score: 1, description: 'Nombreuses erreurs affectant la compréhension' },
                ],
              },
              {
                name: 'Structure des phrases',
                description: 'Construction et organisation des phrases',
                levels: [
                  { score: 4, description: 'Phrases complètes et bien structurées' },
                  { score: 3, description: 'Généralement bien structuré avec quelques erreurs' },
                  { score: 2, description: 'Structure simple mais claire' },
                  { score: 1, description: 'Phrases incomplètes ou mal structurées' },
                ],
              },
              {
                name: 'Organisation des idées',
                description: 'Cohérence et progression logique',
                levels: [
                  { score: 4, description: 'Idées bien organisées avec transitions claires' },
                  { score: 3, description: 'Bonne organisation générale' },
                  { score: 2, description: 'Organisation de base présente' },
                  { score: 1, description: "Peu ou pas d'organisation évidente" },
                ],
              },
            ]
          : [
              {
                name: 'Vocabulary',
                description: 'Richness and relevance of vocabulary',
                levels: [
                  { score: 4, description: 'Rich, varied vocabulary appropriate to context' },
                  { score: 3, description: 'Good vocabulary with some imprecision' },
                  { score: 2, description: 'Basic vocabulary, some meaning errors' },
                  { score: 1, description: 'Very limited vocabulary, frequent errors' },
                ],
              },
              {
                name: 'Spelling',
                description: 'Spelling accuracy',
                levels: [
                  { score: 4, description: 'Few or no spelling errors' },
                  { score: 3, description: 'Some minor errors' },
                  { score: 2, description: 'Frequent errors but text is understandable' },
                  { score: 1, description: 'Many errors affecting comprehension' },
                ],
              },
              {
                name: 'Sentence Structure',
                description: 'Sentence construction and organization',
                levels: [
                  { score: 4, description: 'Complete and well-structured sentences' },
                  { score: 3, description: 'Generally well-structured with some errors' },
                  { score: 2, description: 'Simple but clear structure' },
                  { score: 1, description: 'Incomplete or poorly structured sentences' },
                ],
              },
              {
                name: 'Organization of Ideas',
                description: 'Coherence and logical progression',
                levels: [
                  { score: 4, description: 'Well-organized ideas with clear transitions' },
                  { score: 3, description: 'Good overall organization' },
                  { score: 2, description: 'Basic organization present' },
                  { score: 1, description: 'Little or no evident organization' },
                ],
              },
            ];
      case 'reading':
        return language === 'fr'
          ? [
              {
                name: 'Compréhension',
                description: 'Compréhension du texte',
                levels: [
                  { score: 4, description: 'Comprend les détails et les inférences' },
                  {
                    score: 3,
                    description: 'Comprend bien les idées principales et certains détails',
                  },
                  { score: 2, description: 'Comprend les idées principales' },
                  { score: 1, description: 'Compréhension limitée' },
                ],
              },
              {
                name: 'Fluidité de lecture',
                description: 'Lecture fluide et rythmée',
                levels: [
                  { score: 4, description: 'Lecture fluide avec expression appropriée' },
                  { score: 3, description: 'Généralement fluide avec quelques hésitations' },
                  { score: 2, description: 'Lecture mot à mot mais régulière' },
                  { score: 1, description: 'Lecture très hésitante' },
                ],
              },
              {
                name: 'Précision',
                description: 'Exactitude de la lecture',
                levels: [
                  { score: 4, description: "Lit avec très peu d'erreurs" },
                  { score: 3, description: 'Quelques erreurs mineures' },
                  { score: 2, description: 'Erreurs fréquentes mais autocorrection' },
                  { score: 1, description: 'Nombreuses erreurs non corrigées' },
                ],
              },
              {
                name: 'Stratégies de lecture',
                description: 'Utilisation de stratégies pour comprendre',
                levels: [
                  { score: 4, description: 'Utilise diverses stratégies efficacement' },
                  { score: 3, description: 'Utilise quelques stratégies de base' },
                  { score: 2, description: 'Stratégies limitées mais présentes' },
                  { score: 1, description: 'Peu ou pas de stratégies évidentes' },
                ],
              },
            ]
          : [
              {
                name: 'Comprehension',
                description: 'Understanding of the text',
                levels: [
                  { score: 4, description: 'Understands details and inferences' },
                  { score: 3, description: 'Understands main ideas and some details well' },
                  { score: 2, description: 'Understands main ideas' },
                  { score: 1, description: 'Limited comprehension' },
                ],
              },
              {
                name: 'Reading Fluency',
                description: 'Smooth and rhythmic reading',
                levels: [
                  { score: 4, description: 'Fluent reading with appropriate expression' },
                  { score: 3, description: 'Generally fluent with some hesitations' },
                  { score: 2, description: 'Word-by-word but steady reading' },
                  { score: 1, description: 'Very hesitant reading' },
                ],
              },
              {
                name: 'Accuracy',
                description: 'Reading accuracy',
                levels: [
                  { score: 4, description: 'Reads with very few errors' },
                  { score: 3, description: 'Some minor errors' },
                  { score: 2, description: 'Frequent errors but self-corrects' },
                  { score: 1, description: 'Many uncorrected errors' },
                ],
              },
              {
                name: 'Reading Strategies',
                description: 'Use of strategies to understand',
                levels: [
                  { score: 4, description: 'Uses various strategies effectively' },
                  { score: 3, description: 'Uses some basic strategies' },
                  { score: 2, description: 'Limited but present strategies' },
                  { score: 1, description: 'Little or no evident strategies' },
                ],
              },
            ];
      case 'mixed':
        return language === 'fr'
          ? [
              {
                name: 'Communication globale',
                description: 'Capacité à communiquer efficacement',
                levels: [
                  { score: 4, description: 'Communique clairement et efficacement' },
                  { score: 3, description: 'Bonne communication générale' },
                  { score: 2, description: 'Communication de base fonctionnelle' },
                  { score: 1, description: 'Difficulté à communiquer' },
                ],
              },
              {
                name: 'Compétences intégrées',
                description: 'Intégration des compétences linguistiques',
                levels: [
                  { score: 4, description: 'Intègre toutes les compétences efficacement' },
                  { score: 3, description: 'Bonne intégration avec quelques lacunes' },
                  { score: 2, description: 'Intégration de base présente' },
                  { score: 1, description: "Peu d'intégration des compétences" },
                ],
              },
            ]
          : [
              {
                name: 'Overall Communication',
                description: 'Ability to communicate effectively',
                levels: [
                  { score: 4, description: 'Communicates clearly and effectively' },
                  { score: 3, description: 'Good overall communication' },
                  { score: 2, description: 'Basic functional communication' },
                  { score: 1, description: 'Difficulty communicating' },
                ],
              },
              {
                name: 'Integrated Skills',
                description: 'Integration of language skills',
                levels: [
                  { score: 4, description: 'Integrates all skills effectively' },
                  { score: 3, description: 'Good integration with some gaps' },
                  { score: 2, description: 'Basic integration present' },
                  { score: 1, description: 'Little skill integration' },
                ],
              },
            ];
      default:
        return [];
    }
  };

  const addCustomCriterion = () => {
    setCustomCriteria([
      ...customCriteria,
      {
        name: '',
        description: '',
        levels: [
          { score: 4, description: '' },
          { score: 3, description: '' },
          { score: 2, description: '' },
          { score: 1, description: '' },
        ],
      },
    ]);
  };

  const updateCustomCriterion = (index: number, field: string, value: string) => {
    const updated = [...customCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setCustomCriteria(updated);
  };

  const updateCriterionLevel = (
    criterionIndex: number,
    levelIndex: number,
    description: string,
  ) => {
    const updated = [...customCriteria];
    if (updated[criterionIndex].levels) {
      updated[criterionIndex].levels![levelIndex].description = description;
    }
    setCustomCriteria(updated);
  };

  const removeCustomCriterion = (index: number) => {
    setCustomCriteria(customCriteria.filter((_, i) => i !== index));
  };

  const assessmentTypes = [
    {
      value: 'oral',
      label: language === 'fr' ? 'Oral' : 'Oral',
      description:
        language === 'fr'
          ? 'Évaluation de la communication orale'
          : 'Assessment of oral communication',
    },
    {
      value: 'reading',
      label: language === 'fr' ? 'Lecture' : 'Reading',
      description:
        language === 'fr'
          ? 'Évaluation de la compréhension en lecture'
          : 'Assessment of reading comprehension',
    },
    {
      value: 'writing',
      label: language === 'fr' ? 'Écriture' : 'Writing',
      description:
        language === 'fr'
          ? 'Évaluation de la production écrite'
          : 'Assessment of written production',
    },
    {
      value: 'mixed',
      label: language === 'fr' ? 'Mixte' : 'Mixed',
      description:
        language === 'fr'
          ? 'Évaluation combinant plusieurs compétences'
          : 'Assessment combining multiple skills',
    },
  ] as const;

  // Group outcomes by subject for better organization
  const outcomesBySubject = outcomes.reduce(
    (acc, outcome) => {
      if (!acc[outcome.subject]) {
        acc[outcome.subject] = [];
      }
      acc[outcome.subject].push(outcome);
      return acc;
    },
    {} as Record<string, typeof outcomes>,
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {template
          ? language === 'fr'
            ? "Modifier le modèle d'évaluation linguistique"
            : 'Edit Language-Sensitive Assessment Template'
          : language === 'fr'
            ? "Créer un modèle d'évaluation linguistique"
            : 'Create Language-Sensitive Assessment Template'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">{language === 'fr' ? 'Titre' : 'Title'} *</Label>
          <Input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={
              language === 'fr'
                ? 'Ex: Entrevue orale - Vocabulaire familial'
                : 'Ex: Oral Interview - Family Vocabulary'
            }
            required
          />
        </div>

        {/* Assessment Type */}
        <div>
          <Label className="mb-3">
            {language === 'fr' ? "Type d'évaluation" : 'Assessment Type'} *
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {assessmentTypes.map(({ value, label, description }) => (
              <label
                key={value}
                className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  checked={formData.type === value}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as AssessmentTemplate['type'] })
                  }
                  className="sr-only"
                />
                <span className="font-medium text-lg">{label}</span>
                <span className="text-sm mt-1 opacity-80">{description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">{language === 'fr' ? 'Description' : 'Description'}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder={
              language === 'fr'
                ? "Décrivez l'évaluation, ses objectifs pédagogiques et le contexte linguistique..."
                : 'Describe the assessment, its pedagogical objectives and linguistic context...'
            }
          />
        </div>

        {/* Rubric Criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{language === 'fr' ? 'Critères de notation' : 'Rubric Criteria'}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions
                ? language === 'fr'
                  ? 'Masquer les options'
                  : 'Hide options'
                : language === 'fr'
                  ? 'Options avancées'
                  : 'Advanced options'}
            </Button>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useDefaultCriteria}
                onChange={(e) => {
                  setUseDefaultCriteria(e.target.checked);
                  if (e.target.checked) {
                    setCustomCriteria([]);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {language === 'fr'
                  ? 'Utiliser les critères adaptés au niveau Grade 1'
                  : 'Use Grade 1 adapted criteria'}
              </span>
            </label>

            {useDefaultCriteria ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-3">
                  {language === 'fr'
                    ? "Critères adaptés pour l'immersion française (Grade 1):"
                    : 'French Immersion adapted criteria (Grade 1):'}
                </p>
                <div className="space-y-4">
                  {getDefaultCriteriaArray(formData.type).map((criterion, index) => (
                    <div key={index} className="bg-white p-3 rounded-md">
                      <div className="font-medium text-gray-900">{criterion.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{criterion.description}</div>
                      {criterion.levels && (
                        <div className="mt-2 space-y-1">
                          {criterion.levels.map((level, levelIndex) => (
                            <div key={levelIndex} className="flex items-start space-x-2 text-xs">
                              <span className="font-medium text-gray-700 w-4">{level.score}:</span>
                              <span className="text-gray-600">{level.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {customCriteria.map((criterion, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={criterion.name}
                          onChange={(e) => updateCustomCriterion(index, 'name', e.target.value)}
                          placeholder={language === 'fr' ? 'Nom du critère' : 'Criterion name'}
                        />
                        <Textarea
                          value={criterion.description}
                          onChange={(e) =>
                            updateCustomCriterion(index, 'description', e.target.value)
                          }
                          placeholder={
                            language === 'fr' ? 'Description du critère' : 'Criterion description'
                          }
                          rows={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomCriterion(index)}
                        className="ml-2"
                      >
                        ×
                      </Button>
                    </div>

                    {criterion.levels && (
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs">
                          {language === 'fr' ? 'Niveaux' : 'Levels'}
                        </Label>
                        {criterion.levels.map((level, levelIndex) => (
                          <div key={levelIndex} className="flex items-center space-x-2">
                            <span className="text-sm font-medium w-8">{level.score}:</span>
                            <Input
                              value={level.description}
                              onChange={(e) =>
                                updateCriterionLevel(index, levelIndex, e.target.value)
                              }
                              placeholder={
                                language === 'fr'
                                  ? `Description niveau ${level.score}`
                                  : `Level ${level.score} description`
                              }
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomCriterion}
                  className="w-full"
                >
                  {language === 'fr' ? 'Ajouter un critère' : 'Add criterion'}
                </Button>
              </div>
            )}
          </div>

          {showAdvancedOptions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="culturalNotes">
                {language === 'fr'
                  ? 'Notes culturelles et linguistiques'
                  : 'Cultural and linguistic notes'}
              </Label>
              <Textarea
                id="culturalNotes"
                value={culturalNotes}
                onChange={(e) => setCulturalNotes(e.target.value)}
                rows={3}
                placeholder={
                  language === 'fr'
                    ? 'Ajoutez des considérations culturelles ou linguistiques spécifiques pour cette évaluation...'
                    : 'Add specific cultural or linguistic considerations for this assessment...'
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                {language === 'fr'
                  ? "Ces notes aideront à adapter l'évaluation au contexte culturel des élèves."
                  : "These notes will help adapt the assessment to students' cultural context."}
              </p>
            </div>
          )}
        </div>

        {/* Linked Outcomes */}
        <div>
          <Label className="mb-3">
            {language === 'fr' ? "Résultats d'apprentissage liés" : 'Linked Learning Outcomes'} *
          </Label>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {Object.keys(outcomesBySubject).length === 0 ? (
              <p className="text-gray-500 text-sm p-4">
                {language === 'fr'
                  ? "Aucun résultat d'apprentissage disponible"
                  : 'No learning outcomes available'}
              </p>
            ) : (
              Object.entries(outcomesBySubject).map(([subject, subjectOutcomes]) => (
                <div key={subject} className="border-b border-gray-100 last:border-0">
                  <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700">
                    {subject}
                  </div>
                  <div className="p-2">
                    {subjectOutcomes.map((outcome) => (
                      <label
                        key={outcome.id}
                        className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOutcomes.includes(outcome.id)}
                          onChange={() => handleOutcomeToggle(outcome.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {outcome.code}
                            </span>
                            {outcome.domain && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                {outcome.domain}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                            {outcome.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          {selectedOutcomes.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {selectedOutcomes.length}{' '}
              {language === 'fr' ? 'résultat(s) sélectionné(s)' : 'outcome(s) selected'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1"
          >
            {createMutation.isPending || updateMutation.isPending
              ? language === 'fr'
                ? 'Sauvegarde...'
                : 'Saving...'
              : template
                ? language === 'fr'
                  ? 'Mettre à jour'
                  : 'Update'
                : language === 'fr'
                  ? 'Créer le modèle'
                  : 'Create Template'}
          </Button>

          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LanguageSensitiveAssessmentBuilder;
