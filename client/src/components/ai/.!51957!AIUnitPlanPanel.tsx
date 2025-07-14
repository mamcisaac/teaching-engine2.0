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
import React, { useState, useCallback } from 'react';

import { useAIPlanningAssistant } from '../../hooks/useAIPlanningAssistant';
import { useAIStatus, useAIFeature } from '../../hooks/useAIStatus';
import { logger } from '../../utils/logger';
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
  curriculumExpectations?: {
    id: string;
    code: string;
    description: string;
    strand: string;
  }[];
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
}: AIUnitPlanPanelProps): React.ReactElement {
  const { toast } = useToast();
  const { canUseAI, aiDisabledReason } = useAIStatus();
  const { available: _planGenerationAvailable } = useAIFeature('planGeneration');
  
  // Local state for form inputs
  const [formData, setFormData] = useState({
    unitTitle,
    subject,
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

  const handleInputChange = (field: string, value: string | string[]): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFocusArea = (): void => {
    const newArea = (document.getElementById('newFocusArea') as HTMLInputElement).value.trim();
    if (newArea && !formData.focusAreas.includes(newArea)) {
      handleInputChange('focusAreas', [...formData.focusAreas, newArea]);
      (document.getElementById('newFocusArea') as HTMLInputElement).value = '';
    }
  };

  const removeFocusArea = (area: string): void => {
    handleInputChange('focusAreas', formData.focusAreas.filter(a => a !== area));
  };

  const generateSuggestions = useCallback(async (type: UnitPlanSuggestion['type']): Promise<void> => {
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
      let result: { suggestions: string[]; rationale?: string };
      
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
          rationale: result.rationale || '',
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
        description: getErrorMessage(_error) || 'Failed to generate suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setShowLoadingModal(false);
    }
  }, [formData, curriculumExpectations, canUseAI, aiDisabledReason, generateUnitBigIdeas, toast]);

  const generateCompleteUnit = useCallback(async (): Promise<void> => {
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
      const {steps} = AI_LOADING_PRESETS.GENERATING_UNIT_PLAN;
      
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
        curriculumExpectations,
        bigIdeas: suggestions.find(s => s.type === 'bigIdeas')?.content ?? [],
        learningGoals: suggestions.find(s => s.type === 'learningGoals')?.content ?? [],
        activities: suggestions.find(s => s.type === 'activities')?.content ?? [],
        assessments: suggestions.find(s => s.type === 'assessments')?.content ?? [],
        materials: suggestions.find(s => s.type === 'materials')?.content ?? [],
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

    } catch (_error) {
      logger.error('Error generating complete unit:', _error);
      toast({
        title: 'Generation Failed',
        description: getErrorMessage(_error) || 'Failed to generate complete unit plan.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setShowLoadingModal(false);
    }
  }, [formData, curriculumExpectations, suggestions, canUseAI, aiDisabledReason, generateSuggestions, onUnitGenerated, toast]);

  const acceptSuggestion = (suggestionType: string, content: string): void => {
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

  const copySuggestion = (content: string): void => {
    void navigator.clipboard.writeText(content);
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
          <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">Setup</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="input">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitTitle">Unit Title</Label>
                  <Input
                    id="unitTitle"
                    placeholder="e.g., Forces and Motion"
                    value={formData.unitTitle}
                    onChange={(e) => {
 handleInputChange('unitTitle', e.target.value); 
}}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject} onValueChange={(value) => {
 handleInputChange('subject', value); 
}}>
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
                  <Select value={formData.grade} onValueChange={(value) => {
 handleInputChange('grade', value); 
}}>
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
                    max="20"
                    min="1"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => {
 handleInputChange('duration', e.target.value); 
}}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="teachingApproach">Teaching Approach</Label>
                <Select 
                  value={formData.teachingApproach} 
                  onValueChange={(value: 'inquiry' | 'direct' | 'balanced') => {
 handleInputChange('teachingApproach', value); 
}}
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
                  <Button aria-label="Click button" onClick={addFocusArea}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.focusAreas.map((area, index) => (
                    <Badge key={index} className="gap-1" variant="secondary">
                      {area}
                      <button
                        className="text-xs hover:text-red-500"
                        onClick={() => {
 removeFocusArea(area); 
}}
                      >
