import { z } from 'zod';

/**
 * Creates a bilingual field schema with a required base field and optional language variants
 * @param fieldName - The name of the field (e.g., 'title', 'description')
 * @param baseSchema - The Zod schema for the base field
 * @param options - Additional options for the schema
 */
export function createBilingualFieldSchema<T extends z.ZodTypeAny>(
  fieldName: string,
  baseSchema: T,
  options?: {
    baseRequired?: boolean;
    languages?: string[];
  }
) {
  const { baseRequired = true, languages = ['En', 'Fr'] } = options || {};

  const schema: Record<string, z.ZodTypeAny> = {
    [fieldName]: baseRequired ? baseSchema : baseSchema.optional(),
  };

  // Add language-specific fields
  languages.forEach((lang) => {
    schema[`${fieldName}${lang}`] = baseSchema.optional();
  });

  return schema;
}

/**
 * Creates a complete bilingual schema for an object with multiple fields
 * @param fields - Object mapping field names to their base schemas
 * @param options - Additional options for the schema
 */
export function createBilingualSchema(
  fields: Record<string, z.ZodTypeAny>,
  options?: {
    languages?: string[];
    additionalFields?: Record<string, z.ZodTypeAny>;
  }
) {
  const { languages = ['En', 'Fr'], additionalFields = {} } = options || {};

  let schema: Record<string, z.ZodTypeAny> = {};

  // Process each field
  Object.entries(fields).forEach(([fieldName, baseSchema]) => {
    const bilingualFields = createBilingualFieldSchema(fieldName, baseSchema, {
      baseRequired: !baseSchema.isOptional(),
      languages,
    });
    schema = { ...schema, ...bilingualFields };
  });

  // Add any additional non-bilingual fields
  schema = { ...schema, ...additionalFields };

  return z.object(schema);
}

// Example usage:
export const bilingualTitleSchema = createBilingualSchema({
  title: z.string().min(1),
});

export const bilingualContentSchema = createBilingualSchema({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string(),
});

export const bilingualActivitySchema = createBilingualSchema(
  {
    title: z.string().min(1),
    description: z.string().optional(),
    materials: z.string().optional(),
    instructions: z.string().optional(),
  },
  {
    additionalFields: {
      durationMins: z.number().int().positive(),
      subjectId: z.number().int(),
      milestoneId: z.number().int().optional(),
      outcomes: z.array(z.string()).optional(),
    },
  }
);