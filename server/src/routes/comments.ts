/**
 * Plan Comments Routes
 * Handles commenting and feedback on shared plans
 */

import { Router } from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { z } from 'zod';
import { authenticate } from '@/middleware/authenticate';
import { asyncHandler } from '@/middleware/errorHandler';
import logger from '@/logger';

// Validation schemas
const createCommentSchema = z.object({
  planType: z.enum(['long-range', 'unit', 'lesson', 'daybook']),
  planId: z.string(),
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  isResolved: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export function commentRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticate);

  // Helper function to check if user has access to comment on a plan
  async function checkCommentAccess(planType: string, planId: string, userId: number): Promise<boolean> {
    // Check if user owns the plan
    let isOwner = false;
    switch (planType) {
      case 'long-range':
        const lrPlan = await prisma.longRangePlan.findUnique({
          where: { id: planId },
        });
        isOwner = lrPlan?.userId === userId;
        break;

      case 'unit':
        const unitPlan = await prisma.unitPlan.findUnique({
          where: { id: planId },
        });
        isOwner = unitPlan?.userId === userId;
        break;

      case 'lesson':
        const lessonPlan = await prisma.eTFOLessonPlan.findUnique({
          where: { id: planId },
        });
        isOwner = lessonPlan?.userId === userId;
        break;

      case 'daybook':
        const daybookEntry = await prisma.daybookEntry.findUnique({
          where: { id: planId },
        });
        isOwner = daybookEntry?.userId === userId;
        break;
    }

    if (isOwner) return true;

    // Check if plan is shared with user and commenting is allowed
    const sharedPlan = await prisma.sharedPlan.findFirst({
      where: {
        planType,
        planId,
        OR: [
          { sharedWithId: userId },
          { teamId: { not: null } },
        ],
        canComment: true,
      },
    });

    if (sharedPlan) {
      // If shared with team, check team membership
      if (sharedPlan.teamId) {
        const isMember = await prisma.teamMember.findFirst({
          where: { teamId: sharedPlan.teamId, userId },
        });
        return !!isMember;
      }
      return true;
    }

    return false;
  }

  // Get comments for a plan
  router.get('/', asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { planType, planId } = req.query;

    if (!planType || !planId) {
      return res.status(400).json({ error: 'planType and planId are required' });
    }

    // Check access
    const hasAccess = await checkCommentAccess(planType as string, planId as string, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = await prisma.planComment.findMany({
      where: {
        planType: planType as string,
        planId: planId as string,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(comments);
  }));

  // Create a comment
  router.post('/', asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { planType, planId, content, parentId } = createCommentSchema.parse(req.body);

    // Check access
    const hasAccess = await checkCommentAccess(planType, planId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have permission to comment on this plan' });
    }

    // If replying to a comment, verify parent exists
    if (parentId) {
      const parentComment = await prisma.planComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.planType !== planType || parentComment.planId !== planId) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }
    }

    const comment = await prisma.planComment.create({
      data: {
        planType,
        planId,
        userId,
        content,
        parentId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    logger.info(`Comment created on ${planType}/${planId} by user ${userId}`);
    res.status(201).json(comment);
  }));

  // Update a comment
  router.patch('/:commentId', asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user!.id;
    const updates = updateCommentSchema.parse(req.body);

    const comment = await prisma.planComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check permissions
    const isAuthor = comment.userId === userId;
    const hasAccess = await checkCommentAccess(comment.planType, comment.planId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only author can edit content
    if (updates.content !== undefined && !isAuthor) {
      return res.status(403).json({ error: 'Only the comment author can edit the content' });
    }

    // Plan owner can pin/resolve comments
    const planOwnerChecks: Record<string, () => Promise<boolean>> = {
      'long-range': async () => {
        const plan = await prisma.longRangePlan.findUnique({
          where: { id: comment.planId },
        });
        return plan?.userId === userId;
      },
      'unit': async () => {
        const plan = await prisma.unitPlan.findUnique({
          where: { id: comment.planId },
        });
        return plan?.userId === userId;
      },
      'lesson': async () => {
        const plan = await prisma.eTFOLessonPlan.findUnique({
          where: { id: comment.planId },
        });
        return plan?.userId === userId;
      },
      'daybook': async () => {
        const plan = await prisma.daybookEntry.findUnique({
          where: { id: comment.planId },
        });
        return plan?.userId === userId;
      },
    };

    const isPlanOwner = await planOwnerChecks[comment.planType]?.();

    if ((updates.isPinned !== undefined || updates.isResolved !== undefined) && !isPlanOwner) {
      return res.status(403).json({ error: 'Only the plan owner can pin or resolve comments' });
    }

    const updated = await prisma.planComment.update({
      where: { id: commentId },
      data: updates,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(updated);
  }));

  // Delete a comment
  router.delete('/:commentId', asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user!.id;

    const comment = await prisma.planComment.findUnique({
      where: { id: commentId },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only author can delete their comment
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Only the comment author can delete the comment' });
    }

    // Don't allow deletion if there are replies
    if (comment._count.replies > 0) {
      return res.status(400).json({ error: 'Cannot delete a comment with replies' });
    }

    await prisma.planComment.delete({
      where: { id: commentId },
    });

    logger.info(`Comment ${commentId} deleted by user ${userId}`);
    res.status(204).send();
  }));

  // Get comment statistics for a plan
  router.get('/stats', asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { planType, planId } = req.query;

    if (!planType || !planId) {
      return res.status(400).json({ error: 'planType and planId are required' });
    }

    // Check access
    const hasAccess = await checkCommentAccess(planType as string, planId as string, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [total, resolved, unresolved] = await Promise.all([
      prisma.planComment.count({
        where: {
          planType: planType as string,
          planId: planId as string,
        },
      }),
      prisma.planComment.count({
        where: {
          planType: planType as string,
          planId: planId as string,
          isResolved: true,
        },
      }),
      prisma.planComment.count({
        where: {
          planType: planType as string,
          planId: planId as string,
          isResolved: false,
        },
      }),
    ]);

    res.json({
      total,
      resolved,
      unresolved,
    });
  }));

  return router;
}