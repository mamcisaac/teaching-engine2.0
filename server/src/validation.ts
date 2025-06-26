import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
// import { ALLOWED_TEMPLATES } from './services/newsletterGenerator';

export const subjectSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional(),
  nameFr: z.string().optional(),
});

// Helper function to create bilingual fields
const bilingualString = (fieldName: string, required = false, options?: { max?: number }) => {
  const baseSchema = required ? z.string().min(1) : z.string();
  const schema = options?.max ? baseSchema.max(options.max) : baseSchema;
  return {
    [fieldName]: required ? schema : schema.optional(),
    [`${fieldName}En`]: z
      .string()
      .max(options?.max || Infinity)
      .optional(),
    [`${fieldName}Fr`]: z
      .string()
      .max(options?.max || Infinity)
      .optional(),
  };
};

// Create base schema without refinement for update
const baseMilestoneSchema = z.object({
  ...bilingualString('title', true),
  subjectId: z.number(),
  targetDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  estHours: z.number().int().optional(),
  ...bilingualString('description', false, { max: 10000 }),
  expectations: z.array(z.string()).optional(),
});

export const milestoneCreateSchema = baseMilestoneSchema.refine(
  (data) => !(data.startDate && data.endDate) || new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  },
);

export const milestoneUpdateSchema = baseMilestoneSchema
  .omit({ subjectId: true })
  .partial()
  .refine(
    (data) =>
      !(data.startDate && data.endDate) || new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    },
  );

export const activityCreateSchema = z.object({
  ...bilingualString('title', true),
  milestoneId: z.number(),
  activityType: z.enum(['LESSON', 'ASSESSMENT']).optional(),
  durationMins: z.number().int().optional(),
  ...bilingualString('privateNote'),
  ...bilingualString('publicNote'),
  ...bilingualString('materialsText', false, { max: 500 }),
  completedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  expectations: z.array(z.string()).optional(),
});

export const activityUpdateSchema = activityCreateSchema.omit({ milestoneId: true }).partial();

export const activityReorderSchema = z.object({
  milestoneId: z.number(),
  activityIds: z.array(z.number()),
});

export const activityMaterialsSchema = z.object({
  materialsText: z.string().max(500).optional(),
});

export const timetableEntrySchema = z.object({
  day: z.number().int().min(0).max(6),
  startMin: z.number().int().min(0).max(1440),
  endMin: z.number().int().min(1).max(1440),
  subjectId: z.number().int().optional().nullable(),
});

export const newsletterGenerateSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  template: z.string().optional(), // Legacy newsletter templates disabled
  includePhotos: z.boolean().optional(),
  useLLM: z.boolean().optional(),
  language: z.enum(['en', 'fr', 'both']).optional(),
});

export const newsletterCreateSchema = z.object({
  ...bilingualString('title', true),
  ...bilingualString('content', true),
  ...bilingualString('rawDraft'),
  ...bilingualString('polishedDraft'),
});

export const newsletterUpdateSchema = newsletterCreateSchema.partial();

export const smartGoalCreateSchema = z.object({
  outcomeId: z.string(),
  milestoneId: z.number().optional(),
  description: z.string().min(1).max(1000),
  targetDate: z
    .string()
    .datetime()
    .refine((date) => new Date(date) >= new Date(), {
      message: 'Target date must be today or in the future',
    }),
  targetValue: z.number().int().min(0).max(100),
});

export const smartGoalUpdateSchema = z.object({
  description: z.string().min(1).max(1000).optional(),
  targetDate: z
    .string()
    .datetime()
    .refine((date) => new Date(date) >= new Date(), {
      message: 'Target date must be today or in the future',
    })
    .optional(),
  targetValue: z.number().int().min(0).max(100).optional(),
  observedValue: z.number().int().min(0).max(100).optional(),
});

export const oralRoutineTemplateCreateSchema = z.object({
  ...bilingualString('title', true, { max: 200 }),
  ...bilingualString('description', false, { max: 1000 }),
  expectations: z.array(z.string()).optional(),
});

export const oralRoutineTemplateUpdateSchema = z.object({
  ...bilingualString('title', false, { max: 200 }),
  ...bilingualString('description', false, { max: 1000 }),
  expectations: z.array(z.string()).optional(),
});

export const dailyOralRoutineCreateSchema = z.object({
  date: z.string().datetime(),
  templateId: z.number().int().positive(),
  completed: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  participation: z.number().int().min(0).max(100).optional(),
});

export const dailyOralRoutineUpdateSchema = z.object({
  completed: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  participation: z.number().int().min(0).max(100).optional(),
});

const baseThematicUnitSchema = z.object({
  ...bilingualString('title', true, { max: 200 }),
  ...bilingualString('description', false, { max: 2000 }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  expectations: z.array(z.string()).optional(),
  activities: z.array(z.number().int()).optional(),
});

export const thematicUnitCreateSchema = baseThematicUnitSchema.refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  },
);

export const thematicUnitUpdateSchema = baseThematicUnitSchema
  .partial()
  .refine(
    (data) =>
      !(data.startDate && data.endDate) || new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    },
  );

export const parentMessageCreateSchema = z.object({
  ...bilingualString('title', true, { max: 200 }),
  timeframe: z.string().min(1).max(100),
  contentFr: z.string().min(1),
  contentEn: z.string().min(1),
  linkedOutcomeIds: z.array(z.string()).optional(),
  linkedActivityIds: z.array(z.number().int()).optional(),
});

export const parentMessageUpdateSchema = parentMessageCreateSchema.partial();

export const studentCreateSchema = z.object({
  name: z.string().min(1).max(200),
});

export const studentGoalCreateSchema = z.object({
  text: z.string().min(1).max(500),
  outcomeId: z.string().optional(),
  // themeId removed - ThematicUnit model archived
  unitPlanId: z.string().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).default('active'),
});

export const studentGoalUpdateSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  outcomeId: z.string().optional(),
  // themeId removed - ThematicUnit model archived
  unitPlanId: z.string().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
});

export const studentReflectionCreateSchema = z.object({
  date: z.string().datetime().optional(),
  text: z.string().max(1000).optional(),
  emoji: z.string().max(10).optional(),
  voicePath: z.string().max(500).optional(),
  outcomeId: z.string().optional(),
  // themeId removed - ThematicUnit model archived
  unitPlanId: z.string().optional(),
});

// CUID validation helper - matches Prisma @default(cuid()) format
export const cuidSchema = () => z.string().regex(/^c[0-9a-z]{24}$/, 'Invalid ID format');

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // For now, always validate req.body directly
    // The schemas should not wrap body in an object
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }

    req.body = result.data;
    next();
  };
}
