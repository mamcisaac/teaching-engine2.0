import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import Dialog from '../Dialog';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Copy, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DuplicatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType?: 'long-range' | 'unit' | 'lesson';
  planId?: string;
  planTitle?: string;
}

export function DuplicatePlanModal({ 
  isOpen, 
  onClose, 
  planType, 
  planId, 
  planTitle 
}: DuplicatePlanModalProps) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(planType || '');
  const [selectedPlanId, setSelectedPlanId] = useState(planId || '');
  const [newTitle, setNewTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [includeSubItems, setIncludeSubItems] = useState(true);

  // Mock data - in real implementation, fetch from API
  const availablePlans = {
    'long-range': [
      { id: '1', title: 'Grade 3 Math 2024-2025', subject: 'Mathematics', grade: 3 },
      { id: '2', title: 'Grade 3 Science 2024-2025', subject: 'Science', grade: 3 },
    ],
    'unit': [
      { id: '1', title: 'Fractions and Decimals', parent: 'Grade 3 Math' },
      { id: '2', title: 'Forces and Motion', parent: 'Grade 3 Science' },
    ],
    'lesson': [
      { id: '1', title: 'Introduction to Fractions', parent: 'Fractions Unit' },
      { id: '2', title: 'Exploring Gravity', parent: 'Forces Unit' },
    ],
  };

  const duplicateMutation = useMutation({
    mutationFn: async (_data: unknown) => {
      const endpoint = {
        'long-range': '/api/long-range-plans/duplicate',
        'unit': '/api/unit-plans/duplicate',
        'lesson': '/api/etfo-lesson-plans/duplicate',
      }[selectedType];

      return api.post(endpoint, {
        sourceId: selectedPlanId,
        title: newTitle,
        notes,
        includeSubItems,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      onClose();
      // Navigate to the new plan
      const routePrefix = {
        'long-range': '/planner/long-range',
        'unit': '/planner/units',
        'lesson': '/planner/etfo-lessons',
      }[selectedType];
      window.location.href = `${routePrefix}/${response.data.id}`;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && selectedPlanId && newTitle) {
      duplicateMutation.mutate({});
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'long-range':
        return <Calendar className="h-5 w-5" />;
      case 'unit':
        return <BookOpen className="h-5 w-5" />;
      case 'lesson':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Copy className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6 max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Copy className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Duplicate Plan</h3>
            <p className="text-sm text-gray-600">
              Create a copy of an existing plan to save time
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!planType && (
            <div>
              <Label>Plan Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long-range">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Long-Range Plan
                    </div>
                  </SelectItem>
                  <SelectItem value="unit">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Unit Plan
                    </div>
                  </SelectItem>
                  <SelectItem value="lesson">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Lesson Plan
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(selectedType || planType) && !planId && (
            <div>
              <Label>Select Plan to Duplicate</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans[selectedType as keyof typeof availablePlans]?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div>
                        <div className="font-medium">{plan.title}</div>
                        {'parent' in plan && (
                          <div className="text-xs text-gray-500">{plan.parent}</div>
                        )}
                        {'subject' in plan && (
                          <div className="text-xs text-gray-500">
                            {plan.subject} • Grade {plan.grade}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {planTitle && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Duplicating:</p>
              <p className="font-medium flex items-center gap-2 mt-1">
                {getTypeIcon(planType || selectedType)}
                {planTitle}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="newTitle">New Plan Title</Label>
            <Input
              id="newTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={planTitle ? `Copy of ${planTitle}` : 'Enter new title'}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this duplicate..."
              rows={3}
              className="mt-1"
            />
          </div>

          {(selectedType === 'long-range' || selectedType === 'unit') && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeSubItems"
                checked={includeSubItems}
                onChange={(e) => setIncludeSubItems(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="includeSubItems" className="text-sm font-normal">
                Include all {selectedType === 'long-range' ? 'units' : 'lessons'} from the original plan
              </Label>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>What gets copied:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-0.5">
                <li>• All content and structure</li>
                <li>• Learning goals and expectations</li>
                <li>• Resources and materials</li>
                <li className="text-blue-600">• Dates will be adjusted to current period</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedType || !selectedPlanId || !newTitle || duplicateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate Plan'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}