import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ALLOWED_TEMPLATES } from './services/newsletterGenerator';

export const subjectSchema = z.object({
  name: z.string().min(1),
});

export const milestoneCreateSchema = z.object({
  title: z.string().min(1),
  subjectId: z.number(),
  targetDate: z.string().datetime().optional(),
  estHours: z.number().int().optional(),
});

export const milestoneUpdateSchema = milestoneCreateSchema.omit({ subjectId: true });

export const activityCreateSchema = z.object({
  title: z.string().min(1),
  milestoneId: z.number(),
  durationMins: z.number().int().optional(),
  privateNote: z.string().optional(),
  publicNote: z.string().optional(),
  completedAt: z.string().datetime().optional(),
});

export const activityUpdateSchema = activityCreateSchema.omit({ milestoneId: true });

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
