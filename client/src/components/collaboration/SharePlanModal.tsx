/**
 * SharePlanModal Component
 * Modal for sharing lesson plans, unit plans, and other teaching resources
 */

import React, { useState } from 'react';
import { X, Link, Mail, Users, Copy, Check, FileText, Download, Printer } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/Badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToPDF, exportToWord, printPlan } from '@/utils/exportUtils';

interface SharePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'long-range' | 'unit' | 'lesson' | 'daybook';
  planId: string;
  planTitle: string;
}

interface Team {
  id: string;
  name: string;
  _count: { members: number };
}

interface ShareSettings {
  canEdit: boolean;
  canCopy: boolean;
  canComment: boolean;
  canReshare: boolean;
}

export function SharePlanModal({
  isOpen,
  onClose,
  planType,
  planId,
  planTitle,
}: SharePlanModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'share' | 'export'>('share');
  const [shareMethod, setShareMethod] = useState<'email' | 'team' | 'link'>('email');
  const [email, setEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [message, setMessage] = useState('');
  const [linkExpiry, setLinkExpiry] = useState(7);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    canEdit: false,
    canCopy: true,
    canComment: true,
    canReshare: false,
  });
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch user's teams
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => api.get('/api/teams').then(res => res.data),
    enabled: isOpen,
  });

  // Share plan mutation
  const sharePlanMutation = useMutation({
    mutationFn: async (shareData: any) => {
      const response = await api.post('/api/sharing/plans', shareData);
      return response.data;
    },
    onSuccess: (data) => {
      if (shareMethod === 'link') {
        // Copy share link to clipboard
        const shareUrl = `${window.location.origin}/shared/${data.shareCode}`;
        navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        
        toast({
          title: 'Share link created!',
          description: 'The link has been copied to your clipboard.',
        });
      } else {
        toast({
          title: 'Plan shared successfully!',
          description: shareMethod === 'email' 
            ? `The plan has been shared with ${email}`
            : 'The plan has been shared with your team.',
        });
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Sharing failed',
        description: error.response?.data?.error || 'Failed to share the plan',
        variant: 'destructive',
      });
    },
  });

  const handleShare = () => {
    const baseData = {
      planType,
      planId,
      permissions: shareSettings,
      message: message.trim() || undefined,
    };

    let shareWith;
    switch (shareMethod) {
      case 'email':
        if (!email) {
          toast({
            title: 'Email required',
            description: 'Please enter an email address',
            variant: 'destructive',
          });
          return;
        }
        shareWith = { type: 'user', email };
        break;

      case 'team':
        if (!selectedTeamId) {
          toast({
            title: 'Team required',
            description: 'Please select a team',
            variant: 'destructive',
          });
          return;
        }
        shareWith = { type: 'team', teamId: selectedTeamId };
        break;

      case 'link':
        shareWith = { type: 'link', expiresInDays: linkExpiry };
        break;
    }

    sharePlanMutation.mutate({ ...baseData, shareWith });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{planTitle}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'share' | 'export')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="share">Share & Collaborate</TabsTrigger>
          <TabsTrigger value="export">Export & Print</TabsTrigger>
        </TabsList>

        <TabsContent value="share">
          {/* Share Method Selection */}
          <div className="mb-6">
        <Label className="mb-2">Share via</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setShareMethod('email')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              shareMethod === 'email'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Mail className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Email</span>
          </button>
          <button
            onClick={() => setShareMethod('team')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              shareMethod === 'team'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Team</span>
          </button>
          <button
            onClick={() => setShareMethod('link')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              shareMethod === 'link'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Link className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Link</span>
          </button>
        </div>
      </div>

      {/* Share Method Specific Fields */}
      {shareMethod === 'email' && (
        <div className="mb-4">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@school.edu"
            className="mt-1"
          />
        </div>
      )}

      {shareMethod === 'team' && (
        <div className="mb-4">
          <Label htmlFor="team">Select team</Label>
          <Select
            value={selectedTeamId}
            onValueChange={setSelectedTeamId}
          >
            <option value="">Choose a team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team._count.members} members)
              </option>
            ))}
          </Select>
          {teams.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              You're not part of any teams yet.{' '}
              <a href="/teams" className="text-blue-600 hover:underline">
                Create or join a team
              </a>
            </p>
          )}
        </div>
      )}

      {shareMethod === 'link' && (
        <div className="mb-4">
          <Label htmlFor="expiry">Link expires in</Label>
          <Select
            id="expiry"
            value={linkExpiry.toString()}
            onValueChange={(value) => setLinkExpiry(parseInt(value))}
          >
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </Select>
        </div>
      )}

      {/* Optional Message */}
      <div className="mb-4">
        <Label htmlFor="message">Add a message (optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey! I thought you might find this lesson plan useful for your French Immersion class..."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Permissions */}
      <div className="mb-6">
        <Label className="mb-3">Permissions</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Can make a copy</span>
            <Switch
              checked={shareSettings.canCopy}
              onCheckedChange={(checked) =>
                setShareSettings({ ...shareSettings, canCopy: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Can comment</span>
            <Switch
              checked={shareSettings.canComment}
              onCheckedChange={(checked) =>
                setShareSettings({ ...shareSettings, canComment: checked })
              }
            />
          </div>
          {shareMethod !== 'link' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">Can edit</span>
                <Switch
                  checked={shareSettings.canEdit}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, canEdit: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Can reshare</span>
                <Switch
                  checked={shareSettings.canReshare}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, canReshare: checked })
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleShare}
          disabled={sharePlanMutation.isPending}
          className="flex-1"
        >
          {sharePlanMutation.isPending ? (
            'Sharing...'
          ) : shareMethod === 'link' ? (
            <>
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Create Link
                </>
              )}
            </>
          ) : (
            'Share'
          )}
        </Button>
      </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Export your lesson plan in various formats for printing or sharing outside the platform.
            </p>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Fetch full plan data and export
                  toast({
                    title: 'Export to PDF',
                    description: 'This feature will be available soon.',
                  });
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
                <span className="ml-auto text-xs text-gray-500">Best for printing</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Fetch full plan data and export
                  toast({
                    title: 'Export to Word',
                    description: 'This feature will be available soon.',
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as Word Document
                <span className="ml-auto text-xs text-gray-500">For editing</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Fetch full plan data and print
                  toast({
                    title: 'Print',
                    description: 'This feature will be available soon.',
                  });
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Plan
                <span className="ml-auto text-xs text-gray-500">Direct to printer</span>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Export Options</h4>
              <div className="space-y-2">
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Include curriculum expectations
                </label>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Include materials list
                </label>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  Include assessment notes
                </label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}