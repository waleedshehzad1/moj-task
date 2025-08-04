const express = require('express');
const TaskController = require('../controllers/taskController');
const { authenticateJWT, requirePermission, requireRole } = require('../middleware/authMiddleware');
const { 
  validateBody, 
  validateQuery,
  validateParams
} = require('../validation');
const {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskIdSchema
} = require('../validation/taskValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of tasks
 *                     by_status:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         in_progress:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *                     overdue:
 *                       type: integer
 *                       description: Number of overdue tasks
 *                     completion_rate:
 *                       type: integer
 *                       description: Completion percentage
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', authenticateJWT, requirePermission('read'), TaskController.getTaskStats);

/**
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
 *           examples:
 *             basic_task:
 *               summary: Basic task example
 *               value:
 *                 title: "Review case documentation"
 *                 description: "Review all submitted documents for case XYZ-123"
 *                 status: "pending"
 *                 priority: "medium"
 *                 due_date: "2024-12-31T23:59:59.000Z"
 *             urgent_task:
 *               summary: Urgent task example
 *               value:
 *                 title: "Emergency case review"
 *                 description: "Urgent review required for case ABC-456"
 *                 status: "pending"
 *                 priority: "urgent"
 *                 due_date: "2024-08-15T17:00:00.000Z"
 *                 assigned_to: "123e4567-e89b-12d3-a456-426614174000"
 *                 tags: ["urgent", "court-date"]
 *                 estimated_hours: 4.5
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', 
  authenticateJWT,
  requirePermission('create'),
  validateBody(createTaskSchema),
  TaskController.createTask
);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Retrieve all tasks with filtering and pagination
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
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter tasks by status
 *         example: pending
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter tasks by priority
 *         example: high
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tasks by assigned user ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Search in task title and description
 *         example: "case review"
 *       - in: query
 *         name: due_before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks due before this date
 *         example: "2024-12-31T23:59:59.000Z"
 *       - in: query
 *         name: due_after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks due after this date
 *         example: "2024-08-01T00:00:00.000Z"
 *       - in: query
 *         name: tags
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Filter tasks by tags
 *         example: ["urgent", "court-date"]
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, due_date, priority, status, title]
 *           default: created_at
 *         description: Field to sort by
 *         example: due_date
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: asc
 *       - in: query
 *         name: include_archived
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include archived tasks in results
 *         example: false
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
router.get('/',
  authenticateJWT,
  requirePermission('read'),
  validateQuery(taskQuerySchema),
  TaskController.getAllTasks
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
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
 *         description: Unique task identifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id',
  authenticateJWT,
  requirePermission('read'),
  validateParams(taskIdSchema),
  TaskController.getTaskById
);

/**
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
 *         description: Unique task identifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               assigned_to:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               estimated_hours:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 999.99
 *                 nullable: true
 *               actual_hours:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 999.99
 *                 nullable: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 maxItems: 10
 *               metadata:
 *                 type: object
 *           examples:
 *             partial_update:
 *               summary: Partial update example
 *               value:
 *                 status: "in_progress"
 *                 priority: "high"
 *                 actual_hours: 2.5
 *             full_update:
 *               summary: Full update example
 *               value:
 *                 title: "Updated task title"
 *                 description: "Updated description"
 *                 status: "completed"
 *                 priority: "medium"
 *                 due_date: "2024-09-15T17:00:00.000Z"
 *                 actual_hours: 6.0
 *                 tags: ["completed", "reviewed"]
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id',
  authenticateJWT,
  requirePermission('update'),
  validateParams(taskIdSchema),
  validateBody(updateTaskSchema),
  TaskController.updateTask
);

/**
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
 *         description: Unique task identifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
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
 *                 description: New task status
 *               actual_hours:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 999.99
 *                 description: Actual hours spent on the task
 *           examples:
 *             mark_completed:
 *               summary: Mark task as completed
 *               value:
 *                 status: "completed"
 *                 actual_hours: 8.5
 *             mark_in_progress:
 *               summary: Mark task as in progress
 *               value:
 *                 status: "in_progress"
 *             cancel_task:
 *               summary: Cancel task
 *               value:
 *                 status: "cancelled"
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [pending, in_progress, completed, cancelled]
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     actual_hours:
 *                       type: number
 *                       format: float
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   example: "Task status updated successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/status',
  authenticateJWT,
  requirePermission('update'),
  validateParams(taskIdSchema),
  validateBody(updateTaskStatusSchema),
  TaskController.updateTaskStatus
);

/**
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
 *         description: Unique task identifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Cannot delete task (e.g., task is in progress or completed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ValidationError"
 *               message: "Only pending or cancelled tasks can be deleted"
 *               timestamp: "2024-08-01T10:30:00.000Z"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id',
  authenticateJWT,
  requirePermission('delete'),
  validateParams(taskIdSchema),
  TaskController.deleteTask
);

module.exports = router;
