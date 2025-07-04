import { Prisma } from '@prisma/client';
import { measureDatabaseQuery } from './performance';

// Common database query builders
export const dbUtils = {
  // Pagination helpers
  getPaginationParams: (page: number = 1, pageSize: number = 20) => {
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    
    return { skip, take };
  },
  
  // Sorting helpers
  getSortingParams: (
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    allowedFields: string[] = []
  ) => {
    if (!sortBy || !allowedFields.includes(sortBy)) {
      return undefined;
    }
    
    return { [sortBy]: sortOrder };
  },
  
  // Date range query builder
  buildDateRangeQuery: (
    fieldName: string,
    from?: Date | string,
    to?: Date | string
  ) => {
    const conditions: any = {};
    
    if (from) {
      conditions.gte = new Date(from);
    }
    
    if (to) {
      conditions.lte = new Date(to);
    }
    
    return Object.keys(conditions).length > 0 ? { [fieldName]: conditions } : {};
  },
  
  // Search query builder
  buildSearchQuery: (
    searchTerm: string,
    fields: string[]
  ): Prisma.JsonObject => {
    if (!searchTerm || fields.length === 0) {
      return {};
    }
    
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })),
    };
  },
  
  // User-scoped query builder
  buildUserScopedQuery: (
    userId: number,
    additionalConditions: Prisma.JsonObject = {}
  ) => {
    return {
      ...additionalConditions,
      userId,
    };
  },
  
  // Active record query
  buildActiveQuery: (
    isActiveField: string = 'isActive',
    additionalConditions: Prisma.JsonObject = {}
  ) => {
    return {
      ...additionalConditions,
      [isActiveField]: true,
    };
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
    const include: any = {};
    
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
  prisma: any,
  callback: (tx: any) => Promise<T>
): Promise<T> => {
  return measureDatabaseQuery('transaction', async () => {
    return prisma.$transaction(async (tx: any) => {
      return callback(tx);
    });
  });
};

// Batch operations
export const batchCreate = async <T>(
  model: any,
  data: T[],
  chunkSize: number = 100
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
  model: any,
  updates: Array<{ where: any; data: T }>,
  chunkSize: number = 50
): Promise<number> => {
  let updated = 0;
  
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    
    const results = await Promise.all(
      chunk.map(({ where, data }) =>
        model.update({ where, data }).catch(() => null)
      )
    );
    
    updated += results.filter(r => r !== null).length;
  }
  
  return updated;
};

export const batchDelete = async (
  model: any,
  ids: Array<string | number>,
  chunkSize: number = 100
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
  model: any,
  records: Array<{
    where: any;
    create: T;
    update: Partial<T>;
  }>
): Promise<any[]> => {
  return Promise.all(
    records.map(({ where, create, update }) =>
      model.upsert({ where, create, update })
    )
  );
};

// Aggregation helpers
export const getCountByField = async (
  model: any,
  field: string,
  where: any = {}
): Promise<Array<{ field: any; count: number }>> => {
  const results = await model.groupBy({
    by: [field],
    where,
    _count: true,
  });
  
  return results.map((r: any) => ({
    field: r[field],
    count: r._count,
  }));
};

export const getSumByField = async (
  model: any,
  sumField: string,
  groupByField: string,
  where: any = {}
): Promise<Array<{ field: any; sum: number }>> => {
  const results = await model.groupBy({
    by: [groupByField],
    where,
    _sum: {
      [sumField]: true,
    },
  });
  
  return results.map((r: any) => ({
    field: r[groupByField],
    sum: r._sum[sumField] || 0,
  }));
};

// Soft delete helper
export const softDelete = async (
  model: any,
  id: string | number,
  deletedAtField: string = 'deletedAt'
): Promise<any> => {
  return model.update({
    where: { id },
    data: { [deletedAtField]: new Date() },
  });
};

// Find or create helper
export const findOrCreate = async <T>(
  model: any,
  where: any,
  create: T
): Promise<{ record: any; created: boolean }> => {
  const existing = await model.findUnique({ where });
  
  if (existing) {
    return { record: existing, created: false };
  }
  
  const record = await model.create({ data: create });
  return { record, created: true };
};

// Query optimization helpers
export const optimizedCount = async (
  model: any,
  where: any = {}
): Promise<number> => {
  // Use raw query for better performance on large tables
  const tableName = model.name || model.constructor.name;
  const whereClause = Object.keys(where).length > 0
    ? `WHERE ${Object.entries(where)
        .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(' AND ')}`
    : '';
  
  const result = await model.$queryRaw`
    SELECT COUNT(*) as count FROM ${Prisma.sql([tableName])} ${Prisma.sql([whereClause])}
  `;
  
  return Number(result[0]?.count || 0);
};

// Connection helpers
export const testConnection = async (prisma: any): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

export const getConnectionInfo = async (prisma: any): Promise<any> => {
  const [version, tables, size] = await Promise.all([
    prisma.$queryRaw`SELECT sqlite_version() as version`,
    prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`,
    prisma.$queryRaw`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`,
  ]);
  
  return {
    version: version[0]?.version,
    tableCount: tables.length,
    sizeBytes: size[0]?.size || 0,
  };
};