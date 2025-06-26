import { BaseService } from './base/BaseService';

export interface BatchOperation<T = unknown> {
  id: string;
  type: 'unit' | 'lesson' | 'expectation' | 'resource';
  data: T;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  errors?: string[];
  retryCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Type definitions for operation data
interface UnitPlanData {
  title: string;
  longRangePlanId: string;
  startDate: string | Date;
  endDate: string | Date;
  expectationIds?: string[];
  [key: string]: unknown;
}

interface LessonPlanData {
  title: string;
  unitPlanId: string;
  date: string | Date;
  duration?: number;
  expectationIds?: string[];
  [key: string]: unknown;
}

interface ExpectationData {
  code: string;
  description: string;
  strand: string;
  subject: string;
  grade?: number;
  [key: string]: unknown;
}

interface ResourceData {
  title: string;
  type: string;
  unitPlanId?: string;
  lessonPlanId?: string;
  [key: string]: unknown;
}

export interface BatchProcessingOptions {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  onProgress?: (operation: BatchOperation, progress: number) => void;
  onComplete?: (operation: BatchOperation) => void;
  onError?: (operation: BatchOperation, error: Error) => void;
}

export interface BatchValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class BatchProcessingService extends BaseService {
  private readonly operations = new Map<string, BatchOperation>();
  private readonly queues = new Map<string, BatchOperation[]>();
  private readonly activeProcesses = new Set<string>();

  constructor() {
    super('BatchProcessingService');
  }

  /**
   * Add operations to the batch processing queue
   */
  async addOperations<T>(
    operations: Omit<BatchOperation<T>, 'id' | 'status' | 'createdAt' | 'updatedAt'>[],
    userId: string,
  ): Promise<string[]> {
    return this.withRetry(async () => {
      const operationIds: string[] = [];
      const now = new Date();

      for (const op of operations) {
        const operationId = `${op.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const batchOperation: BatchOperation<T> = {
          ...op,
          id: operationId,
          status: 'pending',
          progress: 0,
          retryCount: 0,
          createdAt: now,
          updatedAt: now,
        };

        this.operations.set(operationId, batchOperation);

        // Add to user-specific queue
        const userQueue = this.queues.get(userId) || [];
        userQueue.push(batchOperation);
        this.queues.set(userId, userQueue);

        operationIds.push(operationId);
      }

      this.logger.info(
        { operationCount: operations.length, userId },
        'Added operations to batch queue',
      );

      return operationIds;
    });
  }

  /**
   * Process batch operations for a specific user
   */
  async processBatch(
    userId: string,
    options: Partial<BatchProcessingOptions> = {},
  ): Promise<{
    successful: number;
    failed: number;
    operations: BatchOperation[];
  }> {
    const opts: BatchProcessingOptions = {
      batchSize: 10,
      maxRetries: 3,
      retryDelay: 1000,
      ...options,
    };

    const processId = `${userId}_${Date.now()}`;

    if (this.activeProcesses.has(userId)) {
      throw new Error('Batch processing already in progress for this user');
    }

    this.activeProcesses.add(userId);

    try {
      const queue = this.queues.get(userId) || [];
      const pendingOperations = queue.filter((op) => op.status === 'pending');

      if (pendingOperations.length === 0) {
        return { successful: 0, failed: 0, operations: [] };
      }

      this.logger.info(
        { userId, pendingCount: pendingOperations.length, processId },
        'Starting batch processing',
      );

      const results = await this.withParallel(
        pendingOperations.map((operation) => () => this.processOperation(operation, userId, opts)),
        {
          maxConcurrency: opts.batchSize,
          failFast: false,
        },
      );

      const successful = results.successCount;
      const failed = results.errors.filter((e) => e !== null).length;

      this.logger.info({ userId, successful, failed, processId }, 'Batch processing completed');

      return {
        successful,
        failed,
        operations: pendingOperations,
      };
    } finally {
      this.activeProcesses.delete(userId);
    }
  }

  /**
   * Validate batch operations before processing
   */
  async validateBatch(operations: BatchOperation[]): Promise<BatchValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const operation of operations) {
      try {
        // Type-specific validation
        switch (operation.type) {
          case 'unit':
            await this.validateUnitPlanOperation(operation);
            break;
          case 'lesson':
            await this.validateLessonPlanOperation(operation);
            break;
          case 'expectation':
            await this.validateExpectationOperation(operation);
            break;
          case 'resource':
            await this.validateResourceOperation(operation);
            break;
          default:
            errors.push(`Unknown operation type: ${operation.type}`);
        }
      } catch (error) {
        errors.push(`Validation failed for operation ${operation.id}: ${error.message}`);
      }
    }

    // Check for duplicates
    const duplicates = this.findDuplicateOperations(operations);
    if (duplicates.length > 0) {
      warnings.push(`Found ${duplicates.length} duplicate operations`);
    }

    // Check batch size limits
    if (operations.length > 100) {
      warnings.push('Large batch size may impact performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get batch processing status for a user
   */
  getBatchStatus(userId: string): {
    isProcessing: boolean;
    queueLength: number;
    operations: BatchOperation[];
  } {
    const queue = this.queues.get(userId) || [];

    return {
      isProcessing: this.activeProcesses.has(userId),
      queueLength: queue.length,
      operations: queue.map((op) => ({ ...op })), // Return copies
    };
  }

  /**
   * Clear completed operations from queue
   */
  clearCompletedOperations(userId: string): void {
    const queue = this.queues.get(userId) || [];
    const pending = queue.filter((op) => op.status === 'pending' || op.status === 'processing');
    this.queues.set(userId, pending);

    // Remove from operations map
    queue
      .filter((op) => op.status === 'completed' || op.status === 'error')
      .forEach((op) => this.operations.delete(op.id));
  }

  // Private methods

  private async processOperation(
    operation: BatchOperation,
    userId: string,
    options: BatchProcessingOptions,
  ): Promise<BatchOperation> {
    operation.status = 'processing';
    operation.updatedAt = new Date();

    try {
      let result;

      switch (operation.type) {
        case 'unit':
          result = await this.processUnitPlanOperation(operation, userId);
          break;
        case 'lesson':
          result = await this.processLessonPlanOperation(operation, userId);
          break;
        case 'expectation':
          result = await this.processExpectationOperation(operation, userId);
          break;
        case 'resource':
          result = await this.processResourceOperation(operation, userId);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      operation.status = 'completed';
      operation.progress = 100;
      operation.data = result;

      if (options.onComplete) {
        options.onComplete(operation);
      }

      return operation;
    } catch (error) {
      operation.retryCount = (operation.retryCount || 0) + 1;
      operation.errors = operation.errors || [];
      operation.errors.push(error.message);

      if (operation.retryCount < options.maxRetries) {
        // Retry the operation
        await this.batchSleep(options.retryDelay * operation.retryCount);
        return this.processOperation(operation, userId, options);
      } else {
        operation.status = 'error';

        if (options.onError) {
          options.onError(operation, error);
        }

        this.logger.error(
          { operationId: operation.id, error: error.message, retryCount: operation.retryCount },
          'Operation failed after max retries',
        );

        throw error;
      }
    } finally {
      operation.updatedAt = new Date();
      this.operations.set(operation.id, operation);
    }
  }

  private async processUnitPlanOperation(
    operation: BatchOperation,
    userId: string,
  ): Promise<Record<string, unknown>> {
    const data = operation.data as UnitPlanData;

    return await this.withTransaction(async (tx) => {
      const { expectationIds: _expectationIds, ...unitData } = data;
      const unitPlan = await tx.unitPlan.create({
        data: {
          title: unitData.title,
          longRangePlanId: unitData.longRangePlanId,
          userId: parseInt(userId),
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });

      if (data.expectationIds && data.expectationIds.length > 0) {
        await tx.unitPlanExpectation.createMany({
          data: data.expectationIds.map((expectationId: string) => ({
            unitPlanId: unitPlan.id,
            expectationId,
          })),
        });
      }

      return unitPlan;
    });
  }

  private async processLessonPlanOperation(
    operation: BatchOperation,
    userId: string,
  ): Promise<Record<string, unknown>> {
    const data = operation.data as LessonPlanData;

    return await this.withTransaction(async (tx) => {
      const { expectationIds: _expectationIds, ...lessonData } = data;
      const lessonPlan = await tx.eTFOLessonPlan.create({
        data: {
          title: lessonData.title,
          unitPlanId: lessonData.unitPlanId,
          userId: parseInt(userId),
          date: new Date(data.date),
          duration: lessonData.duration,
        },
      });

      if (data.expectationIds && data.expectationIds.length > 0) {
        await tx.eTFOLessonPlanExpectation.createMany({
          data: data.expectationIds.map((expectationId: string) => ({
            lessonPlanId: lessonPlan.id,
            expectationId,
          })),
        });
      }

      return lessonPlan;
    });
  }

  private async processExpectationOperation(
    operation: BatchOperation,
    _userId: string,
  ): Promise<Record<string, unknown>> {
    const data = operation.data as ExpectationData;

    return await this.withTransaction(async (tx) => {
      return await tx.curriculumExpectation.create({
        data: {
          code: data.code,
          description: data.description,
          strand: data.strand,
          subject: data.subject,
          grade: data.grade || 0,
        },
      });
    });
  }

  private async processResourceOperation(
    operation: BatchOperation,
    _userId: string,
  ): Promise<Record<string, unknown>> {
    const data = operation.data as ResourceData;

    return await this.withTransaction(async (tx) => {
      if (data.unitPlanId) {
        return await tx.unitPlanResource.create({
          data: {
            title: data.title as string,
            type: data.type as string,
            url: data.url as string,
            unitPlan: { connect: { id: data.unitPlanId as string } }
          },
        });
      } else if (data.lessonPlanId) {
        return await tx.eTFOLessonPlanResource.create({
          data: {
            title: data.title as string,
            type: data.type as string,
            url: data.url as string,
            lessonPlan: { connect: { id: data.lessonPlanId as string } }
          },
        });
      } else {
        throw new Error('Resource must be associated with either a unit plan or lesson plan');
      }
    });
  }

  private async validateUnitPlanOperation(operation: BatchOperation): Promise<void> {
    const data = operation.data as UnitPlanData;

    if (!data.title || !data.longRangePlanId || !data.startDate || !data.endDate) {
      throw new Error('Missing required fields for unit plan');
    }

    if (!data.expectationIds || data.expectationIds.length === 0) {
      throw new Error('At least one curriculum expectation must be selected');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  private async validateLessonPlanOperation(operation: BatchOperation): Promise<void> {
    const data = operation.data as LessonPlanData;

    if (!data.title || !data.unitPlanId || !data.date) {
      throw new Error('Missing required fields for lesson plan');
    }

    if (data.duration && (data.duration < 5 || data.duration > 480)) {
      throw new Error('Lesson duration must be between 5 and 480 minutes');
    }
  }

  private async validateExpectationOperation(operation: BatchOperation): Promise<void> {
    const data = operation.data as ExpectationData;

    if (!data.code || !data.description || !data.strand || !data.subject) {
      throw new Error('Missing required fields for curriculum expectation');
    }
  }

  private async validateResourceOperation(operation: BatchOperation): Promise<void> {
    const data = operation.data as ResourceData;

    if (!data.title || !data.type) {
      throw new Error('Missing required fields for resource');
    }

    if (!data.unitPlanId && !data.lessonPlanId) {
      throw new Error('Resource must be associated with either a unit plan or lesson plan');
    }
  }

  private findDuplicateOperations(operations: BatchOperation[]): BatchOperation[] {
    const seen = new Set<string>();
    const duplicates: BatchOperation[] = [];

    for (const operation of operations) {
      const key = this.getOperationKey(operation);
      if (seen.has(key)) {
        duplicates.push(operation);
      } else {
        seen.add(key);
      }
    }

    return duplicates;
  }

  private getOperationKey(operation: BatchOperation): string {
    switch (operation.type) {
      case 'unit': {
        const data = operation.data as UnitPlanData;
        return `unit_${data.title}_${data.longRangePlanId}`;
      }
      case 'lesson': {
        const data = operation.data as LessonPlanData;
        return `lesson_${data.title}_${data.unitPlanId}_${data.date}`;
      }
      case 'expectation': {
        const data = operation.data as ExpectationData;
        return `expectation_${data.code}_${data.subject}_${data.grade}`;
      }
      case 'resource': {
        const data = operation.data as ResourceData;
        return `resource_${data.title}_${data.unitPlanId || data.lessonPlanId}`;
      }
      default:
        return operation.id;
    }
  }

  private batchSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const batchProcessingService = new BatchProcessingService();
