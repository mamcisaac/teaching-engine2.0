import { Router } from 'express';
import { PrismaClient } from '@teaching-engine/database';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/alerts/milestones
 * Returns milestone alert data for tracking progress against curriculum expectations
 */
router.get('/milestones', async (req, res) => {
  try {
    // const { classId } = req.query; // TODO: Use for filtering by class

    // For now, we'll work with all data. In future, filter by classId
    const currentDate = new Date();

    // Get all milestone definitions
    const milestoneDefinitions = await prisma.milestoneDefinition.findMany({
      include: {
        outcome: true,
        thematicUnit: true,
      },
    });

    const alerts = [];

    // Check each milestone definition for violations
    for (const definition of milestoneDefinitions) {
      const alert = await checkMilestoneDefinition(definition, currentDate);
      if (alert) {
        alerts.push(alert);
      }
    }

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching milestone alerts:', error);
    res.status(500).json({ error: 'Failed to fetch milestone alerts' });
  }
});

/**
 * Check a single milestone definition for violations
 */
async function checkMilestoneDefinition(
  definition: {
    id: number;
    outcomeId?: string | null;
    thematicUnitId?: number | null;
    domain?: string | null;
    dueDate: Date;
    minCoverageCount?: number | null;
    minAssessmentRequired: boolean;
    description?: string | null;
    priority: string;
    outcome?: { id: string; code: string; domain?: string | null } | null;
    thematicUnit?: { id: number; title: string; startDate: Date; endDate: Date } | null;
  },
  currentDate: Date,
) {
  const isPastDue = currentDate > definition.dueDate;

  if (definition.outcomeId) {
    // Outcome-specific alert
    const outcome = definition.outcome;

    // Count activities that address this outcome
    const activityCount = await prisma.activityOutcome.count({
      where: {
        outcomeId: definition.outcomeId,
      },
    });

    // Count assessments that address this outcome
    const assessmentCount = await prisma.assessmentResult.count({
      where: {
        template: {
          outcomeIds: {
            contains: definition.outcomeId,
          },
        },
      },
    });

    // Check for violations
    const hasInsufficientCoverage =
      definition.minCoverageCount && activityCount < definition.minCoverageCount;
    const hasInsufficientAssessment = definition.minAssessmentRequired && assessmentCount === 0;
    const isNotIntroduced = activityCount === 0;

    if (isPastDue && isNotIntroduced) {
      return {
        type: 'outcome_missed',
        outcomeId: definition.outcomeId,
        outcomeCode: outcome.code,
        message: `Outcome ${outcome.code} has not been introduced. Target date: ${definition.dueDate.toLocaleDateString()}.`,
        severity: 'warning' as const,
        dueDate: definition.dueDate,
        priority: definition.priority,
        description: definition.description,
      };
    }

    if (isPastDue && hasInsufficientCoverage) {
      return {
        type: 'outcome_undercovered',
        outcomeId: definition.outcomeId,
        outcomeCode: outcome.code,
        message: `Outcome ${outcome.code} has only ${activityCount} activities (expected ${definition.minCoverageCount}). Target date: ${definition.dueDate.toLocaleDateString()}.`,
        severity: 'notice' as const,
        dueDate: definition.dueDate,
        priority: definition.priority,
        description: definition.description,
      };
    }

    if (isPastDue && hasInsufficientAssessment) {
      return {
        type: 'outcome_unassessed',
        outcomeId: definition.outcomeId,
        outcomeCode: outcome.code,
        message: `Outcome ${outcome.code} has not been assessed. Target date: ${definition.dueDate.toLocaleDateString()}.`,
        severity: 'notice' as const,
        dueDate: definition.dueDate,
        priority: definition.priority,
        description: definition.description,
      };
    }
  } else if (definition.domain) {
    // Domain-level alert
    const domainActivityCount = await prisma.activity.count({
      where: {
        outcomes: {
          some: {
            outcome: {
              domain: definition.domain,
            },
          },
        },
      },
    });

    const domainAssessmentCount = await prisma.assessmentResult.count({
      where: {
        template: {
          outcomeIds: {
            not: '[]',
          },
        },
      },
    });

    const hasInsufficientCoverage =
      definition.minCoverageCount && domainActivityCount < definition.minCoverageCount;
    const hasInsufficientAssessment =
      definition.minAssessmentRequired && domainAssessmentCount === 0;

    if (isPastDue && hasInsufficientCoverage) {
      return {
        type: 'underassessed_domain',
        domain: definition.domain,
        message: `Only ${domainActivityCount} ${definition.domain} activities logged. Expected ≥ ${definition.minCoverageCount} by now.`,
        severity: 'notice' as const,
        dueDate: definition.dueDate,
        priority: definition.priority,
        description: definition.description,
      };
    }

    if (isPastDue && hasInsufficientAssessment) {
      return {
        type: 'underassessed_domain',
        domain: definition.domain,
        message: `No assessments logged for ${definition.domain}. Assessment expected by ${definition.dueDate.toLocaleDateString()}.`,
        severity: 'notice' as const,
        dueDate: definition.dueDate,
        priority: definition.priority,
        description: definition.description,
      };
    }
  } else if (definition.thematicUnitId) {
    // Thematic unit alert
    const unit = definition.thematicUnit;
    const unitActivityCount = await prisma.thematicUnitActivity.count({
      where: {
        thematicUnitId: definition.thematicUnitId,
      },
    });

    const isInScheduledWindow = currentDate >= unit.startDate && currentDate <= unit.endDate;
    const hasNoActivities = unitActivityCount === 0;

    if (isInScheduledWindow && hasNoActivities) {
      return {
        type: 'theme_unaddressed',
        thematicUnitId: definition.thematicUnitId,
        thematicUnitTitle: unit.title,
        message: `Theme "${unit.title}" has no scheduled activities during its window (${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}).`,
        severity: 'warning' as const,
        dueDate: definition.dueDate,
        priority: definition.priority,
        description: definition.description,
      };
    }
  }

  return null;
}

export default router;
