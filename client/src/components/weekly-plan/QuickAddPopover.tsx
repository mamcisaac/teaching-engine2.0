import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Clock, BookOpen, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/card';
import { useCreateETFOLessonPlan, useUnitPlans } from '../../hooks/useETFOPlanning';

interface QuickAddPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  time: string;
  subject: string;
}

// Quick templates for common lesson types
const QUICK_TEMPLATES = [
  { name: 'Morning Circle', duration: 15, type: 'routine' },
  { name: 'Transition Activity', duration: 5, type: 'transition' },
  { name: 'Assessment Block', duration: 30, type: 'assessment' },
  { name: 'Reading Period', duration: 45, type: 'reading' },
  { name: 'Math Workshop', duration: 60, type: 'workshop' },
];

export function QuickAddPopover({ 
  isOpen, 
  onClose, 
  date, 
  time, 
  subject 
}: QuickAddPopoverProps): React.ReactElement | null {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const { data: unitPlans = [] } = useUnitPlans({});
  const createMutation = useCreateETFOLessonPlan();
  
  // Find matching unit plan for the subject
  const matchingUnit = unitPlans.find(unit => 
    unit.longRangePlan?.subject === subject &&
    new Date(date) >= new Date(unit.startDate) &&
    new Date(date) <= new Date(unit.endDate)
  );

  const [formData, setFormData] = useState({
    title: '',
    titleFr: '',
    duration: 45,
    unitPlanId: matchingUnit?.id || '',
    learningGoals: '',
    mindsOn: '',
    action: '',
    consolidation: '',
    materials: '',
    isSubFriendly: false,
  });

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (matchingUnit) {
      setFormData(prev => ({ ...prev, unitPlanId: matchingUnit.id }));
    }
  }, [matchingUnit]);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: typeof QUICK_TEMPLATES[0]) => {
    setSelectedTemplate(template.name);
    setFormData(prev => ({
      ...prev,
      title: template.name,
      duration: template.duration,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    if (!formData.unitPlanId) {
      toast.error('No matching unit plan found for this date and subject');
      return;
    }

    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync({
        ...formData,
        date,
        startTime: time,
        materials: formData.materials.split('\n').filter(m => m.trim()),
      });
      
      toast.success('Lesson created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create lesson');
      console.error('Error creating lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasteDetection = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Simple detection for lesson plan format
    if (pastedText.includes('Objective:') || pastedText.includes('Materials:')) {
      e.preventDefault();
      
      // Parse the pasted content
      const lines = pastedText.split('\n');
      const title = lines[0]?.trim() || '';
      const materials = lines.find(l => l.includes('Materials:'))?.replace('Materials:', '').trim() || '';
      
      setFormData(prev => ({
        ...prev,
        title,
        materials,
      }));
      
      toast.info('Lesson content detected and parsed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Quick Add Lesson</h2>
              <p className="text-sm text-gray-600 mt-1">
                {subject} • {format(new Date(date), 'EEEE, MMMM d')} • {time}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Templates */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Templates:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => handleTemplateSelect(template)}
                  className={`
                    px-3 py-1 text-sm rounded-full border transition-all
                    ${selectedTemplate === template.name 
                      ? 'bg-blue-100 border-blue-300 text-blue-800' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  {template.name} ({template.duration}m)
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  Lesson Title (English)
                </label>
                <Input
                  ref={titleInputRef}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  onPaste={handlePasteDetection}
                  placeholder="e.g., Introduction to Addition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  Titre (Français)
                </label>
                <Input
                  value={formData.titleFr}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleFr: e.target.value }))}
                  placeholder="e.g., Introduction à l'addition"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="5"
                  max="120"
                  step="5"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Unit Plan
                </label>
                <Input
                  value={matchingUnit?.title || 'No matching unit'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Goals
              </label>
              <Textarea
                value={formData.learningGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, learningGoals: e.target.value }))}
                placeholder="What will students learn?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minds On
                </label>
                <Textarea
                  value={formData.mindsOn}
                  onChange={(e) => setFormData(prev => ({ ...prev, mindsOn: e.target.value }))}
                  placeholder="Opening activity"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <Textarea
                  value={formData.action}
                  onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                  placeholder="Main activity"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consolidation
                </label>
                <Textarea
                  value={formData.consolidation}
                  onChange={(e) => setFormData(prev => ({ ...prev, consolidation: e.target.value }))}
                  placeholder="Closing activity"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materials (one per line)
              </label>
              <Textarea
                value={formData.materials}
                onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                placeholder="Chart paper&#10;Markers&#10;Student notebooks"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSubFriendly}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSubFriendly: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  <Users className="inline h-4 w-4 mr-1" />
                  Sub-friendly lesson
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Creating...' : 'Create Lesson'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}