import { PrismaClient } from '@prisma/client';
import logger from '../../logger';
import type { IRepository } from './IRepository';
import {
  PaginationOptions,
  PaginatedResponse,
  createPaginatedResponse,
  getPrismaArgs,
  createSearchFilter,
  combineFilters,
  fetchPaginatedData,
} from '../../utils/pagination';

export abstract class BaseRepository<T extends { id: number }, CreateInput, UpdateInput>
  implements IRepository<T, CreateInput, UpdateInput>
{
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  protected get model(): PrismaClient[keyof PrismaClient] {
    return (this.prisma as PrismaClient)[this.modelName as keyof PrismaClient];
  }

  async findById(id: number): Promise<T | null> {
    try {
      const result = await this.model.findUnique({
        where: { id },
      });
      return result;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by id:`, error);
      throw error;
    }
  }

  async findMany(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
    pagination?: PaginationOptions;
    searchFields?: string[];
  }): Promise<PaginatedResponse<T>> {
    try {
      const {
        where = {},
        include = {},
        pagination = { page: 1, limit: 20 },
        searchFields = [],
      } = options || {};

      // Build search filter if search term provided
      const searchFilter = createSearchFilter(pagination.search, searchFields);
      const combinedWhere = combineFilters(where, searchFilter);

      // Get Prisma args for pagination
      const prismaArgs = getPrismaArgs(pagination);

      // Fetch data and count in parallel
      const { data, total } = await fetchPaginatedData(
        () => this.model.count({ where: combinedWhere }),
        () =>
          this.model.findMany({
            where: combinedWhere,
            include,
            ...prismaArgs,
          }),
        pagination,
      );

      return createPaginatedResponse(data as T[], {
        page: pagination.page,
        limit: pagination.limit,
        total,
      });
    } catch (error) {
      logger.error(`Error finding many ${this.modelName}:`, error);
      throw error;
    }
  }

  async findFirst(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
  }): Promise<T | null> {
    try {
      const { where = {}, include = {} } = options || {};
      const result = await this.model.findFirst({
        where,
        include,
      });
      return result;
    } catch (error) {
      logger.error(`Error finding first ${this.modelName}:`, error);
      throw error;
    }
  }

  async create(data: CreateInput): Promise<T> {
    try {
      const result = await this.model.create({
        data,
      });
      logger.info(`Created ${this.modelName} with id: ${result.id}`);
      return result;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}:`, error);
      throw error;
    }
  }

  async update(id: number, data: UpdateInput): Promise<T> {
    try {
      const result = await this.model.update({
        where: { id },
        data,
      });
      logger.info(`Updated ${this.modelName} with id: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error updating ${this.modelName}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<T> {
    try {
      const result = await this.model.delete({
        where: { id },
      });
      logger.info(`Deleted ${this.modelName} with id: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}:`, error);
      throw error;
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      const result = await this.model.count({ where });
      return result;
    } catch (error) {
      logger.error(`Error counting ${this.modelName}:`, error);
      throw error;
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const count = await this.model.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existence of ${this.modelName}:`, error);
      throw error;
    }
  }

  // Transaction support
  async transaction<R>(fn: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }

  // Cursor-based pagination for real-time data
  async findManyCursor(options?: {
    where?: Record<string, unknown>;
    include?: Record<string, boolean>;
    cursor?: number;
    limit?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<{ data: T[]; nextCursor?: number }> {
    try {
      const {
        where = {},
        include = {},
        cursor,
        limit = 20,
        orderBy = { id: 'desc' },
      } = options || {};

      const queryArgs: {
        where: Record<string, unknown>;
        include: Record<string, boolean>;
        take: number;
        orderBy: Record<string, 'asc' | 'desc'>;
        cursor?: { id: number };
        skip?: number;
      } = {
        where,
        include,
        take: limit + 1, // Fetch one extra to check if there's more
        orderBy,
      };

      if (cursor) {
        queryArgs.cursor = { id: cursor };
        queryArgs.skip = 1; // Skip the cursor item
      }

      const items = await this.model.findMany(queryArgs);

      let nextCursor: number | undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        data: items,
        nextCursor,
      };
    } catch (error) {
      logger.error(`Error finding many with cursor ${this.modelName}:`, error);
      throw error;
    }
  }
}
