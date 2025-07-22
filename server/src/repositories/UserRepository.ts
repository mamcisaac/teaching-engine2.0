import type { User, Prisma, PrismaClient } from '@prisma/client';

import { logger } from '../logger';
import { isRepositoryError } from '../types/repository';
import type { PrismaModelDelegate } from '../types/repository';
import { hashPassword } from '../utils/auth';

import { BaseRepository } from './base/BaseRepository';

export interface UserWithoutPassword {
  id: number;
  email: string;
  name: string;
  role: string;
  preferredLanguage: string;
}

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  protected modelDelegate: PrismaModelDelegate<User, Prisma.UserCreateInput, Prisma.UserUpdateInput>;

  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
    this.modelDelegate = prisma.user;
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.model.findUnique({
        where: { email: email.toLowerCase() },
      });
      return user;
    } catch (error: unknown) {
      const errorMessage = isRepositoryError(error) ? error.message : String(error);
      logger.error('Error finding user by email:', errorMessage);
      throw error;
    }
  }

  async findByIdWithoutPassword(id: number): Promise<UserWithoutPassword | null> {
    try {
      const user = await this.model.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          preferredLanguage: true,
        },
      });
      return user;
    } catch (error: unknown) {
      const errorMessage = isRepositoryError(error) ? error.message : String(error);
      logger.error('Error finding user by id without password:', errorMessage);
      throw error;
    }
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<UserWithoutPassword> {
    try {
      const hashedPassword = await hashPassword(data.password);
      const user = await this.model.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          name: data.name,
          role: data.role ?? 'teacher',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          preferredLanguage: true,
        },
      });
      logger.info(`Created user with email: ${user.email}`);
      return user;
    } catch (error: unknown) {
      const errorMessage = isRepositoryError(error) ? error.message : String(error);
      logger.error('Error creating user:', errorMessage);
      throw error;
    }
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await hashPassword(newPassword);
      await this.model.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      logger.info(`Updated password for user id: ${String(userId)}`);
    } catch (error: unknown) {
      const errorMessage = isRepositoryError(error) ? error.message : String(error);
      logger.error('Error updating password:', errorMessage);
      throw error;
    }
  }

  async findActiveUsers(pagination?: {
    skip?: number;
    take?: number;
  }): Promise<UserWithoutPassword[]> {
    try {
      const users = await this.model.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          preferredLanguage: true,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { id: 'desc' },
      });
      return users;
    } catch (error: unknown) {
      const errorMessage = isRepositoryError(error) ? error.message : String(error);
      logger.error('Error finding active users:', errorMessage);
      throw error;
    }
  }

}
