import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';
import { hashPassword } from '../utils/auth';
import { logger } from '../utils/logger';

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: Prisma.PrismaClient) {
    super(prisma, 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.model.findUnique({
        where: { email: email.toLowerCase() },
      });
      return user;
    } catch (error) {
      logger.error('Error finding user by email:', error);
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
          isActive: true,
          grade: true,
          division: true,
          province: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          onboardingCompleted: true,
          settings: true,
        },
      });
      return user;
    } catch (error) {
      logger.error('Error finding user by id without password:', error);
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
          role: data.role || 'teacher',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          grade: true,
          division: true,
          province: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          onboardingCompleted: true,
          settings: true,
        },
      });
      logger.info(`Created user with email: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
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
      logger.info(`Updated password for user id: ${userId}`);
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  async updateLastLogin(userId: number): Promise<void> {
    try {
      await this.model.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }

  async updateOnboardingStatus(userId: number, completed: boolean): Promise<void> {
    try {
      await this.model.update({
        where: { id: userId },
        data: { onboardingCompleted: completed },
      });
      logger.info(`Updated onboarding status for user id: ${userId}`);
    } catch (error) {
      logger.error('Error updating onboarding status:', error);
      throw error;
    }
  }

  async updateSettings(userId: number, settings: Record<string, unknown>): Promise<void> {
    try {
      await this.model.update({
        where: { id: userId },
        data: {
          settings: settings as Prisma.JsonValue,
        },
      });
      logger.info(`Updated settings for user id: ${userId}`);
    } catch (error) {
      logger.error('Error updating settings:', error);
      throw error;
    }
  }

  async findActiveUsers(pagination?: {
    skip?: number;
    take?: number;
  }): Promise<UserWithoutPassword[]> {
    try {
      const users = await this.model.findMany({
        where: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          grade: true,
          division: true,
          province: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          onboardingCompleted: true,
          settings: true,
        },
        skip: pagination?.skip,
        take: pagination?.take,
        orderBy: { createdAt: 'desc' },
      });
      return users;
    } catch (error) {
      logger.error('Error finding active users:', error);
      throw error;
    }
  }

  async deactivateUser(userId: number): Promise<void> {
    try {
      await this.model.update({
        where: { id: userId },
        data: { isActive: false },
      });
      logger.info(`Deactivated user id: ${userId}`);
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }

  async activateUser(userId: number): Promise<void> {
    try {
      await this.model.update({
        where: { id: userId },
        data: { isActive: true },
      });
      logger.info(`Activated user id: ${userId}`);
    } catch (error) {
      logger.error('Error activating user:', error);
      throw error;
    }
  }
}
