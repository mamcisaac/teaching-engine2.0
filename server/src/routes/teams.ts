/**
 * Team Collaboration Routes
 * Handles team creation, management, and collaboration features
 */

import { Router } from 'express';
import { PrismaClient, TeamRole, InvitationStatus } from '@teaching-engine/database';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../logger';
import { addDays } from 'date-fns';

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  grade: z.number().int().min(1).max(12).optional(),
  subject: z.string().optional(),
  schoolName: z.string().optional(),
  schoolBoard: z.string().optional(),
  isPublic: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
});

const updateTeamSchema = createTeamSchema.partial();

const inviteMemberSchema = z.object({
  email: z.string().email(),
  message: z.string().optional(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional(),
});

const respondToInvitationSchema = z.object({
  response: z.enum(['accept', 'decline']),
});

export function teamRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(authenticate);

  // Get all teams for the current user
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;

      const teams = await prisma.team.findMany({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(teams);
    }),
  );

  // Get public teams (for discovery)
  router.get(
    '/public',
    asyncHandler(async (req, res) => {
      const { grade, subject, search } = req.query;

      const teams = await prisma.team.findMany({
        where: {
          isPublic: true,
          ...(grade && { grade: parseInt(grade as string) }),
          ...(subject && { subject: subject as string }),
          ...(search && {
            OR: [
              { name: { contains: search as string } },
              { description: { contains: search as string } },
            ],
          }),
        },
        include: {
          owner: {
            select: { id: true, name: true },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json(teams);
    }),
  );

  // Get team by ID
  router.get(
    '/:teamId',
    asyncHandler(async (req, res) => {
      const { teamId } = req.params;
      const userId = req.user!.id;

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
          _count: {
            select: {
              members: true,
              sharedResources: true,
              discussions: true,
            },
          },
        },
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Check if user has access
      const isMember = team.ownerId === userId || team.members.some((m) => m.userId === userId);

      if (!isMember && !team.isPublic && !team.allowGuests) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(team);
    }),
  );

  // Create a new team
  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const data = createTeamSchema.parse(req.body);

      const team = await prisma.team.create({
        data: {
          name: data.name,
          description: data.description,
          grade: data.grade,
          subject: data.subject,
          schoolName: data.schoolName,
          schoolBoard: data.schoolBoard,
          isPublic: data.isPublic,
          requiresApproval: data.requiresApproval,
          owner: {
            connect: { id: userId },
          },
          members: {
            create: {
              userId,
              role: TeamRole.OWNER,
            },
          },
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      logger.info(`Team created: ${team.id} by user ${userId}`);
      res.status(201).json(team);
    }),
  );

  // Update team
  router.patch(
    '/:teamId',
    asyncHandler(async (req, res) => {
      const { teamId } = req.params;
      const userId = req.user!.id;
      const data = updateTeamSchema.parse(req.body);

      // Check if user is owner or admin
      const member = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });

      if (!member || (member.role !== TeamRole.OWNER && member.role !== TeamRole.ADMIN)) {
        return res
          .status(403)
          .json({ error: 'Only team owners and admins can update team settings' });
      }

      const team = await prisma.team.update({
        where: { id: teamId },
        data,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(team);
    }),
  );

  // Delete team (owner only)
  router.delete(
    '/:teamId',
    asyncHandler(async (req, res) => {
      const { teamId } = req.params;
      const userId = req.user!.id;

      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      if (team.ownerId !== userId) {
        return res.status(403).json({ error: 'Only the team owner can delete the team' });
      }

      await prisma.team.delete({
        where: { id: teamId },
      });

      logger.info(`Team deleted: ${teamId} by user ${userId}`);
      res.status(204).send();
    }),
  );

  // Invite member to team
  router.post(
    '/:teamId/invitations',
    asyncHandler(async (req, res) => {
      const { teamId } = req.params;
      const userId = req.user!.id;
      const { email, message, role = TeamRole.MEMBER } = inviteMemberSchema.parse(req.body);

      // Check if user can invite (owner or admin)
      const member = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });

      if (!member || (member.role !== TeamRole.OWNER && member.role !== TeamRole.ADMIN)) {
        return res.status(403).json({ error: 'Only team owners and admins can invite members' });
      }

      // Check if user is already a member
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const existingMember = await prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId, userId: existingUser.id } },
        });

        if (existingMember) {
          return res.status(409).json({ error: 'User is already a team member' });
        }
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.teamInvitation.findUnique({
        where: { teamId_email: { teamId, email } },
      });

      if (existingInvitation && existingInvitation.status === InvitationStatus.PENDING) {
        return res.status(409).json({ error: 'An invitation is already pending for this email' });
      }

      // Create invitation
      const invitation = await prisma.teamInvitation.create({
        data: {
          teamId,
          email,
          invitedById: userId,
          invitedUserId: existingUser?.id,
          message,
          role,
          expiresAt: addDays(new Date(), 7), // 7 day expiration
        },
        include: {
          team: {
            select: { id: true, name: true },
          },
          invitedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // TODO: Send email notification

      res.status(201).json(invitation);
    }),
  );

  // Get team invitations
  router.get(
    '/:teamId/invitations',
    asyncHandler(async (req, res) => {
      const { teamId } = req.params;
      const userId = req.user!.id;

      // Check if user is member
      const member = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });

      if (!member) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const invitations = await prisma.teamInvitation.findMany({
        where: {
          teamId,
          status: InvitationStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
        include: {
          invitedBy: {
            select: { id: true, name: true, email: true },
          },
          invitedUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(invitations);
    }),
  );

  // Get user's pending invitations
  router.get(
    '/invitations/my',
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const userEmail = req.user!.email;

      const invitations = await prisma.teamInvitation.findMany({
        where: {
          OR: [{ invitedUserId: userId }, { email: userEmail }],
          status: InvitationStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
        include: {
          team: {
            include: {
              owner: {
                select: { id: true, name: true },
              },
              _count: {
                select: { members: true },
              },
            },
          },
          invitedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(invitations);
    }),
  );

  // Respond to invitation
  router.post(
    '/invitations/:invitationId/respond',
    asyncHandler(async (req, res) => {
      const { invitationId } = req.params;
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { response } = respondToInvitationSchema.parse(req.body);

      const invitation = await prisma.teamInvitation.findUnique({
        where: { id: invitationId },
      });

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      // Check if invitation is for this user
      if (invitation.invitedUserId !== userId && invitation.email !== userEmail) {
        return res.status(403).json({ error: 'This invitation is not for you' });
      }

      // Check if invitation is still valid
      if (invitation.status !== InvitationStatus.PENDING) {
        return res.status(409).json({ error: 'Invitation has already been responded to' });
      }

      if (new Date() > invitation.expiresAt) {
        return res.status(409).json({ error: 'Invitation has expired' });
      }

      if (response === 'accept') {
        // Create team membership
        await prisma.$transaction(async (tx) => {
          // Update invitation
          await tx.teamInvitation.update({
            where: { id: invitationId },
            data: {
              status: InvitationStatus.ACCEPTED,
              respondedAt: new Date(),
            },
          });

          // Create membership
          await tx.teamMember.create({
            data: {
              teamId: invitation.teamId,
              userId,
              role: invitation.role,
            },
          });
        });

        logger.info(`User ${userId} accepted invitation to team ${invitation.teamId}`);
        res.json({ message: 'Invitation accepted successfully' });
      } else {
        // Decline invitation
        await prisma.teamInvitation.update({
          where: { id: invitationId },
          data: {
            status: InvitationStatus.DECLINED,
            respondedAt: new Date(),
          },
        });

        res.json({ message: 'Invitation declined' });
      }
    }),
  );

  // Leave team
  router.post(
    '/:teamId/leave',
    asyncHandler(async (req, res) => {
      const { teamId } = req.params;
      const userId = req.user!.id;

      const member = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });

      if (!member) {
        return res.status(404).json({ error: 'You are not a member of this team' });
      }

      if (member.role === TeamRole.OWNER) {
        return res.status(400).json({
          error: 'Team owner cannot leave the team. Transfer ownership or delete the team.',
        });
      }

      await prisma.teamMember.delete({
        where: { id: member.id },
      });

      logger.info(`User ${userId} left team ${teamId}`);
      res.json({ message: 'Successfully left the team' });
    }),
  );

  // Update member role
  router.patch(
    '/:teamId/members/:memberId',
    asyncHandler(async (req, res) => {
      const { teamId, memberId } = req.params;
      const userId = req.user!.id;
      const { role } = z.object({ role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']) }).parse(req.body);

      // Check if user is owner
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team || team.ownerId !== userId) {
        return res.status(403).json({ error: 'Only the team owner can change member roles' });
      }

      const member = await prisma.teamMember.findFirst({
        where: { id: memberId, teamId },
      });

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      if (member.role === TeamRole.OWNER) {
        return res.status(400).json({ error: 'Cannot change owner role' });
      }

      const updatedMember = await prisma.teamMember.update({
        where: { id: memberId },
        data: { role },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(updatedMember);
    }),
  );

  // Remove member from team
  router.delete(
    '/:teamId/members/:memberId',
    asyncHandler(async (req, res) => {
      const { teamId, memberId } = req.params;
      const userId = req.user!.id;

      // Check if user is owner or admin
      const currentMember = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });

      if (
        !currentMember ||
        (currentMember.role !== TeamRole.OWNER && currentMember.role !== TeamRole.ADMIN)
      ) {
        return res.status(403).json({ error: 'Only team owners and admins can remove members' });
      }

      const memberToRemove = await prisma.teamMember.findFirst({
        where: { id: memberId, teamId },
      });

      if (!memberToRemove) {
        return res.status(404).json({ error: 'Member not found' });
      }

      if (memberToRemove.role === TeamRole.OWNER) {
        return res.status(400).json({ error: 'Cannot remove team owner' });
      }

      await prisma.teamMember.delete({
        where: { id: memberId },
      });

      logger.info(`Member ${memberToRemove.userId} removed from team ${teamId} by user ${userId}`);
      res.status(204).send();
    }),
  );

  return router;
}
