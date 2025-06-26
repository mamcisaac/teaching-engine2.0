import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { discoverySchedulerService } from '../services/discoverySchedulerService';

const router = Router();

// Validation schemas
const TaskSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['discovery', 'verification', 'cleanup']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  isActive: z.boolean().optional().default(true),
  config: z.record(z.unknown()).optional().default({}),
});

const TaskStatusSchema = z.object({
  isActive: z.boolean(),
});

/**
 * Get all scheduled tasks
 * GET /api/discovery-scheduler/tasks
 */
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = discoverySchedulerService.getTasks();
    const runningTasks = discoverySchedulerService.getRunningTasks();
    const stats = discoverySchedulerService.getSchedulerStats();

    res.json({
      success: true,
      data: {
        tasks,
        runningTasks,
        stats,
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve scheduled tasks',
    });
  }
});

/**
 * Get a specific task
 * GET /api/discovery-scheduler/tasks/:taskId
 */
router.get('/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = discoverySchedulerService.getTask(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve task',
    });
  }
});

/**
 * Create a new scheduled task
 * POST /api/discovery-scheduler/tasks
 */
router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const taskData = TaskSchema.parse(req.body);
    
    const taskId = discoverySchedulerService.addTask({
      name: taskData.name,
      type: taskData.type,
      frequency: taskData.frequency,
      isActive: taskData.isActive,
      config: taskData.config,
      nextRun: new Date(Date.now() + 60000), // Start in 1 minute
    });

    const task = discoverySchedulerService.getTask(taskId);

    res.status(201).json({
      success: true,
      data: {
        task,
        message: 'Task created successfully',
      },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to create task',
    });
  }
});

/**
 * Update task status (enable/disable)
 * PATCH /api/discovery-scheduler/tasks/:taskId/status
 */
router.patch('/tasks/:taskId/status', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { isActive } = TaskStatusSchema.parse(req.body);

    const updated = discoverySchedulerService.setTaskStatus(taskId, isActive);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const task = discoverySchedulerService.getTask(taskId);

    res.json({
      success: true,
      data: {
        task,
        message: `Task ${isActive ? 'enabled' : 'disabled'} successfully`,
      },
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Failed to update task status',
    });
  }
});

/**
 * Manually trigger a task
 * POST /api/discovery-scheduler/tasks/:taskId/trigger
 */
router.post('/tasks/:taskId/trigger', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Start task execution in background
    discoverySchedulerService
      .triggerTask(taskId)
      .then(() => {
        console.log(`Task ${taskId} completed successfully`);
      })
      .catch((error) => {
        console.error(`Task ${taskId} failed:`, error);
      });

    res.json({
      success: true,
      data: {
        taskId,
        message: 'Task triggered successfully',
        status: 'started',
      },
    });
  } catch (error) {
    console.error('Trigger task error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to trigger task',
    });
  }
});

/**
 * Delete a scheduled task
 * DELETE /api/discovery-scheduler/tasks/:taskId
 */
router.delete('/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    const removed = discoverySchedulerService.removeTask(taskId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: {
        taskId,
        message: 'Task deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
    });
  }
});

/**
 * Get scheduler statistics
 * GET /api/discovery-scheduler/stats
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = discoverySchedulerService.getSchedulerStats();
    const runningTasks = discoverySchedulerService.getRunningTasks();

    res.json({
      success: true,
      data: {
        ...stats,
        runningTasksDetail: runningTasks,
      },
    });
  } catch (error) {
    console.error('Get scheduler stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve scheduler statistics',
    });
  }
});

/**
 * Initialize the scheduler (admin only)
 * POST /api/discovery-scheduler/initialize
 */
router.post('/initialize', authMiddleware, async (req, res) => {
  try {
    await discoverySchedulerService.initialize();

    res.json({
      success: true,
      data: {
        message: 'Scheduler initialized successfully',
        stats: discoverySchedulerService.getSchedulerStats(),
      },
    });
  } catch (error) {
    console.error('Initialize scheduler error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize scheduler',
    });
  }
});

/**
 * Shutdown the scheduler (admin only)
 * POST /api/discovery-scheduler/shutdown
 */
router.post('/shutdown', authMiddleware, async (req, res) => {
  try {
    await discoverySchedulerService.shutdown();

    res.json({
      success: true,
      data: {
        message: 'Scheduler shutdown successfully',
      },
    });
  } catch (error) {
    console.error('Shutdown scheduler error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to shutdown scheduler',
    });
  }
});

/**
 * Get running tasks with details
 * GET /api/discovery-scheduler/running
 */
router.get('/running', authMiddleware, async (req, res) => {
  try {
    const runningTasks = discoverySchedulerService.getRunningTasks();

    res.json({
      success: true,
      data: {
        runningTasks,
        count: runningTasks.length,
      },
    });
  } catch (error) {
    console.error('Get running tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve running tasks',
    });
  }
});

export default router;