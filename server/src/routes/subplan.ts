import { Router } from 'express';
import { prisma } from '../prisma';
import { generateSubPlanPDF, SubPlanInput } from '../services/subPlanGenerator';
import { generateSubPlan } from '../services/subPlanService';
import { sendSubPlanEmail } from '../services/subPlanEmailService';
import { extractWeeklyPlan } from '../services/weeklyPlanExtractor';
import { extractScenarioTemplates, autoDetectScenario, getScenarioById, generateScenarioContent } from '../services/scenarioTemplateExtractor';
import { extractSchoolContacts, formatContactsForSubPlan, getEmergencyContactsList, generateEmergencyContactCard } from '../services/contactExtractor';
import { extractDayMaterials, extractWeeklyMaterials } from '../services/materialExtractor';

const router = Router();

function minToTime(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

router.post('/', async (req, res, next) => {
  try {
    let data = req.body as SubPlanInput;
    if (!data.today && req.query.date) {
      const plan = await prisma.dailyPlan.findFirst({
        where: { date: new Date(String(req.query.date)) },
        include: { 
          items: { 
            include: { 
              activity: { 
                include: { 
                  outcomes: { include: { outcome: true } } 
                } 
              }, 
              slot: true 
            } 
          } 
        },
      });
      
      if (plan) {
        // Extract all unique outcomes from activities
        const uniqueOutcomes = new Map<string, {
          code: string;
          description: string;
          subject: string;
        }>();
        
        for (const item of plan.items) {
          if (item.activity?.outcomes) {
            for (const outcomeRelation of item.activity.outcomes) {
              const outcome = outcomeRelation.outcome;
              uniqueOutcomes.set(outcome.id, {
                code: outcome.code,
                description: outcome.description,
                subject: outcome.subject
              });
            }
          }
        }
        
        data = {
          today: plan.items.map((i) => ({
            time: minToTime(i.startMin),
            activity: i.activity?.title ?? '',
          })),
          upcoming: [],
          procedures: '',
          studentNotes: '',
          emergencyContacts: '',
          curriculumOutcomes: Array.from(uniqueOutcomes.values())
        };
      }
    }
    const pdf = await generateSubPlanPDF(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const date = (req.query.date as string) || req.body.date || new Date().toISOString().slice(0, 10);
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    // Validate date is valid
    const testDate = new Date(date);
    if (isNaN(testDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided' });
    }
    
    const days = Math.min(3, Math.max(1, Number(req.query.days) || req.body.days || 1));
    
    // Extract options from request body
    const options = {
      includeGoals: req.body.includeGoals !== false,
      includeRoutines: req.body.includeRoutines !== false,
      includePlans: req.body.includePlans !== false,
      anonymize: req.body.anonymize === true,
      userId: req.body.userId || 1
    };
    
    const pdf = await generateSubPlan(date, days, options);
    
    // Save sub plan record if requested
    if (req.body.saveRecord) {
      await prisma.subPlanRecord.create({
        data: {
          userId: options.userId,
          date: new Date(date),
          daysCount: days,
          content: {
            date,
            days,
            options
          },
          includeGoals: options.includeGoals,
          includeRoutines: options.includeRoutines,
          includePlans: options.includePlans,
          anonymized: options.anonymize,
          emailedTo: req.body.emailTo,
          notes: req.body.notes
        }
      });
    }
    
    // Send email if requested
    if (req.body.emailTo) {
      const user = await prisma.user.findUnique({ where: { id: options.userId } });
      await sendSubPlanEmail({
        ...options,
        date,
        days,
        recipientEmail: req.body.emailTo,
        teacherName: user?.name || 'Teacher',
        additionalMessage: req.body.notes
      });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

// Get saved sub plan records
router.get('/records', async (req, res, next) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const records = await prisma.subPlanRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// Get class routines
router.get('/routines', async (req, res, next) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const routines = await prisma.classRoutine.findMany({
      where: { userId, isActive: true },
      orderBy: [{ priority: 'desc' }, { category: 'asc' }]
    });
    res.json(routines);
  } catch (err) {
    next(err);
  }
});

// Create or update class routine
router.post('/routines', async (req, res, next) => {
  try {
    const { id, ...data } = req.body;
    if (id) {
      const routine = await prisma.classRoutine.update({
        where: { id },
        data
      });
      res.json(routine);
    } else {
      const routine = await prisma.classRoutine.create({
        data: {
          ...data,
          userId: data.userId || 1
        }
      });
      res.json(routine);
    }
  } catch (err) {
    next(err);
  }
});

// Delete class routine
router.delete('/routines/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.classRoutine.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Generate fallback activity suggestions
router.post('/fallback/generate', async (req, res, next) => {
  try {
    const { subjectId, gradeLevel } = req.body;
    
    // Get or create fallback activities for the subject
    let fallbackActivity = await prisma.activity.findFirst({
      where: {
        isFallback: true,
        milestone: { subjectId }
      }
    });
    
    if (!fallbackActivity && subjectId) {
      // Create a generic fallback activity
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      const milestone = await prisma.milestone.findFirst({ 
        where: { subjectId },
        orderBy: { targetDate: 'asc' }
      });
      
      if (milestone) {
        fallbackActivity = await prisma.activity.create({
          data: {
            title: `${subject?.name || 'General'} Review & Practice`,
            titleEn: `${subject?.nameEn || subject?.name || 'General'} Review & Practice`,
            titleFr: `Révision et pratique de ${subject?.nameFr || subject?.name || 'général'}`,
            publicNote: 'Review previous lessons and practice core skills through worksheets and quiet activities',
            durationMins: 45,
            milestoneId: milestone.id,
            isFallback: true,
            isSubFriendly: true,
            activityType: 'LESSON'
          }
        });
      }
    }
    
    res.json({
      activity: fallbackActivity,
      suggestions: [
        'Use practice worksheets from the substitute folder',
        'Have students complete journal reflections on recent learning',
        'Conduct quiet reading time with comprehension questions',
        'Review vocabulary or math facts through partner games',
        'Complete unfinished work from previous lessons'
      ]
    });
  } catch (err) {
    next(err);
  }
});

// ========== NEW EXTRACTION ENDPOINTS ==========

// Extract weekly plan data for comprehensive substitute planning
router.get('/extract/weekly', async (req, res, next) => {
  try {
    const startDate = req.query.startDate as string || new Date().toISOString().slice(0, 10);
    const numDays = Math.min(5, Math.max(1, Number(req.query.days) || 5));
    const userId = Number(req.query.userId) || 1;
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({ error: 'Start date must be in YYYY-MM-DD format' });
    }
    
    const options = {
      includeGoals: req.query.includeGoals !== 'false',
      includeRoutines: req.query.includeRoutines !== 'false',
      includePlans: req.query.includePlans !== 'false',
      anonymize: req.query.anonymize === 'true',
      userId
    };
    
    const weeklyPlan = await extractWeeklyPlan(startDate, numDays, options);
    res.json(weeklyPlan);
  } catch (err) {
    next(err);
  }
});

// Extract emergency scenario templates
router.get('/extract/scenarios', async (req, res, next) => {
  try {
    const conditions = {
      weather: req.query.weather as any,
      technology: req.query.technology as any,
      staffing: req.query.staffing as any,
      building: req.query.building as any
    };
    
    // Filter out undefined values
    const filteredConditions = Object.fromEntries(
      Object.entries(conditions).filter(([_, value]) => value !== undefined)
    );
    
    const scenarios = await extractScenarioTemplates(
      Object.keys(filteredConditions).length > 0 ? filteredConditions : undefined
    );
    
    res.json(scenarios);
  } catch (err) {
    next(err);
  }
});

// Auto-detect appropriate scenario
router.get('/extract/scenarios/auto', async (req, res, next) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const scenario = await autoDetectScenario(userId);
    res.json(scenario);
  } catch (err) {
    next(err);
  }
});

// Get specific scenario by ID with generated content
router.get('/extract/scenarios/:scenarioId', async (req, res, next) => {
  try {
    const { scenarioId } = req.params;
    const teacherName = req.query.teacherName as string;
    const className = req.query.className as string;
    
    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const content = generateScenarioContent(scenario, teacherName, className);
    
    res.json({
      scenario,
      generatedContent: content
    });
  } catch (err) {
    next(err);
  }
});

// Extract school contacts
router.get('/extract/contacts', async (req, res, next) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const format = req.query.format as string || 'organized';
    
    const contacts = await extractSchoolContacts(userId);
    
    if (format === 'emergency') {
      const emergencyList = getEmergencyContactsList(contacts);
      res.json({ emergencyContacts: emergencyList });
    } else if (format === 'card') {
      const card = generateEmergencyContactCard(contacts);
      res.json({ contactCard: card });
    } else if (format === 'formatted') {
      const formatted = formatContactsForSubPlan(contacts);
      res.json({ formattedContacts: formatted });
    } else {
      res.json(contacts);
    }
  } catch (err) {
    next(err);
  }
});

// Extract materials for a specific day
router.get('/extract/materials/day', async (req, res, next) => {
  try {
    const date = req.query.date as string || new Date().toISOString().slice(0, 10);
    const userId = Number(req.query.userId) || 1;
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    const materials = await extractDayMaterials(date, userId);
    res.json(materials);
  } catch (err) {
    next(err);
  }
});

// Extract materials for multiple days
router.get('/extract/materials/weekly', async (req, res, next) => {
  try {
    const startDate = req.query.startDate as string || new Date().toISOString().slice(0, 10);
    const numDays = Math.min(5, Math.max(1, Number(req.query.days) || 5));
    const userId = Number(req.query.userId) || 1;
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({ error: 'Start date must be in YYYY-MM-DD format' });
    }
    
    const weeklyMaterials = await extractWeeklyMaterials(startDate, numDays, userId);
    res.json(weeklyMaterials);
  } catch (err) {
    next(err);
  }
});

// Generate comprehensive substitute plan with all extraction features
router.post('/extract/comprehensive', async (req, res, next) => {
  try {
    const {
      startDate = new Date().toISOString().slice(0, 10),
      numDays = 1,
      userId = 1,
      includeWeeklyOverview = true,
      includeScenarios = true,
      includeContacts = true,
      includeMaterials = true,
      scenarioConditions,
      options = {}
    } = req.body;
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({ error: 'Start date must be in YYYY-MM-DD format' });
    }
    
    const extractionResults: any = {
      metadata: {
        extractedAt: new Date().toISOString(),
        startDate,
        numDays,
        userId
      }
    };
    
    // Extract weekly plan if multiple days or overview requested
    if (numDays > 1 || includeWeeklyOverview) {
      extractionResults.weeklyPlan = await extractWeeklyPlan(startDate, numDays, options);
    }
    
    // Extract scenario information
    if (includeScenarios) {
      extractionResults.scenarios = await extractScenarioTemplates(scenarioConditions);
      extractionResults.recommendedScenario = await autoDetectScenario(userId);
    }
    
    // Extract contacts
    if (includeContacts) {
      extractionResults.contacts = await extractSchoolContacts(userId);
      extractionResults.emergencyContacts = getEmergencyContactsList(extractionResults.contacts);
    }
    
    // Extract materials
    if (includeMaterials) {
      if (numDays === 1) {
        extractionResults.materials = await extractDayMaterials(startDate, userId);
      } else {
        extractionResults.materials = await extractWeeklyMaterials(startDate, numDays, userId);
      }
    }
    
    res.json(extractionResults);
  } catch (err) {
    next(err);
  }
});

export default router;
