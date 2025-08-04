const express = require('express');
const tasksRouter = require('./tasks');
const authRouter = require('./auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
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
 *                   example: "HMCTS Task Management API is running"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HMCTS Task Management API is running',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    api_version: process.env.API_VERSION || 'v1',
    documentation: `/api-docs`,
    endpoints: {
      auth: '/api/v1/auth',
      tasks: '/api/v1/tasks',
      health: '/health',
      docs: '/api-docs'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRouter);
router.use('/tasks', tasksRouter);

module.exports = router;
