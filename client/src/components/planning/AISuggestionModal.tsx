import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { useToast } from '../ui/use-toast';

interface AISuggestedActivity {
  id: number;
  outcomeId: string;
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
}: AISuggestionModalProps) {
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
      queryClient.invalidateQueries({ queryKey: ['uncovered-outcomes'] });
      toast({
        title: 'Suggestion deleted',
        description: 'The AI suggestion has been removed.',
      });
      onClose();
    },
  });

  // Save to library (for future implementation)
  const saveToLibrary = () => {
    toast({
      title: 'Saved to library',
      description: 'This activity has been saved for future use.',
      variant: 'default',
    });
  };

  const handleAddToWeek = () => {
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
              .filter(Boolean),
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
                onChange={(e) =>
                  setEditedSuggestion({
                    ...editedSuggestion,
                    title: e.target.value,
                  })
                }
              />
            ) : (
              <p className="text-sm font-medium">{suggestion.title}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <span>⏰</span>
              Duration (minutes)
            </Label>
            {isEditing ? (
              <Input
                id="duration"
                type="number"
                value={editedSuggestion.duration}
                onChange={(e) =>
                  setEditedSuggestion({
                    ...editedSuggestion,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
              />
            ) : (
              <p className="text-sm">{suggestion.duration} minutes</p>
            )}
          </div>

          {/* French Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionFr">Description (Français)</Label>
            {isEditing ? (
              <Textarea
                id="descriptionFr"
                rows={4}
                value={editedSuggestion.descriptionFr}
                onChange={(e) =>
                  setEditedSuggestion({
                    ...editedSuggestion,
                    descriptionFr: e.target.value,
                  })
                }
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{suggestion.descriptionFr}</p>
            )}
          </div>

          {/* English Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionEn">Description (English)</Label>
            {isEditing ? (
              <Textarea
                id="descriptionEn"
                rows={3}
                value={editedSuggestion.descriptionEn}
                onChange={(e) =>
                  setEditedSuggestion({
                    ...editedSuggestion,
                    descriptionEn: e.target.value,
                  })
                }
                placeholder="Optional English description for teacher reference"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap text-gray-600">
                {suggestion.descriptionEn || 'No English description provided'}
              </p>
            )}
          </div>

          {/* Materials */}
          <div className="space-y-2">
            <Label htmlFor="materials" className="flex items-center gap-2">
              <span>📦</span>
              Materials Needed
            </Label>
            {isEditing ? (
              <Input
                id="materials"
                value={editedSuggestion.materials}
                onChange={(e) =>
                  setEditedSuggestion({
                    ...editedSuggestion,
                    materials: e.target.value,
                  })
                }
                placeholder="Comma-separated list of materials"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestion.materials.map((material, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                    {material}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Theme */}
          {(suggestion.theme || isEditing) && (
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              {isEditing ? (
                <Input
                  id="theme"
                  value={editedSuggestion.theme}
                  onChange={(e) =>
                    setEditedSuggestion({
                      ...editedSuggestion,
                      theme: e.target.value,
                    })
                  }
                  placeholder="Optional theme connection"
                />
              ) : (
                <p className="text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                    {suggestion.theme}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              onClick={() => deleteSuggestion.mutate()}
              disabled={deleteSuggestion.isPending}
            >
              <span className="mr-2">🗑️</span>
              Discard
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveToLibrary}>
              <span className="mr-2">🔖</span>
              Save to Library
            </Button>
            <Button onClick={handleAddToWeek}>
              <span className="mr-2">+</span>
              Add to Week Plan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default AISuggestionModal;
