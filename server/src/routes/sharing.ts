/**
 * Plan Sharing Routes
 * Handles sharing of lesson plans, units, and other planning resources
 */

import { Router } from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../logger';
import { addDays } from 'date-fns';

// Validation schemas
const sharePlanSchema = z.object({
  planType: z.enum(['long-range', 'unit', 'lesson', 'daybook']),
  planId: z.string(),
  shareWith: z.union([
    z.object({
      type: z.literal('user'),
      email: z.string().email(),
    }),
    z.object({
      type: z.literal('team'),
      teamId: z.string(),
    }),
    z.object({
      type: z.literal('link'),
      expiresInDays: z.number().int().min(1).max(365).optional(),
    }),
  ]),
  permissions: z
    .object({
      canEdit: z.boolean().optional(),
      canCopy: z.boolean().optional(),
      canComment: z.boolean().optional(),
      canReshare: z.boolean().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

const updateSharePermissionsSchema = z.object({
  canEdit: z.boolean().optional(),
  canCopy: z.boolean().optional(),
  canComment: z.boolean().optional(),
  canReshare: z.boolean().optional(),
});

export function sharingRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticate);

  // Helper function to check plan ownership
  async function checkPlanOwnership(
    planType: string,
    planId: string,
    userId: number,
  ): Promise<boolean> {
    switch (planType) {
      case 'long-range': {
        const lrPlan = await prisma.longRangePlan.findUnique({
          where: { id: planId },
        });
        return lrPlan?.userId === userId;
      }

      case 'unit': {
        const unitPlan = await prisma.unitPlan.findUnique({
          where: { id: planId },
        });
        return unitPlan?.userId === userId;
      }

      case 'lesson': {
        const lessonPlan = await prisma.eTFOLessonPlan.findUnique({
          where: { id: planId },
        });
        return lessonPlan?.userId === userId;
      }

      case 'daybook': {
        const daybookEntry = await prisma.daybookEntry.findUnique({
          where: { id: planId },
        });
        return daybookEntry?.userId === userId;
      }

      default:
        return false;
    }
  }

  // Get all shared plans (both sent and received)
  router.get(
    '/plans',
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const { type, direction } = req.query;

      const whereClause: Record<string, unknown> = {};

      if (direction === 'sent') {
        whereClause.sharedById = userId;
      } else if (direction === 'received') {
        whereClause.sharedWithId = userId;
      } else {
        whereClause.OR = [{ sharedById: userId }, { sharedWithId: userId }];
      }

      if (type) {
        whereClause.planType = type;
      }

      const sharedPlans = await prisma.sharedPlan.findMany({
        where: whereClause,
        include: {
          sharedBy: {
            select: { id: true, name: true, email: true },
          },
          sharedWith: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { sharedAt: 'desc' },
      });

      // Fetch plan details for each shared plan
      const plansWithDetails = await Promise.all(
        sharedPlans.map(async (share) => {
          let planDetails = null;

          switch (share.planType) {
            case 'long-range':
              planDetails = await prisma.longRangePlan.findUnique({
                where: { id: share.planId },
                select: { id: true, title: true, academicYear: true, grade: true, subject: true },
              });
              break;

            case 'unit':
              planDetails = await prisma.unitPlan.findUnique({
                where: { id: share.planId },
                select: { id: true, title: true, startDate: true, endDate: true },
              });
              break;

            case 'lesson':
              planDetails = await prisma.eTFOLessonPlan.findUnique({
                where: { id: share.planId },
                select: { id: true, title: true, date: true, grade: true, subject: true },
              });
              break;

            case 'daybook':
              planDetails = await prisma.daybookEntry.findUnique({
                where: { id: share.planId },
                select: { id: true, date: true },
              });
              break;
          }

          return {
            ...share,
            planDetails,
          };
        }),
      );

      res.json(plansWithDetails);
    }),
  );

  // Share a plan
  router.post(
    '/plans',
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const {
        planType,
        planId,
        shareWith,
        permissions = {},
        message,
      } = sharePlanSchema.parse(req.body);

      // Check if user owns the plan
      const isOwner = await checkPlanOwnership(planType, planId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have permission to share this plan' });
      }

      let sharedPlan;

      if (shareWith.type === 'user') {
        // Share with specific user
        const targetUser = await prisma.user.findUnique({
          where: { email: shareWith.email },
        });

        if (!targetUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        if (targetUser.id === userId) {
          return res.status(400).json({ error: 'Cannot share with yourself' });
        }

        // Check if already shared
        const existingShare = await prisma.sharedPlan.findFirst({
          where: {
            planType,
            planId,
            sharedById: userId,
            sharedWithId: targetUser.id,
          },
        });

        if (existingShare) {
          return res.status(409).json({ error: 'Plan is already shared with this user' });
        }

        sharedPlan = await prisma.sharedPlan.create({
          data: {
            planType,
            planId,
            sharedById: userId,
            sharedWithId: targetUser.id,
            ...permissions,
            message,
          },
          include: {
            sharedBy: {
              select: { id: true, name: true, email: true },
            },
            sharedWith: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        // TODO: Send email notification
      } else if (shareWith.type === 'team') {
        // Share with team
        const team = await prisma.team.findUnique({
          where: { id: shareWith.teamId },
        });

        if (!team) {
          return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is a member of the team
        const isMember = await prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId: shareWith.teamId, userId } },
        });

        if (!isMember) {
          return res
            .status(403)
            .json({ error: 'You must be a team member to share with the team' });
        }

        sharedPlan = await prisma.sharedPlan.create({
          data: {
            planType,
            planId,
            sharedById: userId,
            teamId: shareWith.teamId,
            ...permissions,
            message,
          },
          include: {
            sharedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        });
      } else {
        // Create public sharing link
        const expiresAt = shareWith.expiresInDays
          ? addDays(new Date(), shareWith.expiresInDays)
          : undefined;

        sharedPlan = await prisma.sharedPlan.create({
          data: {
            planType,
            planId,
            sharedById: userId,
            isPublicLink: true,
            linkExpiresAt: expiresAt,
            ...permissions,
            message,
          },
          include: {
            sharedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        });
      }

      logger.info(`Plan shared: ${planType}/${planId} by user ${userId}`);
      res.status(201).json(sharedPlan);
    }),
  );

  // Get shared plan by share code
  router.get(
    '/plans/:shareCode',
    asyncHandler(async (req, res) => {
      const { shareCode } = req.params;
      const userId = req.user!.id;

      const sharedPlan = await prisma.sharedPlan.findUnique({
        where: { shareCode },
        include: {
          sharedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!sharedPlan) {
        return res.status(404).json({ error: 'Shared plan not found' });
      }

      // Check access permissions
      const hasAccess =
        sharedPlan.isPublicLink ||
        sharedPlan.sharedById === userId ||
        sharedPlan.sharedWithId === userId;

      if (!hasAccess && sharedPlan.teamId) {
        // Check team membership
        const isMember = await prisma.teamMember.findFirst({
          where: { teamId: sharedPlan.teamId, userId },
        });
        if (!isMember) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if link has expired
      if (sharedPlan.linkExpiresAt && new Date() > sharedPlan.linkExpiresAt) {
        return res.status(410).json({ error: 'Share link has expired' });
      }

      // Update view count
      await prisma.sharedPlan.update({
        where: { id: sharedPlan.id },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
      });

      // Fetch plan details
      let planDetails = null;

      switch (sharedPlan.planType) {
        case 'long-range':
          planDetails = await prisma.longRangePlan.findUnique({
            where: { id: sharedPlan.planId },
            include: {
              expectations: {
                include: { expectation: true },
              },
              unitPlans: {
                select: { id: true, title: true, startDate: true, endDate: true },
              },
            },
          });
          break;

        case 'unit':
          planDetails = await prisma.unitPlan.findUnique({
            where: { id: sharedPlan.planId },
            include: {
              expectations: {
                include: { expectation: true },
              },
              lessonPlans: {
                select: { id: true, title: true, date: true },
              },
              resources: true,
            },
          });
          break;

        case 'lesson':
          planDetails = await prisma.eTFOLessonPlan.findUnique({
            where: { id: sharedPlan.planId },
            include: {
              expectations: {
                include: { expectation: true },
              },
              resources: true,
            },
          });
          break;

        case 'daybook':
          planDetails = await prisma.daybookEntry.findUnique({
            where: { id: sharedPlan.planId },
            include: {
              expectations: {
                include: { expectation: true },
              },
            },
          });
          break;
      }

      res.json({
        share: sharedPlan,
        plan: planDetails,
      });
    }),
  );

  // Update share permissions
  router.patch(
    '/plans/:shareId',
    asyncHandler(async (req, res) => {
      const { shareId } = req.params;
      const userId = req.user!.id;
      const updates = updateSharePermissionsSchema.parse(req.body);

      const sharedPlan = await prisma.sharedPlan.findUnique({
        where: { id: shareId },
      });

      if (!sharedPlan) {
        return res.status(404).json({ error: 'Shared plan not found' });
      }

      // Only the sharer can update permissions
      if (sharedPlan.sharedById !== userId) {
        return res.status(403).json({ error: 'Only the plan owner can update share permissions' });
      }

      const updated = await prisma.sharedPlan.update({
        where: { id: shareId },
        data: updates,
        include: {
          sharedBy: {
            select: { id: true, name: true, email: true },
          },
          sharedWith: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(updated);
    }),
  );

  // Revoke share
  router.delete(
    '/plans/:shareId',
    asyncHandler(async (req, res) => {
      const { shareId } = req.params;
      const userId = req.user!.id;

      const sharedPlan = await prisma.sharedPlan.findUnique({
        where: { id: shareId },
      });

      if (!sharedPlan) {
        return res.status(404).json({ error: 'Shared plan not found' });
      }

      // Only the sharer can revoke
      if (sharedPlan.sharedById !== userId) {
        return res.status(403).json({ error: 'Only the plan owner can revoke sharing' });
      }

      await prisma.sharedPlan.delete({
        where: { id: shareId },
      });

      logger.info(`Share revoked: ${shareId} by user ${userId}`);
      res.status(204).send();
    }),
  );

  // Copy shared plan
  router.post(
    '/plans/:shareCode/copy',
    asyncHandler(async (req, res) => {
      const { shareCode } = req.params;
      const userId = req.user!.id;

      const sharedPlan = await prisma.sharedPlan.findUnique({
        where: { shareCode },
      });

      if (!sharedPlan) {
        return res.status(404).json({ error: 'Shared plan not found' });
      }

      // Check if user has copy permission
      if (!sharedPlan.canCopy) {
        return res.status(403).json({ error: 'Copying this plan is not allowed' });
      }

      // Check access
      const hasAccess = sharedPlan.isPublicLink || sharedPlan.sharedWithId === userId;

      if (!hasAccess && sharedPlan.teamId) {
        const isMember = await prisma.teamMember.findFirst({
          where: { teamId: sharedPlan.teamId, userId },
        });
        if (!isMember) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Copy the plan based on type
      let copiedPlan;

      switch (sharedPlan.planType) {
        case 'lesson': {
          const originalLesson = await prisma.eTFOLessonPlan.findUnique({
            where: { id: sharedPlan.planId },
            include: {
              expectations: true,
              resources: true,
            },
          });

          if (!originalLesson) {
            return res.status(404).json({ error: 'Original plan not found' });
          }

          // Get user's unit plans to select from
          const userUnitPlans = await prisma.unitPlan.findMany({
            where: { userId },
            select: { id: true },
            take: 1,
          });

          if (userUnitPlans.length === 0) {
            return res
              .status(400)
              .json({ error: 'You need at least one unit plan to copy lessons' });
          }

          copiedPlan = await prisma.eTFOLessonPlan.create({
            data: {
              userId,
              title: `${originalLesson.title} (Copy)`,
              unitPlanId: userUnitPlans[0].id, // TODO: Allow user to select unit
              grade: originalLesson.grade,
              subject: originalLesson.subject,
              language: originalLesson.language,
              date: new Date(),
              duration: originalLesson.duration,
              mindsOn: originalLesson.mindsOn,
              action: originalLesson.action,
              consolidation: originalLesson.consolidation,
              learningGoals: originalLesson.learningGoals,
              materials: originalLesson.materials,
              grouping: originalLesson.grouping,
              titleFr: originalLesson.titleFr,
              mindsOnFr: originalLesson.mindsOnFr,
              actionFr: originalLesson.actionFr,
              consolidationFr: originalLesson.consolidationFr,
              learningGoalsFr: originalLesson.learningGoalsFr,
              accommodations: originalLesson.accommodations,
              modifications: originalLesson.modifications,
              extensions: originalLesson.extensions,
              assessmentType: originalLesson.assessmentType,
              assessmentNotes: originalLesson.assessmentNotes,
              isSubFriendly: originalLesson.isSubFriendly,
              subNotes: originalLesson.subNotes,
              expectations: {
                create: originalLesson.expectations.map((e) => ({
                  expectationId: e.expectationId,
                })),
              },
            },
          });
          break;
        }

        // TODO: Implement copying for other plan types
        default:
          return res.status(400).json({ error: 'Copying this plan type is not yet supported' });
      }

      // Update copy count
      await prisma.sharedPlan.update({
        where: { id: sharedPlan.id },
        data: { copyCount: { increment: 1 } },
      });

      logger.info(`Plan copied: ${sharedPlan.planType}/${sharedPlan.planId} by user ${userId}`);
      res.status(201).json(copiedPlan);
    }),
  );

  return router;
}
