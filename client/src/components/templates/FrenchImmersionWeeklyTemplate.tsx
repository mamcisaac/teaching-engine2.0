import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/Button';
import { Calendar, BookOpen, Target, Users, Lightbulb } from 'lucide-react';
import { BilingualVocabulary, LanguageWeekFocus } from '../../types/frenchImmersion';

interface WeeklyPlanData {
  weekNumber: number;
  theme: string;
  themeFr: string;
  weekFocus: LanguageWeekFocus;
  dailyPlans: DailyPlan[];
  assessmentFocus: string;
  parentUpdate: {
    english: string;
    french: string;
  };
}

interface DailyPlan {
  day: string;
  languageTarget: string;
  mainActivity: string;
  vocabulary: string[];
  culturalNote?: string;
}

interface FrenchImmersionWeeklyTemplateProps {
  initialData?: Partial<WeeklyPlanData>;
  onSave: (data: WeeklyPlanData) => void;
  onCancel?: () => void;
  metadata?: {
    grade: number;
    month: string;
    weekNumber: number;
  };
}

export default function FrenchImmersionWeeklyTemplate({
  initialData,
  onSave,
  onCancel,
  metadata,
}: FrenchImmersionWeeklyTemplateProps) {
  const [weekData, setWeekData] = React.useState<WeeklyPlanData>({
    weekNumber: metadata?.weekNumber || 1,
    theme: initialData?.theme || '',
    themeFr: initialData?.themeFr || '',
    weekFocus: initialData?.weekFocus || {
      vocabulary: [],
      structures: [],
      communicationGoals: [],
      culturalElements: [],
    },
    dailyPlans: initialData?.dailyPlans || [
      { day: 'Monday', languageTarget: '', mainActivity: '', vocabulary: [] },
      { day: 'Tuesday', languageTarget: '', mainActivity: '', vocabulary: [] },
      { day: 'Wednesday', languageTarget: '', mainActivity: '', vocabulary: [] },
      { day: 'Thursday', languageTarget: '', mainActivity: '', vocabulary: [] },
      { day: 'Friday', languageTarget: '', mainActivity: '', vocabulary: [] },
    ],
    assessmentFocus: initialData?.assessmentFocus || '',
    parentUpdate: initialData?.parentUpdate || { english: '', french: '' },
  });

  const updateDailyPlan = (dayIndex: number, field: keyof DailyPlan, value: string | string[]) => {
    const updated = { ...weekData };
    updated.dailyPlans[dayIndex] = {
      ...updated.dailyPlans[dayIndex],
      [field]: value,
    };
    setWeekData(updated);
  };

  const addVocabularyToWeek = () => {
    const newVocab: BilingualVocabulary = {
      english: '',
      french: '',
      pronunciation: '',
      context: '',
    };
    setWeekData({
      ...weekData,
      weekFocus: {
        ...weekData.weekFocus,
        vocabulary: [...weekData.weekFocus.vocabulary, newVocab],
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(weekData);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daysFr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-red-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Grade 1 French Immersion Weekly Plan
            </h2>
            <p className="text-gray-600 mt-1">
              {metadata?.month
                ? `${metadata.month} - Week ${metadata.weekNumber}`
                : 'Structured weekly planning template'}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      {/* Weekly Theme */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">Weekly Theme / Thème de la semaine</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme (English)</label>
            <input
              type="text"
              value={weekData.theme}
              onChange={(e) => setWeekData({ ...weekData, theme: e.target.value })}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., My Family"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thème (français)</label>
            <input
              type="text"
              value={weekData.themeFr}
              onChange={(e) => setWeekData({ ...weekData, themeFr: e.target.value })}
              className="w-full p-3 border rounded-lg"
              placeholder="ex: Ma famille"
            />
          </div>
        </div>
      </Card>

      {/* Language Focus for the Week */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Language Focus for the Week</h3>
        </div>

        <div className="space-y-4">
          {/* Core Vocabulary */}
          <div>
            <h4 className="font-medium mb-2">Core Vocabulary</h4>
            <div className="space-y-2">
              {weekData.weekFocus.vocabulary.map((vocab, index) => (
                <div key={index} className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={vocab.english}
                    onChange={(e) => {
                      const updated = [...weekData.weekFocus.vocabulary];
                      updated[index].english = e.target.value;
                      setWeekData({
                        ...weekData,
                        weekFocus: { ...weekData.weekFocus, vocabulary: updated },
                      });
                    }}
                    placeholder="English"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={vocab.french}
                    onChange={(e) => {
                      const updated = [...weekData.weekFocus.vocabulary];
                      updated[index].french = e.target.value;
                      setWeekData({
                        ...weekData,
                        weekFocus: { ...weekData.weekFocus, vocabulary: updated },
                      });
                    }}
                    placeholder="Français"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={vocab.pronunciation || ''}
                    onChange={(e) => {
                      const updated = [...weekData.weekFocus.vocabulary];
                      updated[index].pronunciation = e.target.value;
                      setWeekData({
                        ...weekData,
                        weekFocus: { ...weekData.weekFocus, vocabulary: updated },
                      });
                    }}
                    placeholder="Pronunciation"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={vocab.context || ''}
                    onChange={(e) => {
                      const updated = [...weekData.weekFocus.vocabulary];
                      updated[index].context = e.target.value;
                      setWeekData({
                        ...weekData,
                        weekFocus: { ...weekData.weekFocus, vocabulary: updated },
                      });
                    }}
                    placeholder="Context"
                    className="p-2 border rounded"
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addVocabularyToWeek}>
                + Add Vocabulary
              </Button>
            </div>
          </div>

          {/* Language Structures */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Language Structures
            </label>
            <textarea
              value={weekData.weekFocus.structures.join('\n')}
              onChange={(e) =>
                setWeekData({
                  ...weekData,
                  weekFocus: {
                    ...weekData.weekFocus,
                    structures: e.target.value.split('\n').filter((s) => s.trim()),
                  },
                })
              }
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="C'est mon/ma...
J'ai...
Il/Elle s'appelle..."
            />
          </div>

          {/* Communication Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Goals
            </label>
            <textarea
              value={weekData.weekFocus.communicationGoals.join('\n')}
              onChange={(e) =>
                setWeekData({
                  ...weekData,
                  weekFocus: {
                    ...weekData.weekFocus,
                    communicationGoals: e.target.value.split('\n').filter((s) => s.trim()),
                  },
                })
              }
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Introduce family members in French
Ask and answer simple questions about family
Use possessive adjectives correctly"
            />
          </div>
        </div>
      </Card>

      {/* Daily Plans */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Daily Language Plans</h3>
        </div>

        <div className="space-y-4">
          {weekData.dailyPlans.map((dayPlan, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span>{days[index]}</span>
                <span className="text-gray-500">/ {daysFr[index]}</span>
              </h4>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Daily Language Target</label>
                  <input
                    type="text"
                    value={dayPlan.languageTarget}
                    onChange={(e) => updateDailyPlan(index, 'languageTarget', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Introduce 'maman' and 'papa'"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Main Activity</label>
                  <input
                    type="text"
                    value={dayPlan.mainActivity}
                    onChange={(e) => updateDailyPlan(index, 'mainActivity', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Family photo sharing circle"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm text-gray-600 mb-1">Focus Vocabulary</label>
                <input
                  type="text"
                  value={dayPlan.vocabulary.join(', ')}
                  onChange={(e) =>
                    updateDailyPlan(
                      index,
                      'vocabulary',
                      e.target.value
                        .split(',')
                        .map((v) => v.trim())
                        .filter((v) => v),
                    )
                  }
                  className="w-full p-2 border rounded"
                  placeholder="maman, papa, famille"
                />
              </div>

              {index === 2 && ( // Wednesday - Cultural Wednesday
                <div className="mt-3 p-3 bg-purple-50 rounded">
                  <label className="block text-sm font-medium text-purple-800 mb-1">
                    Cultural Wednesday Special
                  </label>
                  <input
                    type="text"
                    value={dayPlan.culturalNote || ''}
                    onChange={(e) => updateDailyPlan(index, 'culturalNote', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Explore French-Canadian family traditions"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Grade 1 Tip:</strong> Keep daily targets achievable. Focus on 3-5 new words per
            day with lots of repetition through songs, games, and movement activities.
          </p>
        </div>
      </Card>

      {/* Cross-Curricular Connections */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Cross-Curricular French Integration</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 font-medium text-sm">
                <span className="text-xl">🔢</span> Mathematics
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                placeholder="Count family members in French (1-10)"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium text-sm">
                <span className="text-xl">🔬</span> Science
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                placeholder="Describe family traits in French (grand/petit)"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium text-sm">
                <span className="text-xl">🎨</span> Arts
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                placeholder="Create family portraits with French labels"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 font-medium text-sm">
                <span className="text-xl">📚</span> Literacy
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                placeholder="Read 'Ma famille' picture books"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium text-sm">
                <span className="text-xl">🌍</span> Social Studies
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                placeholder="Compare families in PEI and Quebec"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium text-sm">
                <span className="text-xl">🏃</span> Phys Ed
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                placeholder="Play 'Jacques a dit' (Simon Says)"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Assessment Focus */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold">Weekly Assessment Focus</h3>
        </div>

        <textarea
          value={weekData.assessmentFocus}
          onChange={(e) => setWeekData({ ...weekData, assessmentFocus: e.target.value })}
          className="w-full p-3 border rounded-lg"
          rows={3}
          placeholder="Observe oral participation in French activities
Note pronunciation attempts and improvements
Track vocabulary retention through games
Document comfort level with French instructions"
        />

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">😊</div>
            <div className="text-xs font-medium">Exceeding</div>
            <div className="text-xs text-gray-600">Uses French spontaneously</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-1">🙂</div>
            <div className="text-xs font-medium">Meeting</div>
            <div className="text-xs text-gray-600">Participates willingly</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-1">😐</div>
            <div className="text-xs font-medium">Approaching</div>
            <div className="text-xs text-gray-600">Needs encouragement</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-1">🤔</div>
            <div className="text-xs font-medium">Beginning</div>
            <div className="text-xs text-gray-600">Observing quietly</div>
          </div>
        </div>
      </Card>

      {/* Parent Update */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Weekly Parent Update</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">English Version</label>
            <textarea
              value={weekData.parentUpdate.english}
              onChange={(e) =>
                setWeekData({
                  ...weekData,
                  parentUpdate: { ...weekData.parentUpdate, english: e.target.value },
                })
              }
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="This week we are learning about families in French! 
Your child will learn to say family member names...
At home, you can practice by..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version française
            </label>
            <textarea
              value={weekData.parentUpdate.french}
              onChange={(e) =>
                setWeekData({
                  ...weekData,
                  parentUpdate: { ...weekData.parentUpdate, french: e.target.value },
                })
              }
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Cette semaine, nous apprenons sur les familles en français!
Votre enfant apprendra à dire les noms des membres de la famille...
À la maison, vous pouvez pratiquer en..."
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-teal-50 rounded-lg">
          <h4 className="font-medium text-teal-900 mb-2">Quick Home Activities:</h4>
          <ul className="text-sm text-teal-800 space-y-1">
            <li>• Label family photos with French names</li>
            <li>• Practice counting family members in French</li>
            <li>• Sing the weekly French song together</li>
            <li>• Use French greetings at home (Bonjour, Bonsoir)</li>
          </ul>
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
          Save Weekly Plan
        </Button>
      </div>
    </form>
  );
}
