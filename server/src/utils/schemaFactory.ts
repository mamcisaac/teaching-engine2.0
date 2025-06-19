import { z } from 'zod';

export interface BilingualField {
  base: string;
  en?: string;
  fr?: string;
}

export interface BilingualSchemaOptions {
  requireBilingual?: boolean;
  defaultLanguage?: 'en' | 'fr';
}

/**
 * Creates a bilingual schema for a field that has base, English, and French versions
 */
export function createBilingualSchema(
  fieldName: string,
  baseSchema: z.ZodTypeAny,
  options: BilingualSchemaOptions = {},
) {
  const { requireBilingual = false } = options;

  const schema: Record<string, z.ZodTypeAny> = {
    [fieldName]: baseSchema,
  };

  if (requireBilingual) {
    schema[`${fieldName}En`] = baseSchema;
    schema[`${fieldName}Fr`] = baseSchema;
  } else {
    schema[`${fieldName}En`] = baseSchema.optional();
    schema[`${fieldName}Fr`] = baseSchema.optional();
  }

  return schema;
}

/**
 * Creates a bilingual object schema with multiple fields
 */
export function createBilingualObjectSchema<T extends Record<string, z.ZodTypeAny>>(
  fields: T,
  options: BilingualSchemaOptions = {},
): z.ZodObject<T & Record<string, z.ZodTypeAny>> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  Object.entries(fields).forEach(([fieldName, fieldSchema]) => {
    Object.assign(schemaFields, createBilingualSchema(fieldName, fieldSchema, options));
  });

  return z.object(schemaFields) as z.ZodObject<T & Record<string, z.ZodTypeAny>>;
}

/**
 * Helper to create common bilingual schemas
 */
export const bilingualSchemas = {
  // String field with bilingual support
  string: (
    fieldName: string,
    options?: BilingualSchemaOptions & { min?: number; max?: number },
  ) => {
    let schema = z.string();
    if (options?.min) schema = schema.min(options.min);
    if (options?.max) schema = schema.max(options.max);
    return createBilingualSchema(fieldName, schema, options);
  },

  // Required string with bilingual support
  requiredString: (
    fieldName: string,
    options?: BilingualSchemaOptions & { min?: number; max?: number },
  ) => {
    let schema = z.string().min(1, `${fieldName} is required`);
    if (options?.min) schema = schema.min(options.min);
    if (options?.max) schema = schema.max(options.max);
    return createBilingualSchema(fieldName, schema, options);
  },

  // Optional text field with bilingual support
  text: (fieldName: string, options?: BilingualSchemaOptions) => {
    return createBilingualSchema(fieldName, z.string().optional(), options);
  },

  // Email field (usually not bilingual, but included for completeness)
  email: (fieldName: string = 'email') => ({
    [fieldName]: z.string().email('Invalid email address'),
  }),

  // Date field
  date: (fieldName: string) => ({
    [fieldName]: z
      .string()
      .datetime()
      .or(z.date())
      .transform((val) => new Date(val)),
  }),

  // Number field
  number: (fieldName: string, options?: { min?: number; max?: number }) => {
    let schema = z.number();
    if (options?.min !== undefined) schema = schema.min(options.min);
    if (options?.max !== undefined) schema = schema.max(options.max);
    return { [fieldName]: schema };
  },

  // Boolean field
  boolean: (fieldName: string) => ({
    [fieldName]: z.boolean(),
  }),

  // Enum field
  enum: <T extends readonly [string, ...string[]]>(fieldName: string, values: T) => ({
    [fieldName]: z.enum(values),
  }),
};

/**
 * Merges multiple schema objects into one
 */
export function mergeSchemas(
  ...schemas: Record<string, z.ZodTypeAny>[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const merged = schemas.reduce((acc, schema) => ({ ...acc, ...schema }), {});
  return z.object(merged);
}

/**
 * Creates a schema that validates bilingual data consistency
 */
export function createBilingualValidation(
  fieldName: string,
  options?: {
    requireAtLeastOne?: boolean;
    requireAll?: boolean;
  },
) {
  return z
    .object({
      [fieldName]: z.string().optional(),
      [`${fieldName}En`]: z.string().optional(),
      [`${fieldName}Fr`]: z.string().optional(),
    })
    .refine(
      (data) => {
        const base = data[fieldName];
        const en = data[`${fieldName}En`];
        const fr = data[`${fieldName}Fr`];

        if (options?.requireAll) {
          return !!(base && en && fr);
        }

        if (options?.requireAtLeastOne) {
          return !!(base || en || fr);
        }

        return true;
      },
      {
        message: options?.requireAll
          ? `All versions of ${fieldName} are required`
          : options?.requireAtLeastOne
            ? `At least one version of ${fieldName} is required`
            : undefined,
      },
    );
}

/**
 * Example usage:
 *
 * const subjectSchema = mergeSchemas(
 *   bilingualSchemas.requiredString('name'),
 *   bilingualSchemas.text('description'),
 *   bilingualSchemas.number('estHours', { min: 0 }),
 *   bilingualSchemas.date('targetDate')
 * );
 *
 * // Or with custom validation:
 * const activitySchema = createBilingualObjectSchema({
 *   title: z.string().min(1).max(100),
 *   description: z.string().optional(),
 *   duration: z.number().min(0).max(480),
 * });
 */
