/**
 * CommentThread Component
 * Displays and manages comments on shared plans
 */

import React, { useState } from 'react';
import { MessageSquare, Send, Reply, CheckCircle, Pin, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  isResolved: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  replies: Comment[];
}

interface CommentThreadProps {
  planType: 'long-range' | 'unit' | 'lesson' | 'daybook';
  planId: string;
  canResolve?: boolean; // Plan owner can resolve comments
}

export function CommentThread({ planType, planId, canResolve = false }: CommentThreadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', planType, planId],
    queryFn: () =>
      api
        .get('/api/comments', {
          params: { planType, planId },
        })
        .then((res) => res.data),
  });

  // Fetch comment stats
  const { data: stats } = useQuery({
    queryKey: ['comment-stats', planType, planId],
    queryFn: () =>
      api
        .get('/api/comments/stats', {
          params: { planType, planId },
        })
        .then((res) => res.data),
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      const response = await api.post('/api/comments', {
        planType,
        planId,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', planType, planId] });
      queryClient.invalidateQueries({ queryKey: ['comment-stats', planType, planId] });
      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Please try again';
      toast({
        title: 'Failed to add comment',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      updates,
    }: {
      commentId: string;
      updates: { isResolved?: boolean; isPinned?: boolean };
    }) => {
      const response = await api.patch(`/api/comments/${commentId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', planType, planId] });
      queryClient.invalidateQueries({ queryKey: ['comment-stats', planType, planId] });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', planType, planId] });
      queryClient.invalidateQueries({ queryKey: ['comment-stats', planType, planId] });
      toast({
        title: 'Comment deleted',
        description: 'The comment has been removed.',
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({ content: newComment });
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    createCommentMutation.mutate({ content: replyContent, parentId });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
      <Card className={`p-4 ${comment.isResolved ? 'bg-green-50 border-green-200' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="font-medium">{comment.user.name}</div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
            {comment.isPinned && (
              <Badge variant="secondary" className="text-xs">
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}
            {comment.isResolved && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {canResolve && !isReply && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateCommentMutation.mutate({
                      commentId: comment.id,
                      updates: { isPinned: !comment.isPinned },
                    })
                  }
                >
                  <Pin className={`w-4 h-4 ${comment.isPinned ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateCommentMutation.mutate({
                      commentId: comment.id,
                      updates: { isResolved: !comment.isResolved },
                    })
                  }
                >
                  <CheckCircle
                    className={`w-4 h-4 ${comment.isResolved ? 'text-green-600' : ''}`}
                  />
                </Button>
              </>
            )}
            {comment.user.id === Number(user?.id) && comment.replies.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCommentMutation.mutate(comment.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setReplyingTo(comment.id);
              setReplyContent('');
            }}
          >
            <Reply className="w-4 h-4 mr-1" />
            Reply
          </Button>
        )}

        {replyingTo === comment.id && (
          <div className="mt-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={createCommentMutation.isPending}
              >
                <Send className="w-4 h-4 mr-1" />
                Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {comment.replies.map((reply) => renderComment(reply, true))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Comment Stats */}
      {stats && (
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {stats.total} {stats.total === 1 ? 'comment' : 'comments'}
          </div>
          {stats.resolved > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              {stats.resolved} resolved
            </div>
          )}
        </div>
      )}

      {/* New Comment Form */}
      <Card className="p-4 mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="mb-3"
        />
        <Button
          onClick={handleSubmitComment}
          disabled={!newComment.trim() || createCommentMutation.isPending}
        >
          <Send className="w-4 h-4 mr-2" />
          Post Comment
        </Button>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No comments yet. Be the first to share feedback!</p>
        </Card>
      ) : (
        <div>{comments.map((comment) => renderComment(comment))}</div>
      )}
    </div>
  );
}
