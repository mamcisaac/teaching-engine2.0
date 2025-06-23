import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  useOutcomes,
  useGeneratePrompts,
  GeneratedPrompt,
  PromptGenerationResult,
} from '../../api';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Loader2, Copy, PlusCircle, Lightbulb, MessageSquare, Brain, Users } from 'lucide-react';
import { toast } from 'sonner';

interface PromptGeneratorPanelProps {
  selectedOutcomeId?: string;
  onOutcomeSelect?: (outcomeId: string) => void;
  onPromptInsert?: (prompt: string, outcomeId: string) => void;
  onPromptCopy?: (prompt: string) => void;
}

const PromptGeneratorPanel: React.FC<PromptGeneratorPanelProps> = ({
  selectedOutcomeId,
  onOutcomeSelect,
  onPromptInsert,
  onPromptCopy,
}) => {
  const { language, setLanguage } = useLanguage();
  const { data: outcomes = [] } = useOutcomes();
  const generatePromptsMutation = useGeneratePrompts();

  const [activeOutcomeId, setActiveOutcomeId] = useState<string>(selectedOutcomeId || '');
  const [generatedPrompts, setGeneratedPrompts] = useState<PromptGenerationResult | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Get unique subjects for filtering
  const subjects = Array.from(new Set(outcomes.map((outcome) => outcome.subject))).sort();

  // Filter outcomes by subject
  const filteredOutcomes = outcomes.filter(
    (outcome) => filterSubject === 'all' || outcome.subject === filterSubject,
  );

  const handleGeneratePrompts = useCallback(() => {
    if (!activeOutcomeId) {
      toast.error(
        language === 'fr'
          ? "Veuillez sélectionner un résultat d'apprentissage."
          : 'Please select a learning outcome.',
      );
      return;
    }

    setGeneratedPrompts(null);

    generatePromptsMutation.mutate(
      {
        outcomeId: activeOutcomeId,
        language,
      },
      {
        onSuccess: (result) => {
          setGeneratedPrompts(result);
          toast.success(
            language === 'fr'
              ? `${result.prompts.length} invites générées avec succès`
              : `${result.prompts.length} prompts generated successfully`,
          );
        },
      },
    );
  }, [activeOutcomeId, language, generatePromptsMutation]);

  const handleOutcomeChange = useCallback(
    (outcomeId: string) => {
      setActiveOutcomeId(outcomeId);
      onOutcomeSelect?.(outcomeId);
      setGeneratedPrompts(null); // Clear previous results
    },
    [onOutcomeSelect],
  );

  const handleCopyPrompt = useCallback(
    (prompt: string) => {
      navigator.clipboard.writeText(prompt);
      onPromptCopy?.(prompt);
      toast.success(
        language === 'fr' ? 'Invite copiée dans le presse-papiers' : 'Prompt copied to clipboard',
      );
    },
    [language, onPromptCopy],
  );

  const handleInsertPrompt = useCallback(
    (prompt: string) => {
      if (!activeOutcomeId) return;
      onPromptInsert?.(prompt, activeOutcomeId);
      toast.success(language === 'fr' ? 'Invite ajoutée au plan' : 'Prompt added to plan');
    },
    [activeOutcomeId, onPromptInsert],
  );

  const getPromptTypeIcon = (type: GeneratedPrompt['type']) => {
    switch (type) {
      case 'open_question':
        return <Lightbulb className="h-4 w-4" />;
      case 'sentence_stem':
        return <MessageSquare className="h-4 w-4" />;
      case 'discussion':
        return <Users className="h-4 w-4" />;
      case 'metacognitive':
        return <Brain className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPromptTypeLabel = (type: GeneratedPrompt['type']) => {
    if (language === 'fr') {
      switch (type) {
        case 'open_question':
          return 'Question ouverte';
        case 'sentence_stem':
          return 'Amorce de phrase';
        case 'discussion':
          return 'Discussion';
        case 'metacognitive':
          return 'Métacognitif';
        default:
          return type;
      }
    } else {
      switch (type) {
        case 'open_question':
          return 'Open Question';
        case 'sentence_stem':
          return 'Sentence Stem';
        case 'discussion':
          return 'Discussion';
        case 'metacognitive':
          return 'Metacognitive';
        default:
          return type;
      }
    }
  };

  const getPromptTypeColor = (type: GeneratedPrompt['type']) => {
    switch (type) {
      case 'open_question':
        return 'bg-blue-100 text-blue-800';
      case 'sentence_stem':
        return 'bg-green-100 text-green-800';
      case 'discussion':
        return 'bg-purple-100 text-purple-800';
      case 'metacognitive':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {language === 'fr'
              ? "Générateur d'Invites Pédagogiques"
              : 'Pedagogical Prompt Generator'}
          </CardTitle>
          <CardDescription>
            {language === 'fr'
              ? "Générez des questions et invites alignées sur les résultats d'apprentissage pour soutenir l'évaluation formative."
              : 'Generate outcome-aligned questions and prompts to support formative assessment.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Filter */}
            <div className="space-y-2">
              <Label htmlFor="subject-filter">{language === 'fr' ? 'Matière' : 'Subject'}</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger id="subject-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Toutes les matières' : 'All Subjects'}
                  </SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Outcome Selection */}
            <div className="space-y-2">
              <Label htmlFor="outcome-select">
                {language === 'fr' ? "Résultat d'apprentissage" : 'Learning Outcome'}
              </Label>
              <Select value={activeOutcomeId} onValueChange={handleOutcomeChange}>
                <SelectTrigger id="outcome-select">
                  <SelectValue
                    placeholder={
                      language === 'fr' ? 'Choisir un résultat...' : 'Choose an outcome...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredOutcomes.map((outcome) => (
                    <SelectItem key={outcome.id} value={outcome.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{outcome.code}</span>
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {outcome.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Toggle */}
            <div className="space-y-2">
              <Label htmlFor="language-select">{language === 'fr' ? 'Langue' : 'Language'}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr')}>
                <SelectTrigger id="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePrompts}
            disabled={generatePromptsMutation.isPending || !activeOutcomeId}
            className="w-full"
          >
            {generatePromptsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === 'fr' ? 'Générer les invites' : 'Generate Prompts'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Prompts */}
      {generatedPrompts && (
        <div className="space-y-4">
          {/* Outcome Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{generatedPrompts.outcome.code}</CardTitle>
                  <CardDescription className="mt-1">
                    {generatedPrompts.outcome.description}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {language === 'fr' ? 'Niveau' : 'Grade'} {generatedPrompts.outcome.grade} •{' '}
                  {generatedPrompts.outcome.subject}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Prompts by Type */}
          {generatedPrompts.prompts.length > 0 ? (
            <div className="grid gap-4">
              {['open_question', 'sentence_stem', 'discussion', 'metacognitive'].map((type) => {
                const typePrompts = generatedPrompts.prompts.filter((p) => p.type === type);
                if (typePrompts.length === 0) return null;

                return (
                  <Card key={type}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getPromptTypeIcon(type as GeneratedPrompt['type'])}
                        {getPromptTypeLabel(type as GeneratedPrompt['type'])}
                        <Badge className={getPromptTypeColor(type as GeneratedPrompt['type'])}>
                          {typePrompts.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {typePrompts.map((prompt, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <p className="text-sm flex-1 pr-4">{prompt.text}</p>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyPrompt(prompt.text)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {onPromptInsert && (
                                <Button size="sm" onClick={() => handleInsertPrompt(prompt.text)}>
                                  <PlusCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {prompt.context && (
                            <p className="text-xs text-gray-500 mt-2">{prompt.context}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                {language === 'fr'
                  ? 'Aucune invite générée pour ce résultat.'
                  : 'No prompts generated for this outcome.'}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptGeneratorPanel;
