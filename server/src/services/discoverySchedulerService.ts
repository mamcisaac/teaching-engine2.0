import BaseService from './base/BaseService';
import { curriculumDiscoveryService } from './curriculumDiscoveryService';
// import { activityDiscoveryService } from './activityDiscoveryService'; // Unused import

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'discovery' | 'verification' | 'cleanup';
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRun?: Date;
  nextRun: Date;
  isActive: boolean;
  config: Record<string, unknown>;
}

export interface TaskExecution {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  result?: {
    documentsFound?: number;
    documentsVerified?: number;
    documentsProcessed?: number;
    errors?: string[];
  };
  error?: string;
}

/**
 * Discovery Scheduler Service
 * Manages background tasks for curriculum document discovery and monitoring
 */
export class DiscoverySchedulerService extends BaseService {
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private runningTasks: Map<string, TaskExecution> = new Map();
  private taskTimers: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    super('DiscoverySchedulerService');
  }

  /**
   * Initialize the scheduler with default tasks
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.logger.info('Initializing Discovery Scheduler Service');
      
      // Create default scheduled tasks
      await this.createDefaultTasks();
      
      // Start the scheduler
      this.startScheduler();
      
      this.isInitialized = true;
      this.logger.info('Discovery Scheduler Service initialized successfully');
    } catch (error) {
      this.logger.error({ error }, 'Failed to initialize Discovery Scheduler Service');
      throw error;
    }
  }

  /**
   * Create default scheduled tasks
   */
  private async createDefaultTasks(): Promise<void> {
    const defaultTasks: Omit<ScheduledTask, 'id'>[] = [
      {
        name: 'Daily Curriculum Discovery',
        type: 'discovery',
        frequency: 'daily',
        nextRun: this.getNextRunTime('daily'),
        isActive: true,
        config: {
          sources: ['pei-gov', 'ontario-edu', 'bc-gov'],
          autoProcess: false, // Don't auto-process, require manual review
        },
      },
      {
        name: 'Weekly Document Verification',
        type: 'verification',
        frequency: 'weekly',
        nextRun: this.getNextRunTime('weekly'),
        isActive: true,
        config: {
          batchSize: 50, // Verify 50 documents at a time
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        },
      },
      {
        name: 'Monthly Cleanup',
        type: 'cleanup',
        frequency: 'monthly',
        nextRun: this.getNextRunTime('monthly'),
        isActive: true,
        config: {
          removeInactive: true,
          removeOlderThan: 90 * 24 * 60 * 60 * 1000, // 90 days
        },
      },
    ];

    for (const taskData of defaultTasks) {
      const task: ScheduledTask = {
        id: this.generateTaskId(taskData.name),
        ...taskData,
      };
      
      this.scheduledTasks.set(task.id, task);
      this.logger.info(`Created task: ${task.name} (${task.id})`);
    }
  }

  /**
   * Start the task scheduler
   */
  private startScheduler(): void {
    this.logger.info('Starting task scheduler');
    
    // Schedule all active tasks
    for (const task of this.scheduledTasks.values()) {
      if (task.isActive) {
        this.scheduleTask(task);
      }
    }

    // Set up periodic scheduler check (every hour)
    setInterval(() => {
      this.checkAndScheduleTasks();
    }, 60 * 60 * 1000);
  }

  /**
   * Schedule a specific task
   */
  private scheduleTask(task: ScheduledTask): void {
    const now = new Date();
    const delay = Math.max(0, task.nextRun.getTime() - now.getTime());
    
    // Clear existing timer if any
    const existingTimer = this.taskTimers.get(task.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule the task
    const timer = setTimeout(() => {
      this.executeTask(task);
    }, delay);

    this.taskTimers.set(task.id, timer);
    
    this.logger.info(
      { taskId: task.id, taskName: task.name, nextRun: task.nextRun, delay },
      'Task scheduled'
    );
  }

  /**
   * Execute a scheduled task
   */
  private async executeTask(task: ScheduledTask): Promise<void> {
    const execution: TaskExecution = {
      taskId: task.id,
      startTime: new Date(),
      status: 'running',
    };

    this.runningTasks.set(task.id, execution);

    try {
      this.logger.info({ taskId: task.id, taskName: task.name }, 'Starting task execution');

      let result: TaskExecution['result'];

      switch (task.type) {
        case 'discovery':
          result = await this.executeDiscoveryTask(task);
          break;
        case 'verification':
          result = await this.executeVerificationTask(task);
          break;
        case 'cleanup':
          result = await this.executeCleanupTask(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      execution.result = result;
      execution.status = 'completed';
      execution.endTime = new Date();

      this.logger.info(
        { taskId: task.id, taskName: task.name, result, duration: execution.endTime.getTime() - execution.startTime.getTime() },
        'Task completed successfully'
      );
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.endTime = new Date();

      this.logger.error(
        { taskId: task.id, taskName: task.name, error },
        'Task execution failed'
      );
    } finally {
      // Update task schedule
      task.lastRun = execution.startTime;
      task.nextRun = this.getNextRunTime(task.frequency, task.lastRun);

      // Schedule next execution
      this.scheduleTask(task);

      // Keep execution record but remove from running tasks
      this.runningTasks.delete(task.id);
    }
  }

  /**
   * Execute curriculum discovery task
   */
  private async executeDiscoveryTask(task: ScheduledTask): Promise<TaskExecution['result']> {
    const config = task.config;
    
    try {
      const documents = await curriculumDiscoveryService.discoverDocuments();
      
      let processedCount = 0;
      const errors: string[] = [];

      // Auto-process documents if configured
      if (config.autoProcess) {
        for (const document of documents) {
          try {
            // This would require a user ID - in practice, this might be a system user
            // For now, we'll just log the discovery
            this.logger.info(
              { documentId: document.id, title: document.title },
              'Document discovered (auto-processing disabled)'
            );
            processedCount++;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to process ${document.title}: ${errorMsg}`);
          }
        }
      }

      return {
        documentsFound: documents.length,
        documentsProcessed: processedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      throw new Error(`Discovery task failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute document verification task
   */
  private async executeVerificationTask(task: ScheduledTask): Promise<TaskExecution['result']> {
    const config = task.config;
    const batchSize = (config.batchSize as number) || 50;
    const maxAge = (config.maxAge as number) || 7 * 24 * 60 * 60 * 1000;

    try {
      const documents = curriculumDiscoveryService.getDiscoveredDocuments();
      const now = new Date();
      
      // Find documents that need verification
      const documentsToVerify = documents.filter(doc => {
        const timeSinceVerification = now.getTime() - doc.lastVerified.getTime();
        return timeSinceVerification > maxAge;
      }).slice(0, batchSize);

      let verifiedCount = 0;
      const errors: string[] = [];

      for (const document of documentsToVerify) {
        try {
          const isAvailable = await curriculumDiscoveryService.verifyDocument(document.id);
          
          if (isAvailable) {
            verifiedCount++;
          } else {
            this.logger.warn(
              { documentId: document.id, title: document.title },
              'Document is no longer available'
            );
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to verify ${document.title}: ${errorMsg}`);
        }

        // Add delay between verifications to be respectful
        await this.delay(1000);
      }

      return {
        documentsVerified: verifiedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      throw new Error(`Verification task failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute cleanup task
   */
  private async executeCleanupTask(task: ScheduledTask): Promise<TaskExecution['result']> {
    const config = task.config;
    const removeInactive = config.removeInactive as boolean;
    const removeOlderThan = (config.removeOlderThan as number) || 90 * 24 * 60 * 60 * 1000;

    try {
      const documents = curriculumDiscoveryService.getDiscoveredDocuments();
      const now = new Date();
      
      let removedCount = 0;
      const errors: string[] = [];

      for (const document of documents) {
        let shouldRemove = false;

        // Remove inactive documents if configured
        if (removeInactive && !document.isActive) {
          shouldRemove = true;
        }

        // Remove old documents
        const documentAge = now.getTime() - document.lastVerified.getTime();
        if (documentAge > removeOlderThan) {
          shouldRemove = true;
        }

        if (shouldRemove) {
          try {
            const removed = curriculumDiscoveryService.removeDiscoveredDocument(document.id);
            if (removed) {
              removedCount++;
              this.logger.info(
                { documentId: document.id, title: document.title },
                'Document removed during cleanup'
              );
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to remove ${document.title}: ${errorMsg}`);
          }
        }
      }

      return {
        documentsProcessed: removedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      throw new Error(`Cleanup task failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the next run time for a task frequency
   */
  private getNextRunTime(frequency: ScheduledTask['frequency'], lastRun?: Date): Date {
    const base = lastRun || new Date();
    const next = new Date(base);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(2, 0, 0, 0); // Run at 2 AM
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        next.setHours(3, 0, 0, 0); // Run at 3 AM
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1); // First day of the month
        next.setHours(4, 0, 0, 0); // Run at 4 AM
        break;
    }

    return next;
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }

  /**
   * Check and schedule tasks that might have been missed
   */
  private checkAndScheduleTasks(): void {
    const now = new Date();
    
    for (const task of this.scheduledTasks.values()) {
      if (task.isActive && task.nextRun <= now && !this.runningTasks.has(task.id)) {
        this.logger.info(
          { taskId: task.id, taskName: task.name },
          'Rescheduling missed task'
        );
        this.scheduleTask(task);
      }
    }
  }

  /**
   * Add a new scheduled task
   */
  addTask(taskData: Omit<ScheduledTask, 'id'>): string {
    const task: ScheduledTask = {
      id: this.generateTaskId(taskData.name),
      ...taskData,
    };

    this.scheduledTasks.set(task.id, task);
    
    if (task.isActive) {
      this.scheduleTask(task);
    }

    this.logger.info({ taskId: task.id, taskName: task.name }, 'Task added');
    return task.id;
  }

  /**
   * Remove a scheduled task
   */
  removeTask(taskId: string): boolean {
    const timer = this.taskTimers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.taskTimers.delete(taskId);
    }

    const removed = this.scheduledTasks.delete(taskId);
    
    if (removed) {
      this.logger.info({ taskId }, 'Task removed');
    }

    return removed;
  }

  /**
   * Get all scheduled tasks
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.scheduledTasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.scheduledTasks.get(taskId);
  }

  /**
   * Get running tasks
   */
  getRunningTasks(): TaskExecution[] {
    return Array.from(this.runningTasks.values());
  }

  /**
   * Enable or disable a task
   */
  setTaskStatus(taskId: string, isActive: boolean): boolean {
    const task = this.scheduledTasks.get(taskId);
    if (!task) return false;

    task.isActive = isActive;

    if (isActive) {
      this.scheduleTask(task);
    } else {
      const timer = this.taskTimers.get(taskId);
      if (timer) {
        clearTimeout(timer);
        this.taskTimers.delete(taskId);
      }
    }

    this.logger.info(
      { taskId, taskName: task.name, isActive },
      'Task status updated'
    );

    return true;
  }

  /**
   * Manually trigger a task
   */
  async triggerTask(taskId: string): Promise<void> {
    const task = this.scheduledTasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (this.runningTasks.has(taskId)) {
      throw new Error(`Task is already running: ${taskId}`);
    }

    this.logger.info({ taskId, taskName: task.name }, 'Manually triggering task');
    await this.executeTask(task);
  }

  /**
   * Get scheduler statistics
   */
  getSchedulerStats(): {
    totalTasks: number;
    activeTasks: number;
    runningTasks: number;
    uptime: number;
  } {
    return {
      totalTasks: this.scheduledTasks.size,
      activeTasks: Array.from(this.scheduledTasks.values()).filter(t => t.isActive).length,
      runningTasks: this.runningTasks.size,
      uptime: this.isInitialized ? Date.now() - Date.now() : 0, // Would track actual uptime in production
    };
  }

  /**
   * Shutdown the scheduler
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Discovery Scheduler Service');

    // Cancel all timers
    for (const timer of this.taskTimers.values()) {
      clearTimeout(timer);
    }
    this.taskTimers.clear();

    // Wait for running tasks to complete (with timeout)
    const runningTaskIds = Array.from(this.runningTasks.keys());
    if (runningTaskIds.length > 0) {
      this.logger.info(`Waiting for ${runningTaskIds.length} running tasks to complete`);
      
      // Wait up to 30 seconds for tasks to complete
      const timeout = setTimeout(() => {
        this.logger.warn('Shutdown timeout reached, some tasks may not have completed');
      }, 30000);

      // Poll for completion
      while (this.runningTasks.size > 0) {
        await this.delay(1000);
      }

      clearTimeout(timeout);
    }

    this.isInitialized = false;
    this.logger.info('Discovery Scheduler Service shutdown complete');
  }

  /**
   * Utility method to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const discoverySchedulerService = new DiscoverySchedulerService();