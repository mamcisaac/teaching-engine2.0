
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import type { AISuggestion } from '@/hooks/useAIPlanningAssistant';
import { cn } from '@/lib/utils';

import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';

interface AISuggestionPanelProps {
  title: string;
  description?: string;
  suggestions: AISuggestion | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onAcceptSuggestion: (suggestion: string) => void;
  onAcceptAll?: () => void;
  error?: Error | null;
}

// Type guard to ensure suggestions object is valid
function isValidAISuggestion(suggestions: unknown): suggestions is AISuggestion {
  if (suggestions === null || suggestions === undefined || typeof suggestions !== 'object') {
    return false;
  }

  // Explicit type annotation to help ESLint
  const obj = suggestions as Record<string, unknown>;
  
  // Check if suggestions property exists and is an array
  if (!('suggestions' in obj) || !Array.isArray(obj.suggestions)) {
    return false;
  }

  // Check if all items in suggestions array are strings
  const suggestionsArray = obj.suggestions as unknown[];
  if (!suggestionsArray.every((item): item is string => typeof item === 'string')) {
    return false;
  }

  // Check rationale if it exists
  if ('rationale' in obj && obj.rationale !== undefined && typeof obj.rationale !== 'string') {
    return false;
  }

  // Check type property exists and is valid
  if (!('type' in obj) || typeof obj.type !== 'string') {
    return false;
  }

  const validTypes = ['goals', 'bigIdeas', 'activities', 'materials', 'assessments', 'reflections'];
  if (!validTypes.includes(obj.type as string)) {
    return false;
  }

  return true;
}

// Result type for suggestion data
interface SuggestionDataResult {
  isValid: boolean;
  suggestions: readonly string[];
  rationale: string | undefined;
}

// Helper function to safely extract suggestions data
function getSuggestionData(inputSuggestions: AISuggestion | null): SuggestionDataResult {
  // Default invalid result
  const invalidResult: SuggestionDataResult = {
    isValid: false,
    suggestions: [],
    rationale: undefined,
  };

  // Early return for null
  if (inputSuggestions === null) {
    return invalidResult;
  }

  // Type guard ensures inputSuggestions is AISuggestion
  if (!isValidAISuggestion(inputSuggestions)) {
    return invalidResult;
  }

  // Create validated result - TypeScript knows inputSuggestions is AISuggestion here
  // At this point, we know inputSuggestions satisfies the AISuggestion interface
  // ESLint has trouble tracking the type narrowing from the guard, but TypeScript handles it correctly
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const validResult: SuggestionDataResult = {
    isValid: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    suggestions: (inputSuggestions as AISuggestion).suggestions,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    rationale: (inputSuggestions as AISuggestion).rationale,
  };

  return validResult;
}

export function AISuggestionPanel({
  title,
  description,
  suggestions: rawSuggestions,
  isGenerating,
  onGenerate,
  onAcceptSuggestion,
  onAcceptAll,
  error,
}: AISuggestionPanelProps): React.ReactElement {
  const { toast } = useToast();
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Type-safe suggestion data
  const suggestionData = useMemo(() => {
    return getSuggestionData(rawSuggestions);
  }, [rawSuggestions]);
  
  const { isValid, suggestions: suggestionsList, rationale } = suggestionData;

  const handleCopy = async (suggestion: string, index: number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null); 
      }, 2000);
      toast({
        title: 'Copied',
        description: 'Suggestion copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleAccept = (suggestion: string, index: number): void => {
    onAcceptSuggestion(suggestion);
    setAcceptedIndices(new Set([...acceptedIndices, index]));
    toast({
      title: 'Accepted',
      description: 'Suggestion added to your plan',
    });
  };

  const handleAcceptAll = (): void => {
    if (onAcceptAll !== undefined && isValid) {
      onAcceptAll();
      const allIndices = new Set(suggestionsList.map((_, i) => i));
      setAcceptedIndices(allIndices);
      toast({
        title: 'All Accepted',
        description: 'All suggestions added to your plan',
      });
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {title}
            </CardTitle>
            {(description !== undefined && description !== '') && <CardDescription>{description}</CardDescription>}
          </div>
          <Button
            className="gap-2"
            disabled={isGenerating}
            size="sm"
            variant="outline"
            onClick={onGenerate}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Suggestions
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>Failed to generate suggestions. Please try again.</AlertDescription>
          </Alert>
        )}

        {isValid && suggestionsList.length > 0 && (
          <div className="space-y-3">
            {rationale !== undefined && rationale.trim() !== '' && (
              <p className="text-sm text-muted-foreground italic">{rationale}</p>
            )}

            <div className="space-y-2">
              {suggestionsList.map((suggestion, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    acceptedIndices.has(index)
                      ? 'bg-green-50 border-green-300'
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{suggestion}</p>
                    <div className="flex gap-1">
                      <Button
                        className="h-8 w-8 p-0"
                        size="sm"
                        variant="ghost"
                        onClick={(): void => {
                          void handleCopy(suggestion, index); 
                        }}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {!acceptedIndices.has(index) && (
                        <Button
                          className="h-8 w-8 p-0"
                          size="sm"
                          variant="ghost"
                          onClick={(): void => {
                            handleAccept(suggestion, index); 
                          }}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {acceptedIndices.has(index) && (
                    <Badge className="mt-2 text-xs" variant="secondary">
                      Accepted
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {Boolean(onAcceptAll) && isValid && acceptedIndices.size < suggestionsList.length && (
              <Button aria-label="Click button" onClick={handleAcceptAll}>
                Accept All Suggestions
              </Button>
            )}
          </div>
        )}

        {isValid && suggestionsList.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No suggestions generated. Try adjusting your input.</p>
          </div>
        )}

        {rawSuggestions === null && !isGenerating && error === undefined && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Click generate to get AI-powered suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
