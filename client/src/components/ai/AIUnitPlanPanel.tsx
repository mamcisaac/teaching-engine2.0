import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Plus, 
  BookOpen, 
  Target, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useAIPlanningAssistant } from '../../hooks/useAIPlanningAssistant';
import { useAIStatus, useAIFeature } from '../../hooks/useAIStatus';
import { AILoadingIndicator, AI_LOADING_PRESETS } from './AILoadingIndicator';
import { WithAIErrorBoundary } from './AIErrorBoundary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface UnitPlanSuggestion {
  type: 'bigIdeas' | 'learningGoals' | 'activities' | 'assessments' | 'materials' | 'vocabulary';
  content: string[];
  rationale?: string;
}

interface AIUnitPlanPanelProps {
  unitTitle?: string;
  subject?: string;
  grade?: number;
  duration?: number;
  curriculumExpectations?: Array<{
    id: string;
    code: string;
    description: string;
    strand: string;
  }>;
  onSuggestionAccepted?: (type: string, content: string[]) => void;
  onUnitGenerated?: (unitPlan: {
    title: string;
    subject: string;
    grade: number;
    duration: number;
    bigIdeas: string[];
    learningGoals: string[];
    focusAreas: string[];
    generatedAt: Date;
  }) => void;
  className?: string;
}

export function AIUnitPlanPanel({
  unitTitle = '',
  subject = '',
  grade = 1,
  duration = 2,
  curriculumExpectations = [],
  onSuggestionAccepted,
  onUnitGenerated,
  className = '',
}: AIUnitPlanPanelProps) {
  const { toast } = useToast();
  const { canUseAI, aiDisabledReason } = useAIStatus();
  const { available: _planGenerationAvailable } = useAIFeature('planGeneration');
  
  // Local state for form inputs
  const [formData, setFormData] = useState({
    unitTitle: unitTitle,
    subject: subject,
    grade: grade.toString(),
    duration: duration.toString(),
    focusAreas: [] as string[],
    teachingApproach: 'balanced' as 'inquiry' | 'direct' | 'balanced',
    additionalContext: '',
  });

  // AI suggestion states
  const [suggestions, setSuggestions] = useState<UnitPlanSuggestion[]>([]);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // AI hooks
  const { generateUnitBigIdeas } = useAIPlanningAssistant();

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFocusArea = () => {
    const newArea = (document.getElementById('newFocusArea') as HTMLInputElement)?.value?.trim();
    if (newArea && !formData.focusAreas.includes(newArea)) {
      handleInputChange('focusAreas', [...formData.focusAreas, newArea]);
      (document.getElementById('newFocusArea') as HTMLInputElement).value = '';
    }
  };

  const removeFocusArea = (area: string) => {
    handleInputChange('focusAreas', formData.focusAreas.filter(a => a !== area));
  };

  const generateSuggestions = useCallback(async (type: UnitPlanSuggestion['type']) => {
    if (!canUseAI) {
      toast({
        title: 'AI Unavailable',
        description: aiDisabledReason || 'AI features are currently unavailable.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.unitTitle || !formData.subject) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a unit title and subject before generating suggestions.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setShowLoadingModal(true);
    setLoadingStep('analyze');

    try {
      let result;
      
      switch (type) {
        case 'bigIdeas':
          result = await generateUnitBigIdeas.mutateAsync({
            unitTitle: formData.unitTitle,
            subject: formData.subject,
            grade: parseInt(formData.grade),
            curriculumExpectations: curriculumExpectations.map(exp => exp.description),
            duration: parseInt(formData.duration),
          });
          break;
        // Add other types as needed
        default:
          throw new Error(`Suggestion type ${type} not implemented`);
      }

      setSuggestions(prev => [
        ...prev.filter(s => s.type !== type),
        {
          type,
          content: result.suggestions,
          rationale: result.rationale,
        }
      ]);

      setActiveTab('suggestions');
      
      toast({
        title: 'Suggestions Generated',
        description: `Generated ${result.suggestions.length} ${type} suggestions.`,
      });

    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Generation Failed',
        description: (error instanceof Error ? error.message : String(error)) || 'Failed to generate suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setShowLoadingModal(false);
    }
  }, [formData, curriculumExpectations, canUseAI, aiDisabledReason, generateUnitBigIdeas, toast]);

  const generateCompleteUnit = useCallback(async () => {
    if (!canUseAI) {
      toast({
        title: 'AI Unavailable',
        description: aiDisabledReason || 'AI features are currently unavailable.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setShowLoadingModal(true);

    try {
      // Generate all components sequentially
      const steps = AI_LOADING_PRESETS.GENERATING_UNIT_PLAN.steps;
      
      for (let i = 0; i < steps.length; i++) {
        setLoadingStep(steps[i].id);
        
        switch (steps[i].id) {
          case 'analyze':
            // Analyze curriculum expectations
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          case 'generate':
            // Generate big ideas
            await generateSuggestions('bigIdeas');
            break;
          case 'structure':
            // Generate learning goals and activities
            await generateSuggestions('learningGoals');
            await generateSuggestions('activities');
            break;
          case 'finalize':
            // Generate assessments and materials
            await generateSuggestions('assessments');
            await generateSuggestions('materials');
            break;
        }
      }

      // Construct complete unit plan
      const unitPlan = {
        title: formData.unitTitle,
        subject: formData.subject,
        grade: parseInt(formData.grade),
        duration: parseInt(formData.duration),
        focusAreas: formData.focusAreas,
        teachingApproach: formData.teachingApproach,
        curriculumExpectations: curriculumExpectations,
        bigIdeas: suggestions.find(s => s.type === 'bigIdeas')?.content || [],
        learningGoals: suggestions.find(s => s.type === 'learningGoals')?.content || [],
        activities: suggestions.find(s => s.type === 'activities')?.content || [],
        assessments: suggestions.find(s => s.type === 'assessments')?.content || [],
        materials: suggestions.find(s => s.type === 'materials')?.content || [],
        generatedAt: new Date(),
      };

      if (onUnitGenerated) {
        onUnitGenerated(unitPlan);
      }

      toast({
        title: 'Unit Plan Generated',
        description: 'Complete unit plan has been generated successfully.',
      });

      setActiveTab('review');

    } catch (error) {
      console.error('Error generating complete unit:', error);
      toast({
        title: 'Generation Failed',
        description: (error instanceof Error ? error.message : String(error)) || 'Failed to generate complete unit plan.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setShowLoadingModal(false);
    }
  }, [formData, curriculumExpectations, suggestions, canUseAI, aiDisabledReason, generateSuggestions, onUnitGenerated, toast]);

  const acceptSuggestion = (suggestionType: string, content: string) => {
    const key = `${suggestionType}-${content}`;
    setAcceptedSuggestions(prev => new Set([...prev, key]));
    
    if (onSuggestionAccepted) {
      onSuggestionAccepted(suggestionType, [content]);
    }

    toast({
      title: 'Suggestion Accepted',
      description: 'The suggestion has been added to your unit plan.',
    });
  };

  const copySuggestion = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Suggestion copied to clipboard.',
    });
  };

  if (!canUseAI) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gray-400" />
            AI Unit Plan Assistant
          </CardTitle>
          <CardDescription>
            AI features are currently unavailable. {aiDisabledReason}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Continue creating your unit plan manually using the form fields above.</p>
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
            AI Unit Plan Assistant
          </CardTitle>
          <CardDescription>
            Generate comprehensive unit plans with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">Setup</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitTitle">Unit Title</Label>
                  <Input
                    id="unitTitle"
                    value={formData.unitTitle}
                    onChange={(e) => handleInputChange('unitTitle', e.target.value)}
                    placeholder="e.g., Forces and Motion"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Language Arts">Language Arts</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Health and Physical Education">Health and Physical Education</SelectItem>
                      <SelectItem value="The Arts">The Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                        <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="teachingApproach">Teaching Approach</Label>
                <Select 
                  value={formData.teachingApproach} 
                  onValueChange={(value: 'inquiry' | 'direct' | 'balanced') => handleInputChange('teachingApproach', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inquiry">Inquiry-Based Learning</SelectItem>
                    <SelectItem value="direct">Direct Instruction</SelectItem>
                    <SelectItem value="balanced">Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="focusAreas">Focus Areas</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="newFocusArea"
                    placeholder="Add focus area (e.g., Scientific Method)"
                    onKeyPress={(e) => e.key === 'Enter' && addFocusArea()}
                  />
                  <Button type="button" onClick={addFocusArea} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.focusAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {area}
                      <button
                        onClick={() => removeFocusArea(area)}
                        className="text-xs hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additionalContext">Additional Context</Label>
                <Textarea
                  id="additionalContext"
                  value={formData.additionalContext}
                  onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                  placeholder="Any additional context, special considerations, or requirements..."
                  rows={3}
                />
              </div>

              {curriculumExpectations.length > 0 && (
                <div>
                  <Label>Curriculum Expectations ({curriculumExpectations.length})</Label>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {curriculumExpectations.map((exp, _index) => (
                      <div key={exp.id} className="text-sm p-2 bg-gray-50 rounded">
                        <span className="font-medium">{exp.code}:</span> {exp.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={generateCompleteUnit} 
                  disabled={isGenerating || !formData.unitTitle || !formData.subject}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Complete Unit Plan
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => generateSuggestions('bigIdeas')}
                  disabled={isGenerating}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Big Ideas
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => generateSuggestions('activities')}
                  disabled={isGenerating}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Activities
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No suggestions generated yet. Use the Setup tab to generate AI suggestions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <Card key={`${suggestion.type}-${index}`}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize flex items-center gap-2">
                          {suggestion.type === 'bigIdeas' && <Lightbulb className="h-4 w-4" />}
                          {suggestion.type === 'activities' && <BookOpen className="h-4 w-4" />}
                          {suggestion.type === 'assessments' && <Target className="h-4 w-4" />}
                          {suggestion.type.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                        {suggestion.rationale && (
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
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copySuggestion(item)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    {!isAccepted ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => acceptSuggestion(suggestion.type, item)}
                                        className="h-8 w-8 p-0"
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

            <TabsContent value="review" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>Review tab will show the complete generated unit plan.</p>
                <p className="text-sm">Generate suggestions first to see the full plan here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Loading Modal */}
      <AILoadingIndicator
        isOpen={showLoadingModal}
        onCancel={() => {
          setShowLoadingModal(false);
          setIsGenerating(false);
        }}
        state={isGenerating ? 'processing' : 'waiting'}
        currentStepId={loadingStep}
        {...AI_LOADING_PRESETS.GENERATING_UNIT_PLAN}
        canCancel={true}
      />
    </WithAIErrorBoundary>
  );
}