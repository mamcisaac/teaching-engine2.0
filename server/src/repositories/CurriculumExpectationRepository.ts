import { CurriculumExpectation, Prisma, PrismaClient } from '@prisma/client';

import logger from '../logger';

export interface SearchOptions {
  query?: string;
  subjects?: string[];
  grades?: string[];
  strands?: string[];
  categories?: string[];
  subcategories?: string[];
  skip?: number;
  take?: number;
}

export class CurriculumExpectationRepository {
  private prisma: PrismaClient;
  private model: PrismaClient['curriculumExpectation'];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.model = prisma.curriculumExpectation;
  }

  async search(options: SearchOptions) {
    try {
      const {
        query,
        subjects = [],
        grades = [],
        strands = [],
        categories = [],
        subcategories = [],
        skip = 0,
        take = 20,
      } = options;

      const where: Prisma.CurriculumExpectationWhereInput = {
        AND: [] as Prisma.CurriculumExpectationWhereInput[],
      };

      // Text search across multiple fields
      if (query) {
        (where.AND as Prisma.CurriculumExpectationWhereInput[]).push({
          OR: [
            { code: { contains: query } },
            { description: { contains: query } },
            { strand: { contains: query } },
            { substrand: { contains: query } },
          ],
        });
      }

      // Filter by subjects
      if (subjects.length > 0) {
        (where.AND as Prisma.CurriculumExpectationWhereInput[]).push({
          subject: { in: subjects },
        });
      }

      // Filter by grades  
      if (grades.length > 0) {
        (where.AND as Prisma.CurriculumExpectationWhereInput[]).push({
          grade: { in: grades.map(g => parseInt(g.toString())) },
        });
      }

      // Filter by strands
      if (strands.length > 0) {
        (where.AND as Prisma.CurriculumExpectationWhereInput[]).push({
          strand: { in: strands },
        });
      }

      // Filter by categories (using substrand as equivalent)
      if (categories.length > 0) {
        (where.AND as Prisma.CurriculumExpectationWhereInput[]).push({
          substrand: { in: categories },
        });
      }

      // Filter by subcategories (using substrand as equivalent)
      if (subcategories.length > 0) {
        (where.AND as Prisma.CurriculumExpectationWhereInput[]).push({
          substrand: { in: subcategories },
        });
      }

      // Remove empty AND array if no filters
      if ((where.AND as Prisma.CurriculumExpectationWhereInput[]).length === 0) {
        delete where.AND;
      }

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take,
          orderBy: [{ subject: 'asc' }, { grade: 'asc' }, { strand: 'asc' }, { substrand: 'asc' }],
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
      logger.error('Error searching curriculum expectations:', error);
      throw error;
    }
  }

  async findByCode(code: string): Promise<CurriculumExpectation | null> {
    try {
      const expectation = await this.model.findFirst({
        where: { code: code },
      });
      return expectation;
    } catch (error) {
      logger.error('Error finding curriculum expectation by code:', error);
      throw error;
    }
  }

  async findBySubjectAndGrade(subject: string, grade: string): Promise<CurriculumExpectation[]> {
    try {
      const expectations = await this.model.findMany({
        where: {
          subject,
          grade: parseInt(grade.toString()),
        },
        orderBy: [{ strand: 'asc' }, { substrand: 'asc' }, { code: 'asc' }],
      });
      return expectations;
    } catch (error) {
      logger.error('Error finding curriculum expectations by subject and grade:', error);
      throw error;
    }
  }

  async getUniqueValues() {
    try {
      const [subjects, grades, strands, categories] = await Promise.all([
        this.prisma.$queryRaw<{ subject: string }[]>`
          SELECT DISTINCT subject FROM "CurriculumExpectation" 
          WHERE subject IS NOT NULL 
          ORDER BY subject
        `,
        this.prisma.$queryRaw<{ grade: string }[]>`
          SELECT DISTINCT grade FROM "CurriculumExpectation" 
          WHERE grade IS NOT NULL 
          ORDER BY grade
        `,
        this.prisma.$queryRaw<{ strand: string }[]>`
          SELECT DISTINCT strand FROM "CurriculumExpectation" 
          WHERE strand IS NOT NULL 
          ORDER BY strand
        `,
        this.prisma.$queryRaw<{ category: string }[]>`
          SELECT DISTINCT category FROM "CurriculumExpectation" 
          WHERE category IS NOT NULL 
          ORDER BY category
        `,
      ]);

      return {
        subjects: subjects.map((s) => s.subject),
        grades: grades.map((g) => g.grade),
        strands: strands.map((s) => s.strand),
        categories: categories.map((c) => c.category),
      };
    } catch (error) {
      logger.error('Error getting unique values:', error);
      throw error;
    }
  }

  async bulkCreate(expectations: Prisma.CurriculumExpectationCreateInput[]): Promise<number> {
    try {
      const result = await this.model.createMany({
        data: expectations,
      });
      logger.info(`Bulk created ${result.count} curriculum expectations`);
      return result.count;
    } catch (error) {
      logger.error('Error bulk creating curriculum expectations:', error);
      throw error;
    }
  }

  async deleteBySubjectAndGrade(subject: string, grade: string): Promise<number> {
    try {
      const result = await this.model.deleteMany({
        where: {
          subject,
          grade: parseInt(grade.toString()),
        },
      });
      logger.info(`Deleted ${result.count} expectations for ${subject} grade ${grade}`);
      return result.count;
    } catch (error) {
      logger.error('Error deleting curriculum expectations:', error);
      throw error;
    }
  }
}
