import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

import { apiClient } from '../../api/core/client';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { useToast } from '../ui/use-toast';

interface AISuggestedActivity {
  id: number;
  expectationId: string; // Updated for ETFO alignment
  userId: number;
  title: string;
  descriptionFr: string;
  descriptionEn?: string;
  materials: string[];
  duration: number;
  theme?: string;
  createdAt: string;
  updatedAt: string;
}

interface AISuggestionModalProps {
  suggestion: AISuggestedActivity;
  open: boolean;
  onClose: () => void;
  onAddToWeek?: (activity: AISuggestedActivity) => void;
}

export function AISuggestionModal({
  suggestion,
  open,
  onClose,
  onAddToWeek,
}: AISuggestionModalProps): React.ReactElement {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState({
    title: suggestion.title,
    descriptionFr: suggestion.descriptionFr,
    descriptionEn: suggestion.descriptionEn || '',
    materials: suggestion.materials.join(', '),
    duration: suggestion.duration,
    theme: suggestion.theme || '',
  });

  // Delete suggestion mutation
  const deleteSuggestion = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/ai-suggestions/suggestions/${suggestion.id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['uncovered-outcomes'] });
      toast({
        title: 'Suggestion deleted',
        description: 'The AI suggestion has been removed.',
      });
      onClose();
    },
  });

  // Save to library (for future implementation)
  const saveToLibrary = (): void => {
    toast({
      title: 'Saved to library',
      description: 'This activity has been saved for future use.',
      variant: 'default',
    });
  };

  const handleAddToWeek = (): void => {
    if (onAddToWeek) {
      // If editing, create a modified version
      const activityToAdd = isEditing
        ? {
            ...suggestion,
            title: editedSuggestion.title,
            descriptionFr: editedSuggestion.descriptionFr,
            descriptionEn: editedSuggestion.descriptionEn,
            materials: editedSuggestion.materials
              .split(',')
              .map((m) => m.trim())
              .filter((m): m is string => m && !m= ''),
            duration: editedSuggestion.duration,
            theme: editedSuggestion.theme,
          }
        : suggestion;

      onAddToWeek(activityToAdd);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Suggested Activity</DialogTitle>
          <DialogDescription>
            Review and customize this AI-generated activity before adding it to your plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            {isEditing ? (
              <Input
                id="title"
                value={editedSuggestion.title}
                onChange={(e) => {
 setEditedSuggestion({
                    ...editedSuggestion,
                    title: e.target.value,
                  }); 
}
                }
              />
            ) : (
              <p className="text-sm font-medium">{suggestion.title}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="duration">
