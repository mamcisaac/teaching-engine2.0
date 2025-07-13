import { BookOpen, Globe, Users, MessageSquare, Target, FileText } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import type {
  FrenchImmersionLessonContent,
  BilingualVocabulary,
  BilingualActivity,
} from '../../types/frenchImmersion';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';
// import BilingualTextInput from '../BilingualTextInput';

interface FrenchImmersionLessonTemplateProps {
  initialData?: Partial<FrenchImmersionLessonContent>;
  onSave: (data: FrenchImmersionLessonContent) => void | Promise<void>;
  onCancel?: () => void;
  metadata?: {
    grade: number;
    subject: string;
    theme?: string;
  };
}

export function FrenchImmersionLessonTemplate({
  initialData,
  onSave,
  onCancel,
  metadata,
}: FrenchImmersionLessonTemplateProps): React.ReactElement {
  const { register, handleSubmit } = useForm<FrenchImmersionLessonContent>({
    defaultValues: initialData ?? {
      objectivesEn: [''],
      objectivesFr: [''],
      materials: [''],
      duration: 60,
      languageFocus: {
        targetVocabulary: [],
        sentenceStructures: [''],
        grammarPoints: [''],
        pronunciationFocus: [''],
      },
      culturalConnections: {
        francophoneCulture: [''],
        canadianContent: [''],
        globalPerspectives: [''],
      },
    },
  });

  const [vocabulary, setVocabulary] = React.useState<BilingualVocabulary[]>(
    initialData?.languageFocus?.targetVocabulary ?? [],
  );

  const [homeActivities, setHomeActivities] = React.useState<BilingualActivity[]>(
    initialData?.parentCommunication?.homeActivities ?? [],
  );

  const addVocabulary = (): void => {
    setVocabulary([...vocabulary, { english: '', french: '', pronunciation: '', context: '' }]);
  };

  const updateVocabulary = (index: number, field: keyof BilingualVocabulary, value: string): void => {
    const updated = [...vocabulary];
    updated[index] = { ...updated[index], [field]: value };
    setVocabulary(updated);
  };

  const removeVocabulary = (index: number): void => {
    setVocabulary(vocabulary.filter((_, i) => i !== index));
  };

  const addHomeActivity = (): void => {
    setHomeActivities([
      ...homeActivities,
      {
        titleEn: '',
        titleFr: '',
        instructions: '',
        instructionsFr: '',
        materials: [],
        duration: '',
      },
    ]);
  };

  const onSubmit = async (data: FrenchImmersionLessonContent): Promise<void> => {
    const fullData = {
      ...data,
      languageFocus: {
        ...data.languageFocus,
        targetVocabulary: vocabulary,
      },
      parentCommunication: {
        ...data.parentCommunication,
        homeActivities,
      },
    };
    await onSave(fullData);
  };

  return (
    <form className="space-y-6" onSubmit={(e) => {
      void handleSubmit(onSubmit)(e);
    }}>
      {/* Header with Grade 1 French Immersion context */}
      <Card className="bg-gradient-to-r from-blue-50 to-red-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Grade 1 French Immersion Lesson Plan
            </h2>
            <p className="text-gray-600 mt-1">
              {metadata?.theme !== null && metadata?.theme !== undefined && metadata.theme !== ''
                ? `Theme: ${metadata.theme}`
                : 'Structured bilingual learning template'}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-3xl">🇨🇦</span>
            <span className="text-3xl">🇫🇷</span>
          </div>
        </div>
      </Card>

      {/* Bilingual Learning Objectives */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Bilingual Learning Objectives</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English Objectives
            </label>
            <textarea
              {...register('objectivesEn.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="Students will be able to..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectifs en français
            </label>
            <textarea
              {...register('objectivesFr.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="Les élèves seront capables de..."
              rows={3}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>
              Tip for {metadata?.grade === 1 ? 'Grade 1' : 'Primary'} French Immersion:
            </strong>
            Keep objectives simple and achievable. Focus on oral communication and basic vocabulary
            acquisition.
          </p>
        </div>
      </Card>

      {/* Vocabulary Development Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Vocabulary Development</h3>
        </div>

        <div className="space-y-4">
          {vocabulary.map((vocab, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-4 gap-3">
                <input
                  className="p-2 border rounded"
                  placeholder="English word"
                  type="text"
                  value={vocab.english}
                  onChange={(e) => {
 updateVocabulary(index, 'english', e.target.value); 
}}
                />
                <input
                  className="p-2 border rounded"
                  placeholder="Mot français"
                  type="text"
                  value={vocab.french}
                  onChange={(e) => {
 updateVocabulary(index, 'french', e.target.value); 
}}
                />
                <input
                  className="p-2 border rounded"
                  placeholder="Pronunciation"
                  type="text"
                  value={vocab.pronunciation !== null && vocab.pronunciation !== undefined ? vocab.pronunciation : ''}
                  onChange={(e) => {
 updateVocabulary(index, 'pronunciation', e.target.value); 
}}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 p-2 border rounded"
                    placeholder="Context/Visual"
                    type="text"
                    value={vocab.context !== null && vocab.context !== undefined ? vocab.context : ''}
                    onChange={(e) => {
 updateVocabulary(index, 'context', e.target.value); 
}}
                  />
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
 removeVocabulary(index); 
}}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button aria-label="Click button" onClick={addVocabulary}>
            + Add Vocabulary Word
          </Button>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentence Structures
            </label>
            <textarea
              {...register('languageFocus.sentenceStructures.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="Je vois un/une... / C'est..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grammar Focus (if applicable)
            </label>
            <input
              {...register('languageFocus.grammarPoints.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="un/une, les couleurs"
            />
          </div>
        </div>
      </Card>

      {/* Language Transition Activities */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Language Transition Activities</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transitioning from English to French
            </label>
            <textarea
              {...register('languageTransitions.fromEnglishToFrench.0')}
              className="w-full p-3 border rounded-lg"
              placeholder='Use visual cues, "En français, on dit...", gesture signals'
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code-switching Strategies
            </label>
            <textarea
              {...register('languageTransitions.codeswitchingStrategies.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="Use cognates, allow 'franglais' during transition, praise attempts"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Three-Part Lesson Structure */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Three-Part Lesson Structure</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minds On / Activation (10-15 minutes)
            </label>
            <textarea
              {...register('mindsOn')}
              className="w-full p-3 border rounded-lg"
              placeholder="Begin with a French song or chant. Review previous vocabulary with flashcards..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action / Application (30-40 minutes)
            </label>
            <textarea
              {...register('action')}
              className="w-full p-3 border rounded-lg"
              placeholder="Introduce new vocabulary with visuals. Practice through games and activities..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consolidation / Debrief (10-15 minutes)
            </label>
            <textarea
              {...register('consolidation')}
              className="w-full p-3 border rounded-lg"
              placeholder="Review key vocabulary. Students share one new word they learned..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Cultural Integration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Cultural Integration</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Francophone Culture
            </label>
            <textarea
              {...register('culturalConnections.francophoneCulture.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="French Canadian traditions, Acadian culture..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Canadian Content</label>
            <textarea
              {...register('culturalConnections.canadianContent.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="PEI specific content, Maritime themes..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Global Perspectives
            </label>
            <textarea
              {...register('culturalConnections.globalPerspectives.0')}
              className="w-full p-3 border rounded-lg"
              placeholder="Francophone countries, cultural comparisons..."
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Assessment in Both Languages */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold">Bilingual Assessment</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Oral French Assessment</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Can pronounce new vocabulary correctly</span>
              </label>
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Attempts to use French during activities</span>
              </label>
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Responds to simple French instructions</span>
              </label>
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Shows enthusiasm for French learning</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Comprehension Assessment</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Understands key vocabulary in context</span>
              </label>
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Can match French words to visuals</span>
              </label>
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Follows classroom routines in French</span>
              </label>
              <label className="flex items-center gap-2">
                <input className="rounded" type="checkbox" />
                <span>Makes connections between languages</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Notes</label>
          <textarea
            {...register('assessmentNotes')}
            className="w-full p-3 border rounded-lg"
            placeholder="Observations about individual student progress, language development milestones..."
            rows={2}
          />
        </div>
      </Card>

      {/* Parent Communication */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Parent Communication</h3>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Parents (English)
              </label>
              <textarea
                {...register('parentCommunication.englishMessage')}
                className="w-full p-3 border rounded-lg"
                placeholder="Today your child learned..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message aux parents (français)
              </label>
              <textarea
                {...register('parentCommunication.frenchMessage')}
                className="w-full p-3 border rounded-lg"
                placeholder="Aujourd'hui, votre enfant a appris..."
                rows={3}
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Home Activities</h4>
            {homeActivities.map((activity, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg mb-2">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    className="p-2 border rounded"
                    placeholder="Activity title (English)"
                    type="text"
                    value={activity.titleEn}
                    onChange={(e) => {
                      const updated = [...homeActivities];
                      updated[index].titleEn = e.target.value;
                      setHomeActivities(updated);
                    }}
                  />
                  <input
                    className="p-2 border rounded"
                    placeholder="Titre de l'activité (français)"
                    type="text"
                    value={activity.titleFr}
                    onChange={(e) => {
                      const updated = [...homeActivities];
                      updated[index].titleFr = e.target.value;
                      setHomeActivities(updated);
                    }}
                  />
                </div>
              </div>
            ))}

            <Button aria-label="Click button" onClick={addHomeActivity}>
              + Add Home Activity
            </Button>
          </div>
        </div>
      </Card>

      {/* Materials and Resources */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Materials and Resources</h3>
        </div>

        <div className="space-y-2">
          <textarea
            {...register('materials.0')}
            className="w-full p-3 border rounded-lg"
            placeholder="• Flashcards with vocabulary
• French picture books
• Audio resources (songs, chants)
• Visual aids and posters
• Manipulatives for counting"
            rows={3}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <Button aria-label="Click button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary">
          Save Lesson Plan
        </Button>
      </div>
    </form>
  );
}
