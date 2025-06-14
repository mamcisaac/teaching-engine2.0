import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ALLOWED_TEMPLATES } from './services/newsletterGenerator';

export const subjectSchema = z.object({
  name: z.string().min(1),
});

// Create base schema without refinement for update
const baseMilestoneSchema = z.object({
  title: z.string().min(1),
  subjectId: z.number(),
  targetDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  estHours: z.number().int().optional(),
  description: z.string().max(10000).optional(),
  outcomes: z.array(z.string()).optional(),
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
  .refine(
    (data) =>
      !(data.startDate && data.endDate) || new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    },
  );

export const activityCreateSchema = z.object({
  title: z.string().min(1),
  milestoneId: z.number(),
  activityType: z.enum(['LESSON', 'ASSESSMENT']).optional(),
  durationMins: z.number().int().optional(),
  privateNote: z.string().optional(),
  publicNote: z.string().optional(),
  materialsText: z.string().max(500).optional(),
  completedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
});

export const activityUpdateSchema = activityCreateSchema.omit({ milestoneId: true });

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
  template: z.enum(ALLOWED_TEMPLATES).optional(),
  includePhotos: z.boolean().optional(),
  useLLM: z.boolean().optional(),
});

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
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  outcomes: z.array(z.string()).optional(),
});

export const oralRoutineTemplateUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  outcomes: z.array(z.string()).optional(),
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

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
}
