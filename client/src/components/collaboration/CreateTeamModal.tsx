/**
 * CreateTeamModal Component
 * Modal for creating a new teaching team
 */

import React, { useState } from 'react';
import { X, Users, Lock, Globe } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamFormData {
  name: string;
  description: string;
  grade?: number;
  subject?: string;
  schoolName?: string;
  schoolBoard?: string;
  isPublic: boolean;
  requiresApproval: boolean;
}

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
const SUBJECTS = [
  'All Subjects',
  'French Language Arts',
  'Mathematics',
  'Science',
  'Social Studies',
  'Arts',
  'Physical Education',
  'Health',
  'Music',
  'Technology',
];

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    isPublic: false,
    requiresApproval: true,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const response = await api.post('/api/teams', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: 'Team created!',
        description: `${data.name} has been created successfully.`,
      });
      onClose();
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Please try again later';
      toast({
        title: 'Failed to create team',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      requiresApproval: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Team name required',
        description: 'Please enter a name for your team',
        variant: 'destructive',
      });
      return;
    }

    createTeamMutation.mutate({
      ...formData,
      grade: formData.grade ? Number(formData.grade) : undefined,
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Create New Team</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Name */}
        <div className="mb-4">
          <Label htmlFor="name">Team Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Grade 1 French Immersion Team"
            className="mt-1"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What is this team about? What are your goals?"
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Team Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="grade">Grade Level</Label>
            <Select
              value={formData.grade?.toString() || ''}
              onValueChange={(value) =>
                setFormData({ ...formData, grade: value ? Number(value) : undefined })
              }
            >
              <option value="">Any Grade</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject Focus</Label>
            <Select
              value={formData.subject || ''}
              onValueChange={(value) => setFormData({ ...formData, subject: value || undefined })}
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* School Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="schoolName">School Name</Label>
            <Input
              id="schoolName"
              value={formData.schoolName || ''}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="Optional"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="schoolBoard">School Board</Label>
            <Input
              id="schoolBoard"
              value={formData.schoolBoard || ''}
              onChange={(e) => setFormData({ ...formData, schoolBoard: e.target.value })}
              placeholder="Optional"
              className="mt-1"
            />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Privacy Settings</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formData.isPublic ? (
                  <Globe className="w-4 h-4 text-blue-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <span className="text-sm font-medium">Public Team</span>
                  <p className="text-xs text-gray-500">
                    {formData.isPublic
                      ? 'Anyone can discover and request to join'
                      : 'Only invited members can join'}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPublic}
                onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>

            {formData.isPublic && (
              <div className="flex items-center justify-between pl-6">
                <div>
                  <span className="text-sm font-medium">Require Approval</span>
                  <p className="text-xs text-gray-500">Admin approval needed for new members</p>
                </div>
                <Switch
                  checked={formData.requiresApproval}
                  onChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={createTeamMutation.isPending} className="flex-1">
            {createTeamMutation.isPending ? (
              'Creating...'
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Create Team
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
