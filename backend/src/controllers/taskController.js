const { Task, User } = require('../models');
const logger = require('../utils/logger');
const { redisClient } = require('../config/redis');
const { Op } = require('sequelize');

/**
 * Task Controller
 * Handles all task-related operations with comprehensive error handling,
 * caching, and security measures following OWASP guidelines
 */
class TaskController {
  /**
   * Create a new task
   * @swagger
   * /api/v1/tasks:
   *   post:
   *     summary: Create a new task
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskInput'
   *     responses:
   *       201:
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  static async createTask(req, res, next) {
    try {
      const startTime = process.hrtime.bigint();
      
      // Add creator information if user is authenticated
      if (req.user) {
        req.body.created_by = req.user.id;
      }

      // Validate assigned user exists if assigned_to is provided
      if (req.body.assigned_to) {
        const assignedUser = await User.findByPk(req.body.assigned_to);
        if (!assignedUser || !assignedUser.is_active) {
          return res.status(400).json({
            error: 'ValidationError',
            message: 'Assigned user not found or inactive',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Create task
      const task = await Task.create(req.body);

      // Load associations for response
      const createdTask = await Task.findByPk(task.id, {
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          }
        ]
      });

      // Log performance
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      logger.logPerformance('CREATE_TASK', duration, { taskId: task.id });

      // Invalidate relevant caches
      await TaskController.invalidateTaskCaches();

      // Log audit event
      logger.logAudit('TASK_CREATED', {
        taskId: task.id,
        title: task.title,
        assignedTo: task.assigned_to,
        createdBy: req.user?.id,
        priority: task.priority,
        status: task.status
      });

      res.status(201).json({
        success: true,
        data: createdTask,
        message: 'Task created successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error creating task:', error);
      next(error);
    }
  }

  /**
   * Get all tasks with filtering, pagination, and sorting
   * @swagger
   * /api/v1/tasks:
   *   get:
   *     summary: Retrieve all tasks
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, in_progress, completed, cancelled]
   *         description: Filter by task status
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, medium, high, urgent]
   *         description: Filter by priority
   *       - in: query
   *         name: assigned_to
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by assigned user ID
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *           maxLength: 255
   *         description: Search in title and description
   *       - in: query
   *         name: sort_by
   *         schema:
   *           type: string
   *           enum: [created_at, updated_at, due_date, priority, status, title]
   *           default: created_at
   *         description: Sort field
   *       - in: query
   *         name: sort_order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order
   *     responses:
   *       200:
   *         description: Tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedTasks'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  static async getAllTasks(req, res, next) {
    try {
      const startTime = process.hrtime.bigint();
      
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        assigned_to,
        search,
        sort_by = 'created_at',
        sort_order = 'desc',
        due_before,
        due_after,
        tags,
        include_archived = false
      } = req.query;

      // Build cache key
      const cacheKey = `tasks:list:${JSON.stringify(req.query)}`;
      
      // Try to get from cache first
      const cachedResult = await redisClient.cacheGet(cacheKey);
      if (cachedResult) {
        logger.debug('Returning cached task list');
        return res.json(cachedResult);
      }

      // Build where clause
      const where = {};
      
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (assigned_to) where.assigned_to = assigned_to;
      if (!include_archived) where.is_archived = false;

      // Date filters
      if (due_before || due_after) {
        where.due_date = {};
        if (due_before) where.due_date[Op.lte] = new Date(due_before);
        if (due_after) where.due_date[Op.gte] = new Date(due_after);
      }

      // Search functionality
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Tags filter
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        where.tags = { [Op.overlap]: tagArray };
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build order clause
      const order = [[sort_by, sort_order.toUpperCase()]];

      // Add secondary sort for consistent pagination
      if (sort_by !== 'created_at') {
        order.push(['created_at', 'DESC']);
      }

      // Execute query
      const { count, rows: tasks } = await Task.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        distinct: true
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const result = {
        success: true,
        data: tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages,
          hasNextPage,
          hasPreviousPage
        },
        timestamp: new Date().toISOString()
      };

      // Cache result for 5 minutes
      await redisClient.cacheSet(cacheKey, result, 300);

      // Log performance
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      logger.logPerformance('GET_ALL_TASKS', duration, { 
        count, 
        page, 
        limit,
        hasFilters: Object.keys(where).length > 1
      });

      res.json(result);

    } catch (error) {
      logger.error('Error retrieving tasks:', error);
      next(error);
    }
  }

  /**
   * Get a specific task by ID
   * @swagger
   * /api/v1/tasks/{id}:
   *   get:
   *     summary: Get a task by ID
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *     responses:
   *       200:
   *         description: Task retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Task'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  static async getTaskById(req, res, next) {
    try {
      const { id } = req.params;
      const startTime = process.hrtime.bigint();

      // Try cache first
      const cacheKey = `task:${id}`;
      const cachedTask = await redisClient.cacheGet(cacheKey);
      if (cachedTask) {
        logger.debug('Returning cached task');
        return res.json({
          success: true,
          data: cachedTask,
          timestamp: new Date().toISOString()
        });
      }

      const task = await Task.findByPk(id, {
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'department']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'department']
          }
        ]
      });

      if (!task) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Task not found',
          timestamp: new Date().toISOString()
        });
      }

      // Cache task for 10 minutes
      await redisClient.cacheSet(cacheKey, task, 600);

      // Log performance
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      logger.logPerformance('GET_TASK_BY_ID', duration, { taskId: id });

      res.json({
        success: true,
        data: task,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error retrieving task:', error);
      next(error);
    }
  }

  /**
   * Update a task
   * @swagger
   * /api/v1/tasks/{id}:
   *   put:
   *     summary: Update a task
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskInput'
   *     responses:
   *       200:
   *         description: Task updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Task'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const startTime = process.hrtime.bigint();

      // Find existing task
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Task not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if task can be modified
      if (!task.canBeModified()) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Cannot modify completed or archived tasks',
          timestamp: new Date().toISOString()
        });
      }

      // Validate assigned user if being updated
      if (req.body.assigned_to && req.body.assigned_to !== task.assigned_to) {
        const assignedUser = await User.findByPk(req.body.assigned_to);
        if (!assignedUser || !assignedUser.is_active) {
          return res.status(400).json({
            error: 'ValidationError',
            message: 'Assigned user not found or inactive',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Store original values for audit logging
      const originalValues = { ...task.dataValues };

      // Update task
      await task.update(req.body);

      // Load updated task with associations
      const updatedTask = await Task.findByPk(id, {
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          }
        ]
      });

      // Invalidate caches
      await TaskController.invalidateTaskCaches(id);

      // Log performance
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      logger.logPerformance('UPDATE_TASK', duration, { taskId: id });

      // Audit logging with change details
      const changes = {};
      Object.keys(req.body).forEach(key => {
        if (originalValues[key] !== req.body[key]) {
          changes[key] = {
            from: originalValues[key],
            to: req.body[key]
          };
        }
      });

      logger.logAudit('TASK_UPDATED', {
        taskId: id,
        changes,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error updating task:', error);
      next(error);
    }
  }

  /**
   * Update task status
   * @swagger
   * /api/v1/tasks/{id}/status:
   *   patch:
   *     summary: Update task status
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, in_progress, completed, cancelled]
   *               actual_hours:
   *                 type: number
   *                 format: float
   *                 minimum: 0
   *                 maximum: 999.99
   *     responses:
   *       200:
   *         description: Task status updated successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  static async updateTaskStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, actual_hours } = req.body;
      const startTime = process.hrtime.bigint();

      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Task not found',
          timestamp: new Date().toISOString()
        });
      }

      if (task.is_archived) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Cannot update status of archived tasks',
          timestamp: new Date().toISOString()
        });
      }

      const originalStatus = task.status;
      
      // Update task status
      const updateData = { status };
      if (actual_hours !== undefined) {
        updateData.actual_hours = actual_hours;
      }
      
      await task.update(updateData);

      // Invalidate caches
      await TaskController.invalidateTaskCaches(id);

      // Log performance
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      logger.logPerformance('UPDATE_TASK_STATUS', duration, { taskId: id });

      // Audit logging
      logger.logAudit('TASK_STATUS_CHANGED', {
        taskId: id,
        fromStatus: originalStatus,
        toStatus: status,
        actualHours: actual_hours,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        data: {
          id: task.id,
          status: task.status,
          completed_at: task.completed_at,
          actual_hours: task.actual_hours
        },
        message: 'Task status updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error updating task status:', error);
      next(error);
    }
  }

  /**
   * Delete a task
   * @swagger
   * /api/v1/tasks/{id}:
   *   delete:
   *     summary: Delete a task
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *     responses:
   *       200:
   *         description: Task deleted successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const startTime = process.hrtime.bigint();

      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Task not found',
          timestamp: new Date().toISOString()
        });
      }

      if (!task.canBeDeleted()) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Only pending or cancelled tasks can be deleted',
          timestamp: new Date().toISOString()
        });
      }

      // Store task data for audit logging before deletion
      const taskData = { ...task.dataValues };

      // Soft delete (paranoid: true in model)
      await task.destroy();

      // Invalidate caches
      await TaskController.invalidateTaskCaches(id);

      // Log performance
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      logger.logPerformance('DELETE_TASK', duration, { taskId: id });

      // Audit logging
      logger.logAudit('TASK_DELETED', {
        taskId: id,
        title: taskData.title,
        status: taskData.status,
        assignedTo: taskData.assigned_to,
        deletedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Task deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error deleting task:', error);
      next(error);
    }
  }

  /**
   * Get task statistics
   * @swagger
   * /api/v1/tasks/stats:
   *   get:
   *     summary: Get task statistics
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Task statistics retrieved successfully
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  static async getTaskStats(req, res, next) {
    try {
      const startTime = process.hrtime.bigint();

      // Try cache first
      const cacheKey = 'task:stats';
      const cachedStats = await redisClient.cacheGet(cacheKey);
      if (cachedStats) {
        return res.json(cachedStats);
      }

      // Get status counts
      const statusCounts = await Task.getStatusCounts();
      logger.debug('Status counts:', statusCounts);
      
      // Get overdue tasks count
      const overdueCount = await Task.count({
        where: {
          due_date: { [Op.lt]: new Date() },
          status: { [Op.ne]: 'completed' },
          is_archived: false
        }
      });

      // Get total tasks count
      const totalTasks = await Task.count({
        where: { is_archived: false }
      });

      // Build status counts object
      const byStatus = statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
      });

      const taskStatsData = {
        total: totalTasks,
        by_status: byStatus,
        overdue: overdueCount,
        completion_rate: totalTasks > 0 ? 
          Math.round((byStatus?.completed || 0) / totalTasks * 100) : 0
      };

      const result = {
        success: true,
        data: taskStatsData,
        timestamp: new Date().toISOString()
      };

      // Cache for 5 minutes
      await redisClient.cacheSet(cacheKey, result, 300);

      // Log performance
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      logger.logPerformance('GET_TASK_STATS', duration);

      res.json(result);

    } catch (error) {
      logger.error('Error getting task statistics:', error);
      next(error);
    }
  }

  /**
   * Invalidate task-related caches
   */
  static async invalidateTaskCaches(taskId = null) {
    try {
      // Invalidate task statistics cache
      await redisClient.del('task:stats');
      
      // Invalidate specific task cache if provided
      if (taskId) {
        const taskCacheKey = `task:${taskId}`;
        await redisClient.cacheDel(taskCacheKey);
        logger.debug(`Invalidated individual task cache: ${taskCacheKey}`);
      }

      // Invalidate all task list caches (with pattern matching)
      try {
        const client = redisClient.client;
        if (client && client.keys) {
          // Get all cache keys that match task list patterns
          const listCacheKeys = await client.keys('cache:tasks:list:*');
          if (listCacheKeys.length > 0) {
            await client.del(...listCacheKeys);
            logger.debug(`Invalidated ${listCacheKeys.length} task list cache entries`);
          }
        }
      } catch (patternError) {
        logger.warn('Could not invalidate task list caches with pattern matching:', patternError);
        // Fallback: just log the warning and continue
      }

      logger.debug('Task caches invalidated successfully', { taskId });
    } catch (error) {
      logger.error('Error invalidating task caches:', error);
    }
  }
}

module.exports = TaskController;
