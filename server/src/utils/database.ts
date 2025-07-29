import { Prisma } from '@prisma/client';
import { measureDatabaseQuery } from './performance';
import { validateFieldName } from '../../../scripts/db-security-utils';

// Type definitions for better type safety
type PrismaModel = {
  findUnique: (args?: { where: Prisma.JsonObject }) => Promise<unknown>;
  findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
  findFirst: (args?: Record<string, unknown>) => Promise<unknown>;
  create: (args: { data: unknown }) => Promise<unknown>;
  createMany: (args: { data: unknown[] }) => Promise<Prisma.BatchPayload>;
  update: (args: { where: Prisma.JsonObject; data: Prisma.JsonObject }) => Promise<unknown>;
  updateMany: (args: { where?: Prisma.JsonObject; data: Prisma.JsonObject }) => Promise<Prisma.BatchPayload>;
  upsert: (args: { where: Prisma.JsonObject; create: unknown; update: unknown }) => Promise<unknown>;
  delete: (args: { where: Prisma.JsonObject }) => Promise<unknown>;
  deleteMany: (args?: { where?: Prisma.JsonObject }) => Promise<Prisma.BatchPayload>;
  count: (args?: { where?: Prisma.JsonObject }) => Promise<number>;
  aggregate: (args: Record<string, unknown>) => Promise<unknown>;
  groupBy: (args: { by: string[]; where?: Prisma.JsonObject; _count?: boolean; _sum?: Record<string, boolean> }) => Promise<unknown[]>;
  name?: string;
  constructor: { name: string };
};

type PrismaClientLike = {
  $queryRaw: <T = unknown>(query: TemplateStringsArray, ...values: unknown[]) => Promise<T>;
  $transaction: <T>(fn: (tx: PrismaTransactionClient) => Promise<T>) => Promise<T>;
};

type PrismaTransactionClient = Omit<PrismaClientLike, '$transaction'>;

// Common database query builders
export const dbUtils = {
  // Pagination helpers
  getPaginationParams: (page: number = 1, pageSize: number = 20) => {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    return { skip, take };
  },

  // Sorting helpers with enhanced security validation
  getSortingParams: (
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    allowedFields: string[] = [],
  ) => {
    if (!sortBy || !allowedFields.includes(sortBy)) {
      return undefined;
    }

    try {
      // Validate the field name using security utilities
      const validatedFieldName = validateFieldName(sortBy, allowedFields);
      return { [validatedFieldName]: sortOrder };
    } catch (error) {
      // Log security violation but don't expose details
      console.warn(`Security violation: Invalid sort field attempted: ${sortBy}`);
      return undefined;
    }
  },

  // Date range query builder with field validation
  buildDateRangeQuery: (fieldName: string, from?: Date | string, to?: Date | string, allowedFields?: string[]) => {
    try {
      // Validate field name for security
      const validatedFieldName = validateFieldName(fieldName, allowedFields);
      
      const conditions: { gte?: Date; lte?: Date } = {};

      if (from) {
        conditions.gte = new Date(from);
      }

      if (to) {
        conditions.lte = new Date(to);
      }

      return Object.keys(conditions).length > 0 ? { [validatedFieldName]: conditions } : {};
    } catch (error) {
      console.warn(`Security violation: Invalid date range field attempted: ${fieldName}`);
      return {};
    }
  },

  // Search query builder with field validation
  buildSearchQuery: (searchTerm: string, fields: string[], allowedFields?: string[]): Prisma.JsonObject => {
    if (!searchTerm || fields.length === 0) {
      return {};
    }

    try {
      // Validate all field names for security
      const validatedFields = fields.map(field => {
        // If allowedFields is provided, validate against it
        if (allowedFields && !allowedFields.includes(field)) {
          throw new Error(`Field not in allowlist: ${field}`);
        }
        return validateFieldName(field, allowedFields);
      });

      return {
        OR: validatedFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        })),
      };
    } catch (error) {
      console.warn(`Security violation: Invalid search fields attempted: ${fields.join(', ')}`);
      return {};
    }
  },

  // User-scoped query builder
  buildUserScopedQuery: (userId: number, additionalConditions: Prisma.JsonObject = {}) => {
    return {
      ...additionalConditions,
      userId,
    };
  },

  // Active record query with field validation
  buildActiveQuery: (
    isActiveField: string = 'isActive',
    additionalConditions: Prisma.JsonObject = {},
    allowedFields?: string[],
  ) => {
    try {
      // Validate the field name for security
      const validatedFieldName = validateFieldName(isActiveField, allowedFields);
      
      return {
        ...additionalConditions,
        [validatedFieldName]: true,
      };
    } catch (error) {
      console.warn(`Security violation: Invalid active field attempted: ${isActiveField}`);
      // Return a safe default that won't match anything
      return {
        ...additionalConditions,
        __invalid_field__: true,
      };
    }
  },
};

// Common include patterns
export const commonIncludes = {
  // User with basic info
  userBasic: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },

  // With counts
  withCounts: (relations: string[]) => {
    const include: Record<string, { _count: boolean }> = {};

    for (const relation of relations) {
      include[relation] = {
        _count: true,
      };
    }

    return include;
  },

  // With limited relations
  withLimitedRelations: (relation: string, limit: number = 5) => ({
    [relation]: {
      take: limit,
      orderBy: { createdAt: 'desc' },
    },
  }),
};

// Transaction helper
export const withTransaction = async <T>(
  prisma: PrismaClientLike,
  callback: (tx: PrismaTransactionClient) => Promise<T>,
): Promise<T> => {
  return measureDatabaseQuery('transaction', async () => {
    return prisma.$transaction(async (tx) => {
      return callback(tx);
    });
  });
};

// Batch operations
export const batchCreate = async <T>(
  model: PrismaModel,
  data: T[],
  chunkSize: number = 100,
): Promise<number> => {
  let created = 0;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const result = await model.createMany({ data: chunk });
    created += result.count;
  }

  return created;
};

export const batchUpdate = async <T>(
  model: PrismaModel,
  updates: Array<{ where: Prisma.JsonObject; data: T }>,
  chunkSize: number = 50,
): Promise<number> => {
  let updated = 0;

  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);

    const results = await Promise.all(
      chunk.map(
        ({ where, data }): Promise<unknown> => 
          model.update({ where, data: data as Prisma.JsonObject }).catch(() => null),
      ),
    );

    updated += results.filter((r) => r !== null).length;
  }

  return updated;
};

export const batchDelete = async (
  model: PrismaModel,
  ids: Array<string | number>,
  chunkSize: number = 100,
): Promise<number> => {
  let deleted = 0;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const result = await model.deleteMany({
      where: { id: { in: chunk } },
    });
    deleted += result.count;
  }

  return deleted;
};

// Upsert helper
export const upsertMany = async <T>(
  model: PrismaModel,
  records: Array<{
    where: Prisma.JsonObject;
    create: T;
    update: Partial<T>;
  }>,
): Promise<unknown[]> => {
  return Promise.all(
    records.map(({ where, create, update }) => 
      model.upsert({ where, create, update })
    ),
  );
};

// Aggregation helpers
export const getCountByField = async (
  model: PrismaModel,
  field: string,
  where: Prisma.JsonObject = {},
): Promise<Array<{ field: unknown; count: number }>> => {
  const results = await model.groupBy({
    by: [field],
    where,
    _count: true,
  });

  return (results as Array<Record<string, unknown> & { _count: number }>).map((r) => ({
    field: r[field],
    count: r._count,
  }));
};

export const getSumByField = async (
  model: PrismaModel,
  sumField: string,
  groupByField: string,
  where: Prisma.JsonObject = {},
): Promise<Array<{ field: unknown; sum: number }>> => {
  const results = await model.groupBy({
    by: [groupByField],
    where,
    _sum: {
      [sumField]: true,
    },
  });

  return (results as Array<Record<string, unknown> & { _sum: Record<string, number | null> }>).map((r) => ({
    field: r[groupByField],
    sum: r._sum?.[sumField] ?? 0,
  }));
};

// Soft delete helper
export const softDelete = async (
  model: PrismaModel,
  id: string | number,
  deletedAtField: string = 'deletedAt',
): Promise<unknown> => {
  const data: Record<string, unknown> = {};
  data[deletedAtField] = new Date();
  
  return model.update({
    where: { id },
    data: data as Prisma.JsonObject,
  });
};

// Find or create helper
export const findOrCreate = async <T>(
  model: PrismaModel,
  where: Prisma.JsonObject,
  create: T,
): Promise<{ record: unknown; created: boolean }> => {
  const existing = await model.findUnique({ where });

  if (existing) {
    return { record: existing, created: false };
  }

  const record = await model.create({ data: create });
  return { record, created: true };
};

// Query optimization helpers
export const optimizedCount = async (
  model: PrismaModel,
  where: Prisma.JsonObject = {},
  _prisma: PrismaClientLike,
): Promise<number> => {
  // SECURITY: Don't use raw queries with dynamic table names from model.name/constructor.name
  // These can be manipulated and lead to SQL injection vulnerabilities
  // Instead, always fall back to the safe Prisma count method
  
  // For production safety, we always use the Prisma count method which is safe
  // Raw query optimization is disabled due to security concerns with dynamic table names
  return model.count({ where });
};

// Connection helpers
export const testConnection = async (prisma: PrismaClientLike): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

export const getConnectionInfo = async (prisma: PrismaClientLike): Promise<{
  version: string;
  tableCount: number;
  sizeBytes: number;
}> => {
  try {
    // Use safe, parameterized queries with no dynamic content
    const [version, tables, size] = await Promise.all([
      prisma.$queryRaw<Array<{ version: string }>>`SELECT sqlite_version() as version`,
      prisma.$queryRaw<Array<{ name: string }>>`SELECT name FROM sqlite_master WHERE type = 'table'`,
      prisma.$queryRaw<Array<{ size: number }>>`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`,
    ]);

    return {
      version: version[0]?.version ?? 'unknown',
      tableCount: tables.length,
      sizeBytes: size[0]?.size ?? 0,
    };
  } catch (error) {
    // Return safe defaults if queries fail
    console.warn('Failed to get connection info:', error);
    return {
      version: 'unknown',
      tableCount: 0,
      sizeBytes: 0,
    };
  }
};
