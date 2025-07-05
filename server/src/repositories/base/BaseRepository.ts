import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';
import type { IRepository, PaginationOptions, PaginatedResult } from './IRepository';

export abstract class BaseRepository<T, CreateInput, UpdateInput>
  implements IRepository<T, CreateInput, UpdateInput>
{
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  protected get model() {
    return (this.prisma as Record<string, unknown>)[this.modelName];
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
  }): Promise<PaginatedResult<T>> {
    try {
      const { where = {}, include = {}, pagination = {} } = options || {};
      const { skip = 0, take = 20, orderBy = { id: 'desc' } } = pagination;

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          include,
          skip,
          take,
          orderBy,
        }),
        this.model.count({ where }),
      ]);

      return {
        data,
        total,
        skip,
        take,
        hasMore: skip + take < total,
      };
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
}
