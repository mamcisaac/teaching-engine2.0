/**
 * SharedPlansView Component
 * Displays plans shared with the user and plans they've shared
 */

import React, { useState } from 'react';
import { FileText, Calendar, BookOpen, Share2, Download, Eye, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface SharedPlan {
  id: string;
  planType: string;
  planId: string;
  sharedAt: string;
  lastViewedAt?: string;
  viewCount: number;
  copyCount: number;
  canEdit: boolean;
  canCopy: boolean;
  canComment: boolean;
  message?: string;
  sharedBy: {
    id: number;
    name: string;
    email: string;
  };
  sharedWith?: {
    id: number;
    name: string;
    email: string;
  };
  planDetails?: {
    id: string;
    title: string;
    date?: string;
    grade?: number;
    subject?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function SharedPlansView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Fetch shared plans
  const { data: sharedPlans = [], isLoading } = useQuery<SharedPlan[]>({
    queryKey: ['shared-plans', activeTab],
    queryFn: () => 
      api.get('/api/sharing/plans', {
        params: { direction: activeTab }
      }).then(res => res.data),
  });

  // Copy plan mutation
  const copyPlanMutation = useMutation({
    mutationFn: async (shareCode: string) => {
      const response = await api.post(`/api/sharing/plans/${shareCode}/copy`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Plan copied!',
        description: 'The plan has been added to your workspace.',
      });
      queryClient.invalidateQueries({ queryKey: ['shared-plans'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Copy failed',
        description: error.response?.data?.error || 'Failed to copy the plan',
        variant: 'destructive',
      });
    },
  });

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'lesson':
        return <FileText className="w-5 h-5" />;
      case 'unit':
        return <BookOpen className="w-5 h-5" />;
      case 'daybook':
        return <Calendar className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getPlanTypeName = (planType: string) => {
    switch (planType) {
      case 'lesson':
        return 'Lesson Plan';
      case 'unit':
        return 'Unit Plan';
      case 'daybook':
        return 'Daybook Entry';
      case 'long-range':
        return 'Long Range Plan';
      default:
        return 'Plan';
    }
  };

  const viewPlan = (plan: SharedPlan) => {
    // Navigate to the appropriate view based on plan type
    switch (plan.planType) {
      case 'lesson':
        navigate(`/lessons/${plan.planId}`);
        break;
      case 'unit':
        navigate(`/units/${plan.planId}`);
        break;
      case 'daybook':
        navigate(`/daybook/${plan.planId}`);
        break;
      case 'long-range':
        navigate(`/long-range/${plan.planId}`);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent')}>
        <TabsList className="mb-6">
          <TabsTrigger value="received">Shared with Me</TabsTrigger>
          <TabsTrigger value="sent">Shared by Me</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {sharedPlans.length === 0 ? (
            <Card className="p-8 text-center">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shared plans yet</h3>
              <p className="text-gray-600">
                When colleagues share plans with you, they'll appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sharedPlans.map((plan) => (
                <Card key={plan.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getPlanIcon(plan.planType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {plan.planDetails?.title || 'Untitled Plan'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <Badge variant="outline">
                            {getPlanTypeName(plan.planType)}
                          </Badge>
                          {plan.planDetails?.grade && (
                            <span>Grade {plan.planDetails.grade}</span>
                          )}
                          {plan.planDetails?.subject && (
                            <span>{plan.planDetails.subject}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {plan.canComment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/shared/${plan.id}/comments`)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      )}
                      {plan.canCopy && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPlanMutation.mutate(plan.id)}
                          disabled={copyPlanMutation.isPending}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewPlan(plan)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>

                  {plan.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">{plan.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Shared by {plan.sharedBy.name} • {formatDistanceToNow(new Date(plan.sharedAt))} ago
                    </span>
                    <div className="flex gap-4">
                      <span>{plan.viewCount} views</span>
                      {plan.copyCount > 0 && <span>{plan.copyCount} copies</span>}
                    </div>
                  </div>

                  {/* Permission badges */}
                  <div className="flex gap-2 mt-3">
                    {plan.canEdit && (
                      <Badge variant="secondary" className="text-xs">
                        Can Edit
                      </Badge>
                    )}
                    {plan.canCopy && (
                      <Badge variant="secondary" className="text-xs">
                        Can Copy
                      </Badge>
                    )}
                    {plan.canComment && (
                      <Badge variant="secondary" className="text-xs">
                        Can Comment
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sharedPlans.length === 0 ? (
            <Card className="p-8 text-center">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shared plans</h3>
              <p className="text-gray-600">
                Plans you share with colleagues will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sharedPlans.map((plan) => (
                <Card key={plan.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        {getPlanIcon(plan.planType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {plan.planDetails?.title || 'Untitled Plan'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <Badge variant="outline">
                            {getPlanTypeName(plan.planType)}
                          </Badge>
                          {plan.sharedWith && (
                            <span>Shared with {plan.sharedWith.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewPlan(plan)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Shared {formatDistanceToNow(new Date(plan.sharedAt))} ago
                    </span>
                    <div className="flex gap-4">
                      <span>{plan.viewCount} views</span>
                      {plan.copyCount > 0 && <span>{plan.copyCount} copies</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}