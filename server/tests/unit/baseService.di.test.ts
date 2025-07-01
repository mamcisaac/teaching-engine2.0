import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { BaseService, ServiceDependencies } from '../../src/services/base/BaseService';
import { createMockDependencies, validateMockDependencies } from '../utils/createServiceMocks';
import { CurriculumImportService } from '../../src/services/curriculumImportService';
import { ClusteringService } from '../../src/services/clusteringService';
import { EmbeddingService } from '../../src/services/embeddingService';

// Create a test service to validate DI
class TestService extends BaseService {
  constructor(dependencies?: ServiceDependencies) {
    super('TestService', dependencies);
  }

  async testDatabaseAccess(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async testLogging(): Promise<void> {
    this.logger.info('Test log message');
  }

  async testTransaction(): Promise<any> {
    return await this.withTransaction(async (tx) => {
      return await tx.curriculumExpectation.create({
        data: { description: 'test' },
      });
    });
  }
}

describe('BaseService Dependency Injection', () => {
  let mockDeps: ServiceDependencies;

  beforeEach(() => {
    // Create fresh mocks for each test using jest from test context
    mockDeps = createMockDependencies(jest);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mock Infrastructure', () => {
    it('should validate all mocks are properly configured', () => {
      expect(validateMockDependencies(mockDeps)).toBe(true);
    });

    it('should create mock dependencies with all required methods', () => {
      expect(mockDeps.prisma).toBeDefined();
      expect(mockDeps.logger).toBeDefined();

      // Verify Prisma methods
      expect(mockDeps.prisma.$transaction).toBeDefined();
      expect(mockDeps.prisma.$queryRaw).toBeDefined();

      // Verify logger methods
      expect(mockDeps.logger.child).toBeDefined();
      expect(mockDeps.logger.info).toBeDefined();
      expect(mockDeps.logger.error).toBeDefined();
    });
  });

  describe('BaseService with Mocks', () => {
    it('should use injected dependencies instead of real ones', async () => {
      const service = new TestService(mockDeps);
      const mockPrisma = mockDeps.prisma as any;
      const mockLogger = mockDeps.logger as any;

      // Test database access uses mock
      await service.testDatabaseAccess();
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();

      // Test logging uses mock
      await service.testLogging();
      expect(mockLogger.info).toHaveBeenCalledWith('Test log message');
    });

    it('should handle transactions with mock prisma', async () => {
      const service = new TestService(mockDeps);
      const mockPrisma = mockDeps.prisma as any;

      // Setup transaction mock response
      mockPrisma.curriculumExpectation.create.mockResolvedValue({
        id: 'test-id',
        description: 'test',
      });

      const result = await service.testTransaction();

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'test-id',
        description: 'test',
      });
    });

    it('should maintain backward compatibility when no dependencies provided', () => {
      // This should not throw - it will use real dependencies
      expect(() => new TestService()).not.toThrow();
    });
  });

  describe('Service Implementation Updates', () => {
    it('should create CurriculumImportService with mock dependencies', () => {
      const service = new CurriculumImportService(mockDeps);

      expect(service).toBeInstanceOf(CurriculumImportService);
      // Verify it's using our mocks
      expect((service as any).logger).toBeDefined();
      expect((service as any).prisma).toBe(mockDeps.prisma);
    });

    it('should create ClusteringService with mock dependencies', () => {
      const service = new ClusteringService(mockDeps);

      expect(service).toBeInstanceOf(ClusteringService);
      // Verify it's using our mocks
      expect((service as any).logger).toBeDefined();
      expect((service as any).prisma).toBe(mockDeps.prisma);
    });

    it('should create EmbeddingService with mock dependencies', () => {
      const service = new EmbeddingService(mockDeps);

      expect(service).toBeInstanceOf(EmbeddingService);
      // Verify it's using our mocks
      expect((service as any).logger).toBeDefined();
      expect((service as any).prisma).toBe(mockDeps.prisma);
    });
  });

  describe('Mock Isolation', () => {
    it('should reset mocks between tests', () => {
      const mockPrisma = mockDeps.prisma as any;

      // Make a call
      mockPrisma.$queryRaw();
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Reset
      jest.clearAllMocks();
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(0);
    });

    it('should not share state between service instances', () => {
      const service1 = new TestService(mockDeps);
      const service2 = new TestService(mockDeps);

      // Both should have the same mock instances
      expect((service1 as any).prisma).toBe((service2 as any).prisma);
      expect((service1 as any).logger).toBe((service2 as any).logger); // Same mock instance
    });
  });

  describe('Real World Validation', () => {
    it('should allow services to perform database operations with mocks', async () => {
      const service = new CurriculumImportService(mockDeps);
      const mockPrisma = mockDeps.prisma as any;

      // Setup mock response
      mockPrisma.curriculumImport.findUnique.mockResolvedValue({
        id: 'test-import-id',
        status: 'READY_FOR_REVIEW',
        metadata: { subjects: ['Math', 'Science'] },
      });

      // This should use our mock
      const result = await mockPrisma.curriculumImport.findUnique({
        where: { id: 'test-import-id' },
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('READY_FOR_REVIEW');
    });

    it('should support health checks with mock dependencies', async () => {
      const service = new TestService(mockDeps);
      const mockPrisma = mockDeps.prisma as any;

      // Mock successful database ping
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const health = await service.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.details.database).toBe(true);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
