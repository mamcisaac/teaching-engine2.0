import { Router, Request } from 'express';
import { prisma } from '../prisma';

const router = Router();

/**
 * GET /api/etfo/progress
 * Get ETFO planning progress across all 5 levels
 */
router.get('/progress', async (req: Request, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;

    // Get curriculum expectations progress
    const totalExpectations = await prisma.curriculumExpectation.count({
      where: {
        import: { userId },
      },
    });

    const importedExpectations = totalExpectations; // All expectations are imported by definition

    // Get long-range plans progress
    const totalLongRangePlans = await prisma.longRangePlan.count({
      where: { userId },
    });

    const completedLongRangePlans = await prisma.longRangePlan.count({
      where: {
        userId,
        // Consider completed if they have goals
        goals: { not: null },
      },
    });

    // Get unit plans progress
    const totalUnitPlans = await prisma.unitPlan.count({
      where: { userId },
    });

    const completedUnitPlans = await prisma.unitPlan.count({
      where: {
        userId,
        // Consider completed if they have big ideas
        bigIdeas: { not: null },
      },
    });

    // Get lesson plans progress
    const totalLessonPlans = await prisma.eTFOLessonPlan.count({
      where: { userId },
    });

    const completedLessonPlans = await prisma.eTFOLessonPlan.count({
      where: {
        userId,
        // Consider completed if they have learning goals
        learningGoals: { not: null },
      },
    });

    // Get daybook entries progress
    const totalDaybookEntries = await prisma.daybookEntry.count({
      where: { userId },
    });

    const completedDaybookEntries = await prisma.daybookEntry.count({
      where: {
        userId,
        // Consider completed if they have reflections
        whatWorked: { not: null },
      },
    });

    const progressData = {
      curriculumExpectations: {
        total: Math.max(totalExpectations, 1), // Ensure at least 1 to avoid division by zero
        imported: importedExpectations,
        covered: importedExpectations, // For now, imported = covered
      },
      longRangePlans: {
        total: totalLongRangePlans,
        completed: completedLongRangePlans,
      },
      unitPlans: {
        total: totalUnitPlans,
        completed: completedUnitPlans,
      },
      lessonPlans: {
        total: totalLessonPlans,
        completed: completedLessonPlans,
      },
      daybookEntries: {
        total: totalDaybookEntries,
        completed: completedDaybookEntries,
      },
    };

    res.json(progressData);
  } catch (error) {
    console.error('Error fetching ETFO progress:', error);
    res.status(500).json({ error: 'Failed to fetch ETFO progress' });
  }
});

export default router;
