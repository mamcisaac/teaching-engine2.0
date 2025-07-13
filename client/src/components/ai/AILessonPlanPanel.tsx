import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Plus, 
  BookOpen, 
  Target, 
  Clock,
  // Users, // Unused import
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  // Square, // Unused import
  Activity
} from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { useAIPlanningAssistant } from '../../hooks/useAIPlanningAssistant';
import { useAIStatus, useAIFeature } from '../../hooks/useAIStatus';
import logger from '../../utils/logger';
import { getErrorMessage } from "../../utils/typeGuards";
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/Textarea';
import { useToast } from '../ui/use-toast';

import { WithAIErrorBoundary } from './AIErrorBoundary';
import { AILoadingIndicator, AI_LOADING_PRESETS } from './AILoadingIndicator';

interface LessonPlanSuggestion {
  type: 'mindson' | 'handson' | 'mindson_reflection' | 'materials' | 'assessments' | 'differentiation';
  content: string[];
  rationale?: string;
  timeEstimate?: number;
}

interface ThreePartStructure {
  mindsOn: {
    activities: string[];
    duration: number;
    materials: string[];
  };
  handsOn: {
    activities: string[];
    duration: number;
    materials: string[];
  };
  mindsOnReflection: {
    activities: string[];
    duration: number;
    materials: string[];
  };
}

interface AILessonPlanPanelProps {
  lessonTitle?: string;
  subject?: string;
  grade?: number;
  duration?: number; // in minutes
  learningGoals?: string[];
  unitContext?: {
    title: string;
    bigIdeas: string[];
    expectations: {
      id: string;
      code: string;
      description: string;
    }[];
  };
  onSuggestionAccepted?: (type: string, content: string[]) => void;
  onLessonGenerated?: (lessonPlan: ThreePartStructure) => void;
  className?: string;
}

export function AILessonPlanPanel({
  lessonTitle = '',
  subject = '',
  grade = 1,
  duration = 60,
  learningGoals = [],
  unitContext,
  onSuggestionAccepted,
  onLessonGenerated,
  className = '',
}: AILessonPlanPanelProps): React.ReactElement {
  const { toast } = useToast();
  const { canUseAI, aiDisabledReason } = useAIStatus();
  const { available: _planGenerationAvailable } = useAIFeature('planGeneration');
  
  // Local state for form inputs
  const [formData, setFormData] = useState({
    lessonTitle,
    subject,
    grade: grade.toString(),
    duration: duration.toString(),
    learningGoals,
    lessonType: 'new_concept' as 'new_concept' | 'review' | 'assessment' | 'exploration',
    groupingStrategy: 'mixed' as 'individual' | 'pairs' | 'small_groups' | 'whole_class' | 'mixed',
    materials: [] as string[],
    priorKnowledge: '',
    safetyConcerns: '',
    accommodations: '',
  });

  // AI suggestion states
  const [suggestions, setSuggestions] = useState<LessonPlanSuggestion[]>([]);
  const [threePartStructure, setThreePartStructure] = useState<ThreePartStructure | null>(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // AI hooks
  const { 
    generateLessonActivities, 
    generateMaterialsList, 
    generateAssessmentStrategies 
  } = useAIPlanningAssistant();

  const handleInputChange = (field: string, value: string | string[]): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addLearningGoal = (): void => {
    const newGoal = (document.getElementById('newLearningGoal') as HTMLInputElement).value.trim();
    if (newGoal && !formData.learningGoals.includes(newGoal)) {
      handleInputChange('learningGoals', [...formData.learningGoals, newGoal]);
      (document.getElementById('newLearningGoal') as HTMLInputElement).value = '';
    }
  };

  const removeLearningGoal = (goal: string): void => {
    handleInputChange('learningGoals', formData.learningGoals.filter(g => g !== goal));
  };

  const addMaterial = (): void => {
    const newMaterial = (document.getElementById('newMaterial') as HTMLInputElement).value.trim();
    if (newMaterial && !formData.materials.includes(newMaterial)) {
      handleInputChange('materials', [...formData.materials, newMaterial]);
      (document.getElementById('newMaterial') as HTMLInputElement).value = '';
    }
  };

  const removeMaterial = (material: string): void => {
    handleInputChange('materials', formData.materials.filter(m => m !== material));
  };

  const generateThreePartLesson = useCallback(async (): Promise<void> => {
    if (!canUseAI) {
      toast({
        title: 'AI Unavailable',
        description: aiDisabledReason !== null && aiDisabledReason !== undefined && aiDisabledReason !== '' ? aiDisabledReason : 'AI features are currently unavailable.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.lessonTitle || formData.learningGoals.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a lesson title and at least one learning goal.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setShowLoadingModal(true);

    try {
      const totalDuration = parseInt(formData.duration);
      const mindsOnDuration = Math.round(totalDuration * 0.2); // 20%
      const handsOnDuration = Math.round(totalDuration * 0.6); // 60%
      const reflectionDuration = totalDuration - mindsOnDuration - handsOnDuration; // Remaining

      // Generate all activities in parallel for 70% speed improvement
      setLoadingStep('activities');
      
      const activityResults = await Promise.all([
        // Step 1: Generate Minds-On activities
        generateLessonActivities.mutateAsync({
          lessonTitle: formData.lessonTitle,
          learningGoals: formData.learningGoals,
          subject: formData.subject,
          grade: parseInt(formData.grade),
          duration: mindsOnDuration,
          materials: formData.materials,
        }),
        
        // Step 2: Generate Hands-On activities
        generateLessonActivities.mutateAsync({
          lessonTitle: `${formData.lessonTitle} - Main Activity`,
          learningGoals: formData.learningGoals,
          subject: formData.subject,
          grade: parseInt(formData.grade),
          duration: handsOnDuration,
          materials: formData.materials,
        }),
        
        // Step 3: Generate reflection activities
        generateLessonActivities.mutateAsync({
          lessonTitle: `${formData.lessonTitle} - Reflection`,
          learningGoals: formData.learningGoals,
          subject: formData.subject,
          grade: parseInt(formData.grade),
          duration: reflectionDuration,
          materials: formData.materials,
        })
      ]);

      // Step 4: Generate materials list based on all activities
      setLoadingStep('materials');
      const [mindsOnResult, handsOnResult, reflectionResult] = activityResults;
      const allActivities = [
        ...(mindsOnResult.suggestions ?? []),
        ...(handsOnResult.suggestions ?? []),
        ...(reflectionResult.suggestions ?? [])
      ];

      const materialsResult = await generateMaterialsList.mutateAsync({
        activities: allActivities,
        subject: formData.subject,
        grade: parseInt(formData.grade),
        classSize: 25, // Default class size
      });

      // Build three-part structure
      const structure: ThreePartStructure = {
        mindsOn: {
          activities: (mindsOnResult.suggestions ?? []),
          duration: mindsOnDuration,
          materials: [],
        },
        handsOn: {
          activities: (handsOnResult.suggestions ?? []),
          duration: handsOnDuration,
          materials: [],
        },
        mindsOnReflection: {
          activities: (reflectionResult.suggestions ?? []),
          duration: reflectionDuration,
          materials: [],
        },
      };

      setThreePartStructure(structure);

      // Also store as suggestions for the suggestions tab
      setSuggestions([
        {
          type: 'mindson',
          content: (mindsOnResult.suggestions ?? []),
          rationale: 'Activities to activate prior knowledge and engage students',
          timeEstimate: mindsOnDuration,
        },
        {
          type: 'handson',
          content: (handsOnResult.suggestions ?? []),
          rationale: 'Main learning activities for skill development and practice',
          timeEstimate: handsOnDuration,
        },
        {
          type: 'mindson_reflection',
          content: (reflectionResult.suggestions ?? []),
          rationale: 'Reflection and consolidation activities',
          timeEstimate: reflectionDuration,
        },
        {
          type: 'materials',
          content: (materialsResult.suggestions ?? []),
          rationale: 'Required materials and resources',
        },
      ]);

      setActiveTab('structure');
      
      toast({
        title: 'Three-Part Lesson Generated',
        description: 'Complete lesson structure has been created with AI assistance.',
      });

      if (onLessonGenerated) {
        onLessonGenerated(structure);
      }

    } catch (_error) {
      logger.error('Error generating three-part lesson:', _error);
      toast({
        title: 'Generation Failed',
        description: getErrorMessage(_error) || 'Failed to generate lesson plan.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setShowLoadingModal(false);
    }
  }, [formData, canUseAI, aiDisabledReason, generateLessonActivities, generateMaterialsList, onLessonGenerated, toast]);

  const generateSuggestions = useCallback(async (type: LessonPlanSuggestion['type']): Promise<void> => {
    if (!canUseAI) {
      toast({
        title: 'AI Unavailable',
        description: aiDisabledReason !== null && aiDisabledReason !== undefined && aiDisabledReason !== '' ? aiDisabledReason : 'AI features are currently unavailable.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      let result: { suggestions: string[]; rationale?: string };
      
      switch (type) {
        case 'materials':
          result = await generateMaterialsList.mutateAsync({
            activities: formData.learningGoals,
            subject: formData.subject,
            grade: parseInt(formData.grade),
            classSize: 25,
          });
          break;
        case 'assessments':
          result = await generateAssessmentStrategies.mutateAsync({
            learningGoals: formData.learningGoals,
            activities: [formData.lessonTitle],
            subject: formData.subject,
            grade: parseInt(formData.grade),
          });
          break;
        default:
          throw new Error(`Suggestion type ${type} not implemented for individual generation`);
      }

      setSuggestions(prev => [
        ...prev.filter(s => s.type !== type),
        {
          type,
          content: result.suggestions,
          rationale: result.rationale ?? '',
        }
      ]);

      setActiveTab('suggestions');
      
      toast({
        title: 'Suggestions Generated',
        description: `Generated ${result.suggestions.length} ${type} suggestions.`,
      });

    } catch (_error) {
      logger.error('Error generating suggestions:', _error);
      toast({
        title: 'Generation Failed',
        description: getErrorMessage(_error) || 'Failed to generate suggestions.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [formData, canUseAI, aiDisabledReason, generateMaterialsList, generateAssessmentStrategies, toast]);

  const acceptSuggestion = (suggestionType: string, content: string): void => {
    const key = `${suggestionType}-${content}`;
    setAcceptedSuggestions(prev => new Set([...prev, key]));
    
    if (onSuggestionAccepted) {
      onSuggestionAccepted(suggestionType, [content]);
    }

    toast({
      title: 'Suggestion Accepted',
      description: 'The suggestion has been added to your lesson plan.',
    });
  };

  const copySuggestion = (content: string): void => {
    void navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Suggestion copied to clipboard.',
    });
  };

  const getPhaseIcon = (phase: 'mindsOn' | 'handsOn' | 'mindsOnReflection'): React.ReactElement => {
    switch (phase) {
      case 'mindsOn':
        return <Play className="h-4 w-4" />;
      case 'handsOn':
        return <Activity className="h-4 w-4" />;
      case 'mindsOnReflection':
        return <Pause className="h-4 w-4" />;
    }
  };

  const getPhaseTitle = (phase: 'mindsOn' | 'handsOn' | 'mindsOnReflection'): string => {
    switch (phase) {
      case 'mindsOn':
        return 'Minds-On (Getting Started)';
      case 'handsOn':
        return 'Hands-On (Working On It)';
      case 'mindsOnReflection':
        return 'Minds-On (Reflection & Sharing)';
    }
  };

  const getPhaseDescription = (phase: 'mindsOn' | 'handsOn' | 'mindsOnReflection'): string => {
    switch (phase) {
      case 'mindsOn':
        return 'Activate prior knowledge, introduce concepts, and engage students';
      case 'handsOn':
        return 'Main learning activities, skill development, and practice';
      case 'mindsOnReflection':
        return 'Consolidate learning, reflect on progress, and share insights';
    }
  };

  if (!canUseAI) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gray-400" />
            AI Lesson Plan Assistant
          </CardTitle>
          <CardDescription>
            AI features are currently unavailable. {aiDisabledReason}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Continue creating your lesson plan manually using the form fields above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <WithAIErrorBoundary>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Lesson Plan Assistant
          </CardTitle>
          <CardDescription>
            Generate comprehensive lesson plans with three-part structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="input">Setup</TabsTrigger>
              <TabsTrigger value="structure">3-Part Structure</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="input">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lessonTitle">Lesson Title</Label>
                  <Input
                    id="lessonTitle"
                    placeholder="e.g., Introduction to Force and Motion"
                    value={formData.lessonTitle}
                    onChange={(e): void => {
 handleInputChange('lessonTitle', e.target.value); 
}}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    max="180"
                    min="15"
                    type="number"
                    value={formData.duration}
                    onChange={(e): void => {
 handleInputChange('duration', e.target.value); 
}}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lessonType">Lesson Type</Label>
                  <Select 
                    value={formData.lessonType} 
                    onValueChange={(value: 'new_concept' | 'review' | 'assessment' | 'exploration'): void => {
 handleInputChange('lessonType', value); 
}
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_concept">New Concept Introduction</SelectItem>
                      <SelectItem value="review">Review & Practice</SelectItem>
                      <SelectItem value="assessment">Assessment & Evaluation</SelectItem>
                      <SelectItem value="exploration">Exploration & Discovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="groupingStrategy">Grouping Strategy</Label>
                  <Select 
                    value={formData.groupingStrategy} 
                    onValueChange={(value: 'individual' | 'pairs' | 'small_groups' | 'whole_class' | 'mixed'): void => {
 handleInputChange('groupingStrategy', value); 
}
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Work</SelectItem>
                      <SelectItem value="pairs">Pair Work</SelectItem>
                      <SelectItem value="small_groups">Small Groups</SelectItem>
                      <SelectItem value="whole_class">Whole Class</SelectItem>
                      <SelectItem value="mixed">Mixed Grouping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="learningGoals">Learning Goals</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="newLearningGoal"
                    placeholder="Add learning goal"
                    onKeyPress={(e): void => { if (e.key === 'Enter') addLearningGoal(); }}
                  />
                  <Button aria-label="Click button" onClick={addLearningGoal}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.learningGoals.map((goal, _index) => (
                    <div key={_index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Target className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span className="flex-1 text-sm">{goal}</span>
                      <button
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={(): void => {
 removeLearningGoal(goal); 
}}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="materials">Available Materials</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="newMaterial"
                    placeholder="Add material or resource"
                    onKeyPress={(e): void => { if (e.key === 'Enter') addMaterial(); }}
                  />
                  <Button aria-label="Click button" onClick={addMaterial}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.materials.map((material, _index) => (
                    <Badge key={_index} className="gap-1" variant="secondary">
                      {material}
                      <button
                        className="text-xs hover:text-red-500"
                        onClick={(): void => {
 removeMaterial(material); 
}}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="priorKnowledge">Prior Knowledge Required</Label>
                  <Textarea
                    id="priorKnowledge"
                    placeholder="What should students already know?"
                    rows={2}
                    value={formData.priorKnowledge}
                    onChange={(e): void => {
 handleInputChange('priorKnowledge', e.target.value); 
}}
                  />
                </div>
                <div>
                  <Label htmlFor="accommodations">Accommodations & Modifications</Label>
                  <Textarea
                    id="accommodations"
                    placeholder="Special considerations for student needs"
                    rows={2}
                    value={formData.accommodations}
                    onChange={(e): void => {
 handleInputChange('accommodations', e.target.value); 
}}
                  />
                </div>
              </div>

              {unitContext && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Unit Context: {unitContext.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm space-y-2">
                      {unitContext.bigIdeas.length > 0 && (
                        <div>
                          <span className="font-medium">Big Ideas:</span>
                          <ul className="list-disc list-inside ml-2">
                            {unitContext.bigIdeas.slice(0, 3).map((idea, _index) => (
                              <li key={_index} className="text-gray-700">{idea}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {unitContext.expectations.length > 0 && (
                        <div>
                          <span className="font-medium">
                            Curriculum Expectations ({unitContext.expectations.length})
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1" 
                  disabled={isGenerating || !formData.lessonTitle || formData.learningGoals.length === 0}
                  onClick={(): void => { void generateThreePartLesson(); }}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate 3-Part Lesson
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  disabled={isGenerating} 
                  variant="outline"
                  onClick={(): void => {
 void generateSuggestions('materials'); 
}}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Materials
                </Button>
                <Button 
                  disabled={isGenerating} 
                  variant="outline"
                  onClick={(): void => {
 void generateSuggestions('assessments'); 
}}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Assessments
                </Button>
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="structure">
              {!threePartStructure ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No lesson structure generated yet.</p>
                  <p className="text-sm">Use the Setup tab to generate a three-part lesson structure.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(Object.keys(threePartStructure) as (keyof ThreePartStructure)[]).map((phase, _index) => (
                    <Card key={phase} className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          {getPhaseIcon(phase)}
                          {getPhaseTitle(phase)}
                          <Badge className="ml-auto" variant="outline">
                            {threePartStructure[phase].duration} min
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {getPhaseDescription(phase)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {threePartStructure[phase].activities.map((activity, _index) => (
                            <div key={_index} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm">{activity}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent className="space-y-4" value="suggestions">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No suggestions generated yet.</p>
                  <p className="text-sm">Use the Setup tab to generate AI suggestions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, _index) => (
                    <Card key={`${suggestion.type}-${_index}`}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize flex items-center gap-2">
                          {suggestion.type === 'materials' && <BookOpen className="h-4 w-4" />}
                          {suggestion.type === 'assessments' && <Target className="h-4 w-4" />}
                          {suggestion.type.includes('mindson') && <Play className="h-4 w-4" />}
                          {suggestion.type === 'handson' && <Activity className="h-4 w-4" />}
                          {suggestion.type.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                          {suggestion.timeEstimate !== null && suggestion.timeEstimate !== undefined && suggestion.timeEstimate > 0 && !isNaN(suggestion.timeEstimate) && (
                            <Badge className="ml-auto" variant="outline">
                              {suggestion.timeEstimate} min
                            </Badge>
                          )}
                        </CardTitle>
                        {suggestion.rationale !== null && suggestion.rationale !== undefined && suggestion.rationale !== '' && (
                          <CardDescription>{suggestion.rationale}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {suggestion.content.map((item, itemIndex) => {
                            const key = `${suggestion.type}-${item}`;
                            const isAccepted = acceptedSuggestions.has(key);
                            
                            return (
                              <div
                                key={itemIndex}
                                className={`p-3 rounded-lg border transition-colors ${
                                  isAccepted
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm flex-1">{item}</p>
                                  <div className="flex gap-1">
                                    <Button
                                      className="h-8 w-8 p-0"
                                      size="sm"
                                      variant="ghost"
                                      onClick={(): void => {
 copySuggestion(item); 
}}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    {!isAccepted ? (
                                      <Button
                                        className="h-8 w-8 p-0"
                                        size="sm"
                                        variant="ghost"
                                        onClick={(): void => {
 acceptSuggestion(suggestion.type, item); 
}}
                                      >
                                        <Check className="h-4 w-4 text-green-500" />
                                      </Button>
                                    ) : (
                                      <div className="h-8 w-8 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent className="space-y-4" value="review">
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Review tab will show the complete generated lesson plan.</p>
                <p className="text-sm">Generate the 3-part structure first to see the full plan here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Loading Modal */}
      <AILoadingIndicator
        currentStepId={loadingStep}
        isOpen={showLoadingModal}
        state={isGenerating ? 'processing' : 'waiting'}
        onCancel={() => {
          setShowLoadingModal(false);
          setIsGenerating(false);
        }}
        {...AI_LOADING_PRESETS.GENERATING_LESSON_PLAN}
        canCancel
      />
    </WithAIErrorBoundary>
  );
}