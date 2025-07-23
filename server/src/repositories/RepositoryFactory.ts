import type { PrismaClient } from '@prisma/client';

import { CurriculumExpectationRepository } from './CurriculumExpectationRepository';
import { ETFOLessonPlanRepository } from './ETFOLessonPlanRepository';
import { UserRepository } from './UserRepository';

export class RepositoryFactory {
  private static instance: RepositoryFactory | undefined;
  private prisma: PrismaClient;

  private userRepository?: UserRepository;
  private curriculumExpectationRepository?: CurriculumExpectationRepository;
  private etfoLessonPlanRepository?: ETFOLessonPlanRepository;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  static getInstance(prisma: PrismaClient): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(prisma);
    }
    return RepositoryFactory.instance;
  }

  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(this.prisma);
    }
    return this.userRepository;
  }

  getCurriculumExpectationRepository(): CurriculumExpectationRepository {
    if (!this.curriculumExpectationRepository) {
      this.curriculumExpectationRepository = new CurriculumExpectationRepository(this.prisma);
    }
    return this.curriculumExpectationRepository;
  }

  getETFOLessonPlanRepository(): ETFOLessonPlanRepository {
    if (!this.etfoLessonPlanRepository) {
      this.etfoLessonPlanRepository = new ETFOLessonPlanRepository(this.prisma);
    }
    return this.etfoLessonPlanRepository;
  }

  // Helper method to get all repositories
  getAllRepositories(): {
    user: UserRepository;
    curriculumExpectation: CurriculumExpectationRepository;
    etfoLessonPlan: ETFOLessonPlanRepository;
  } {
    return {
      user: this.getUserRepository(),
      curriculumExpectation: this.getCurriculumExpectationRepository(),
      etfoLessonPlan: this.getETFOLessonPlanRepository(),
    };
  }

  // Reset method for testing
  static reset(): void {
    RepositoryFactory.instance = undefined;
  }
}
