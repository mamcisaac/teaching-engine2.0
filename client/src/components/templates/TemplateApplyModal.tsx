import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../api';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { PlanTemplate } from '../../types/template';

interface TemplateApplyModalProps {
  template: PlanTemplate;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateApplyModal({
  template,
  isOpen,
  onClose,
}: TemplateApplyModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: template.title,
    longRangePlanId: '',
    unitPlanId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Fetch long-range plans for unit templates
  const { data: longRangePlans = [] } = useQuery({
    queryKey: ['long-range-plans'],
    queryFn: async () => {
      const response = await api.get('/api/long-range-plans');
      return response.data;
    },
    enabled: template.type === 'UNIT_PLAN',
  });

  // Fetch unit plans for lesson templates
  const { data: unitPlans = [] } = useQuery({
    queryKey: ['unit-plans'],
    queryFn: async () => {
      const response = await api.get('/api/unit-plans');
      return response.data;
    },
    enabled: template.type === 'LESSON_PLAN',
  });

  // Apply template mutation
  const applyTemplateMutation = useMutation({
    mutationFn: async () => {
      const endpoint = `/api/templates/${template.id}/apply`;
      const payload = {
        title: formData.title,
        ...(template.type === 'UNIT_PLAN' && {
          longRangePlanId: formData.longRangePlanId,
          startDate: formData.startDate,
        }),
        ...(template.type === 'LESSON_PLAN' && {
          unitPlanId: formData.unitPlanId,
          date: formData.startDate,
        }),
      };

      const response = await api.post(endpoint, payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${template.type === 'UNIT_PLAN' ? 'Unit' : 'Lesson'} created from template`);
      
      // Navigate to the created plan
      if (template.type === 'UNIT_PLAN') {
        navigate(`/planner/units/${data.id}`);
      } else {
        navigate(`/planner/lessons/${data.id}`);
      }
      
      onClose();
    },
    onError: () => {
      toast.error('Failed to apply template');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (template.type === 'UNIT_PLAN' && !formData.longRangePlanId) {
      toast.error('Please select a long-range plan');
      return;
    }
    
    if (template.type === 'LESSON_PLAN' && !formData.unitPlanId) {
      toast.error('Please select a unit plan');
      return;
    }

    applyTemplateMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply Template</DialogTitle>
          <DialogDescription>
            Customize how you want to apply the &quot;{template.title}&quot; template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Long-Range Plan Selection (for unit templates) */}
          {template.type === 'UNIT_PLAN' && (
            <div>
              <label htmlFor="longRangePlan" className="block text-sm font-medium mb-1">
                Long-Range Plan
              </label>
              <Select
                value={formData.longRangePlanId}
                onValueChange={(value) => setFormData({ ...formData, longRangePlanId: value })}
              >
                <SelectTrigger id="longRangePlan">
                  <SelectValue placeholder="Select a long-range plan" />
                </SelectTrigger>
                <SelectContent>
                  {longRangePlans.map((plan: { id: string; title: string; subject: string; grade: string }) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title} - {plan.subject} (Grade {plan.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Unit Plan Selection (for lesson templates) */}
          {template.type === 'LESSON_PLAN' && (
            <div>
              <label htmlFor="unitPlan" className="block text-sm font-medium mb-1">
                Unit Plan
              </label>
              <Select
                value={formData.unitPlanId}
                onValueChange={(value) => setFormData({ ...formData, unitPlanId: value })}
              >
                <SelectTrigger id="unitPlan">
                  <SelectValue placeholder="Select a unit plan" />
                </SelectTrigger>
                <SelectContent>
                  {unitPlans.map((unit: { id: string; title: string }) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              {template.type === 'UNIT_PLAN' ? 'Start Date' : 'Date'}
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Template Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {template.type === 'UNIT_PLAN' ? (
                <FileText className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span>{template.type === 'UNIT_PLAN' ? 'Unit Plan' : 'Lesson Plan'} Template</span>
            </div>
            {template.estimatedWeeks && (
              <p className="text-sm text-gray-600">
                Duration: {template.estimatedWeeks} weeks
              </p>
            )}
            {template.estimatedMinutes && (
              <p className="text-sm text-gray-600">
                Duration: {template.estimatedMinutes} minutes
              </p>
            )}
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={applyTemplateMutation.isPending}
            >
              {applyTemplateMutation.isPending ? 'Applying...' : 'Apply Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}