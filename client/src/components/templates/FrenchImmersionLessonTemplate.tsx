import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';
// import BilingualTextInput from '../BilingualTextInput';
import {
  FrenchImmersionLessonContent,
  BilingualVocabulary,
  BilingualActivity,
} from '../../types/frenchImmersion';
import { BookOpen, Globe, Users, MessageSquare, Target, FileText } from 'lucide-react';

interface FrenchImmersionLessonTemplateProps {
  initialData?: Partial<FrenchImmersionLessonContent>;
  onSave: (data: FrenchImmersionLessonContent) => void;
  onCancel?: () => void;
  metadata?: {
    grade: number;
    subject: string;
    theme?: string;
  };
}

export default function FrenchImmersionLessonTemplate({
  initialData,
  onSave,
  onCancel,
  metadata,
}: FrenchImmersionLessonTemplateProps) {
  const { register, handleSubmit } = useForm<FrenchImmersionLessonContent>({
    defaultValues: initialData || {
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
    initialData?.languageFocus?.targetVocabulary || [],
  );

  const [homeActivities, setHomeActivities] = React.useState<BilingualActivity[]>(
    initialData?.parentCommunication?.homeActivities || [],
  );

  const addVocabulary = () => {
    setVocabulary([...vocabulary, { english: '', french: '', pronunciation: '', context: '' }]);
  };

  const updateVocabulary = (index: number, field: keyof BilingualVocabulary, value: string) => {
    const updated = [...vocabulary];
    updated[index] = { ...updated[index], [field]: value };
    setVocabulary(updated);
  };

  const removeVocabulary = (index: number) => {
    setVocabulary(vocabulary.filter((_, i) => i !== index));
  };

  const addHomeActivity = () => {
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

  const onSubmit = (data: FrenchImmersionLessonContent) => {
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
    onSave(fullData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with Grade 1 French Immersion context */}
      <Card className="bg-gradient-to-r from-blue-50 to-red-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Grade 1 French Immersion Lesson Plan
            </h2>
            <p className="text-gray-600 mt-1">
              {metadata?.theme
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
              rows={3}
              placeholder="Students will be able to..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectifs en français
            </label>
            <textarea
              {...register('objectivesFr.0')}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Les élèves seront capables de..."
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
                  type="text"
                  value={vocab.english}
                  onChange={(e) => updateVocabulary(index, 'english', e.target.value)}
                  placeholder="English word"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  value={vocab.french}
                  onChange={(e) => updateVocabulary(index, 'french', e.target.value)}
                  placeholder="Mot français"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  value={vocab.pronunciation || ''}
                  onChange={(e) => updateVocabulary(index, 'pronunciation', e.target.value)}
                  placeholder="Pronunciation"
                  className="p-2 border rounded"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vocab.context || ''}
                    onChange={(e) => updateVocabulary(index, 'context', e.target.value)}
                    placeholder="Context/Visual"
                    className="flex-1 p-2 border rounded"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVocabulary(index)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addVocabulary}>
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
              rows={2}
              placeholder="Je vois un/une... / C'est..."
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
              rows={2}
              placeholder='Use visual cues, "En français, on dit...", gesture signals'
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code-switching Strategies
            </label>
            <textarea
              {...register('languageTransitions.codeswitchingStrategies.0')}
              className="w-full p-3 border rounded-lg"
              rows={2}
              placeholder="Use cognates, allow 'franglais' during transition, praise attempts"
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
              rows={3}
              placeholder="Begin with a French song or chant. Review previous vocabulary with flashcards..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action / Application (30-40 minutes)
            </label>
            <textarea
              {...register('action')}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Introduce new vocabulary with visuals. Practice through games and activities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consolidation / Debrief (10-15 minutes)
            </label>
            <textarea
              {...register('consolidation')}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Review key vocabulary. Students share one new word they learned..."
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
              rows={2}
              placeholder="French Canadian traditions, Acadian culture..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Canadian Content</label>
            <textarea
              {...register('culturalConnections.canadianContent.0')}
              className="w-full p-3 border rounded-lg"
              rows={2}
              placeholder="PEI specific content, Maritime themes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Global Perspectives
            </label>
            <textarea
              {...register('culturalConnections.globalPerspectives.0')}
              className="w-full p-3 border rounded-lg"
              rows={2}
              placeholder="Francophone countries, cultural comparisons..."
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
                <input type="checkbox" className="rounded" />
                <span>Can pronounce new vocabulary correctly</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Attempts to use French during activities</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Responds to simple French instructions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Shows enthusiasm for French learning</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Comprehension Assessment</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Understands key vocabulary in context</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Can match French words to visuals</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Follows classroom routines in French</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
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
            rows={2}
            placeholder="Observations about individual student progress, language development milestones..."
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
                rows={3}
                placeholder="Today your child learned..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message aux parents (français)
              </label>
              <textarea
                {...register('parentCommunication.frenchMessage')}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Aujourd'hui, votre enfant a appris..."
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Home Activities</h4>
            {homeActivities.map((activity, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg mb-2">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={activity.titleEn}
                    onChange={(e) => {
                      const updated = [...homeActivities];
                      updated[index].titleEn = e.target.value;
                      setHomeActivities(updated);
                    }}
                    placeholder="Activity title (English)"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={activity.titleFr}
                    onChange={(e) => {
                      const updated = [...homeActivities];
                      updated[index].titleFr = e.target.value;
                      setHomeActivities(updated);
                    }}
                    placeholder="Titre de l'activité (français)"
                    className="p-2 border rounded"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addHomeActivity}>
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
            rows={3}
            placeholder="• Flashcards with vocabulary
• French picture books
• Audio resources (songs, chants)
• Visual aids and posters
• Manipulatives for counting"
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
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
