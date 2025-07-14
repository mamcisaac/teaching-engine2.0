
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
                  value={vocab.pronunciation ? vocab.pronunciation : ''}
                  onChange={(e) => {
 updateVocabulary(index, 'pronunciation', e.target.value); 
}}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 p-2 border rounded"
                    placeholder="Context/Visual"
                    type="text"
                    value={vocab.context ? vocab.context : ''}
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
