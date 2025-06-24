import { Router, Request } from 'express';
import { aiPlanningAssistant } from '../services/aiPlanningAssistant';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

/**
 * POST /api/ai-planning/long-range/goals
 * Generate AI suggestions for long-range plan goals
 */
router.post('/long-range/goals', async (req: AuthenticatedRequest, res) => {
  try {
    const { subject, grade, termLength, focusAreas } = req.body;

    if (!subject || !grade || !termLength) {
      return res.status(400).json({ 
        error: 'Missing required fields: subject, grade, termLength' 
      });
    }

    const suggestions = await aiPlanningAssistant.generateLongRangeGoals({
      subject,
      grade: Number(grade),
      termLength: Number(termLength),
      focusAreas,
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating long-range goals:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/ai-planning/unit/big-ideas
 * Generate AI suggestions for unit plan big ideas
 */
router.post('/unit/big-ideas', async (req: AuthenticatedRequest, res) => {
  try {
    const { unitTitle, subject, grade, curriculumExpectations, duration } = req.body;

    if (!unitTitle || !subject || !grade || !curriculumExpectations || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields: unitTitle, subject, grade, curriculumExpectations, duration' 
      });
    }

    const suggestions = await aiPlanningAssistant.generateUnitBigIdeas({
      unitTitle,
      subject,
      grade: Number(grade),
      curriculumExpectations,
      duration: Number(duration),
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating unit big ideas:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/ai-planning/lesson/activities
 * Generate AI suggestions for lesson activities
 */
router.post('/lesson/activities', async (req: AuthenticatedRequest, res) => {
  try {
    const { lessonTitle, learningGoals, subject, grade, duration, materials } = req.body;

    if (!lessonTitle || !learningGoals || !subject || !grade || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields: lessonTitle, learningGoals, subject, grade, duration' 
      });
    }

    const suggestions = await aiPlanningAssistant.generateLessonActivities({
      lessonTitle,
      learningGoals,
      subject,
      grade: Number(grade),
      duration: Number(duration),
      materials,
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating lesson activities:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/ai-planning/lesson/materials
 * Generate AI suggestions for materials list
 */
router.post('/lesson/materials', async (req: AuthenticatedRequest, res) => {
  try {
    const { activities, subject, grade, classSize } = req.body;

    if (!activities || !subject || !grade) {
      return res.status(400).json({ 
        error: 'Missing required fields: activities, subject, grade' 
      });
    }

    const suggestions = await aiPlanningAssistant.generateMaterialsList({
      activities,
      subject,
      grade: Number(grade),
      classSize: Number(classSize) || 25,
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating materials list:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/ai-planning/lesson/assessments
 * Generate AI suggestions for assessment strategies
 */
router.post('/lesson/assessments', async (req: AuthenticatedRequest, res) => {
  try {
    const { learningGoals, activities, subject, grade } = req.body;

    if (!learningGoals || !activities || !subject || !grade) {
      return res.status(400).json({ 
        error: 'Missing required fields: learningGoals, activities, subject, grade' 
      });
    }

    const suggestions = await aiPlanningAssistant.generateAssessmentStrategies({
      learningGoals,
      activities,
      subject,
      grade: Number(grade),
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating assessment strategies:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/ai-planning/daybook/reflections
 * Generate AI suggestions for daybook reflection prompts
 */
router.post('/daybook/reflections', async (req: AuthenticatedRequest, res) => {
  try {
    const { date, activities, subject, grade, previousReflections } = req.body;

    if (!date || !activities || !subject || !grade) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, activities, subject, grade' 
      });
    }

    const suggestions = await aiPlanningAssistant.generateReflectionPrompts({
      date: new Date(date),
      activities,
      subject,
      grade: Number(grade),
      previousReflections,
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating reflection prompts:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/ai-planning/curriculum-aligned
 * Get curriculum-aligned suggestions
 */
router.post('/curriculum-aligned', async (req: AuthenticatedRequest, res) => {
  try {
    const { expectationIds, suggestionType } = req.body;

    if (!expectationIds || !suggestionType) {
      return res.status(400).json({ 
        error: 'Missing required fields: expectationIds, suggestionType' 
      });
    }

    if (!['activities', 'assessments', 'resources'].includes(suggestionType)) {
      return res.status(400).json({ 
        error: 'Invalid suggestionType. Must be: activities, assessments, or resources' 
      });
    }

    const suggestions = await aiPlanningAssistant.getCurriculumAlignedSuggestions(
      expectationIds,
      suggestionType as 'activities' | 'assessments' | 'resources'
    );

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating curriculum-aligned suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

export default router;