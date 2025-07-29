
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';

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

export function AISuggestionPanel({
  title,
  description,
  suggestions,
  isGenerating,
  onGenerate,
  onAcceptSuggestion,
  onAcceptAll,
  error,
}: AISuggestionPanelProps): React.ReactElement {
  const { toast } = useToast();
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (suggestion: string, index: number): void => {
    void navigator.clipboard.writeText(suggestion);
    setCopiedIndex(index);
    setTimeout((): void => {
 setCopiedIndex(null); 
}, 2000);
    toast({
      title: 'Copied',
      description: 'Suggestion copied to clipboard',
    });
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
    if (onAcceptAll !== undefined && suggestions !== null) {
      onAcceptAll();
      const allIndices = new Set(suggestions.suggestions.map((_, i) => i));
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

        {suggestions !== null && suggestions.suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.rationale !== undefined && suggestions.rationale.trim() !== '' && (
              <p className="text-sm text-muted-foreground italic">{suggestions.rationale}</p>
            )}

            <div className="space-y-2">
              {suggestions.suggestions.map((suggestion: string, index: number) => (
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
                        onClick={() => {
 handleCopy(suggestion, index); 
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
                          onClick={() => {
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

            {onAcceptAll !== undefined && acceptedIndices.size < suggestions.suggestions.length && (
              <Button aria-label="Click button" onClick={handleAcceptAll}>
                Accept All Suggestions
              </Button>
            )}
          </div>
        )}

        {suggestions !== null && suggestions.suggestions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No suggestions generated. Try adjusting your input.</p>
          </div>
        )}

        {suggestions === null && !isGenerating && error === undefined && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Click generate to get AI-powered suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
