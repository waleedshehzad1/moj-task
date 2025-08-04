const request = require('supertest');
const app = require('../../app');
const { Task } = require('../../models');
const { setupAuthUser } = require('../utils/authTestUtils');

describe('Task Controller', () => {
  let testUser;
  let testTask;
  let authToken;
  let authHeader;
  
  // Helper function for authenticated requests
  const authRequest = (method, url) => {
    const req = request(app)[method](url);
    req.set('Authorization', authHeader);
    return req;
  };

  beforeAll(async () => {
    // Create test user and get auth token
    const auth = await setupAuthUser({
      email: 'test@example.com',
      username: 'testuser',
      role: 'admin' // Use admin role to have all permissions including delete
    });
    
    testUser = auth.user;
    authToken = auth.token;
    authHeader = auth.authHeader;
  });

  // Remove afterAll as it's handled by global teardown

  beforeEach(async () => {
    // Clean up tasks before each test
    await Task.destroy({ where: {}, force: true });
  });

  describe('POST /api/v1/tasks', () => {
    const validTaskData = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      priority: 'medium',
      due_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    };

    it('should create a new task with valid data', async () => {
      const response = await authRequest('post', '/api/v1/tasks')
        .send(validTaskData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(validTaskData.title);
      expect(response.body.data.status).toBe(validTaskData.status);
      expect(response.body.data.priority).toBe(validTaskData.priority);
    });

    it('should reject task creation with missing required fields', async () => {
      const invalidData = {
        description: 'Missing title and other required fields'
      };

      const response = await authRequest('post', '/api/v1/tasks')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it('should reject task with invalid status', async () => {
      const invalidData = {
        ...validTaskData,
        status: 'invalid_status'
      };

      const response = await authRequest('post', '/api/v1/tasks')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });

    it('should reject task with due date in the past', async () => {
      const invalidData = {
        ...validTaskData,
        due_date: new Date(Date.now() - 86400000).toISOString() // Yesterday
      };

      const response = await authRequest('post', '/api/v1/tasks')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });

    it('should reject task with title too long', async () => {
      const invalidData = {
        ...validTaskData,
        title: 'a'.repeat(256) // 256 characters, exceeds limit
      };

      const response = await authRequest('post', '/api/v1/tasks')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });

    it('should create task with valid assigned user', async () => {
      const taskWithAssignee = {
        ...validTaskData,
        assigned_to: testUser.id
      };

      const response = await authRequest('post', '/api/v1/tasks')
        .send(taskWithAssignee)
        .expect(201);

      expect(response.body.data.assigned_to).toBe(testUser.id);
      expect(response.body.data.assignee).toBeTruthy();
      expect(response.body.data.assignee.id).toBe(testUser.id);
    });

    it('should reject task with invalid assigned user', async () => {
      const taskWithInvalidAssignee = {
        ...validTaskData,
        assigned_to: '00000000-0000-0000-0000-000000000000' // Non-existent user
      };

      const response = await authRequest('post', '/api/v1/tasks')
        .send(taskWithInvalidAssignee)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('Assigned user not found');
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.bulkCreate([
        {
          title: 'Task 1',
          description: 'First test task',
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000),
          assigned_to: testUser.id
        },
        {
          title: 'Task 2',
          description: 'Second test task',
          status: 'in_progress',
          priority: 'medium',
          due_date: new Date(Date.now() + 172800000)
        },
        {
          title: 'Task 3',
          description: 'Third test task',
          status: 'completed',
          priority: 'low',
          due_date: new Date(Date.now() + 259200000)
        }
      ]);
    });

    it('should retrieve all tasks with default pagination', async () => {
      const response = await authRequest('get', '/api/v1/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const response = await authRequest('get', '/api/v1/tasks?status=pending')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('pending');
    });

    it('should filter tasks by priority', async () => {
      const response = await authRequest('get', '/api/v1/tasks?priority=high')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('high');
    });

    it('should filter tasks by assigned user', async () => {
      const response = await authRequest('get', `/api/v1/tasks?assigned_to=${testUser.id}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].assigned_to).toBe(testUser.id);
    });

    it('should search tasks by title', async () => {
      const response = await authRequest('get', '/api/v1/tasks?search=Task 1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Task 1');
    });

    it('should sort tasks by due_date', async () => {
      const response = await authRequest('get', '/api/v1/tasks?sort_by=due_date&sort_order=asc')
        .expect(200);

      const tasks = response.body.data;
      expect(tasks).toHaveLength(3);
      expect(new Date(tasks[0].due_date).getTime()).toBeLessThanOrEqual(new Date(tasks[1].due_date).getTime());
      expect(new Date(tasks[1].due_date).getTime()).toBeLessThanOrEqual(new Date(tasks[2].due_date).getTime());
    });

    it('should implement pagination correctly', async () => {
      const response = await authRequest('get', '/api/v1/tasks?page=2&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(1); // Only 1 task on page 2 with limit 2
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(false);
      expect(response.body.pagination.hasPreviousPage).toBe(true);
    });

    it('should reject invalid query parameters', async () => {
      const response = await authRequest('get', '/api/v1/tasks?status=invalid_status')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000),
        assigned_to: testUser.id
      });
    });

    it('should retrieve a task by valid ID', async () => {
      const response = await authRequest('get', `/api/v1/tasks/${testTask.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(testTask.id);
      expect(response.body.data.title).toBe(testTask.title);
      expect(response.body.data.assignee).toBeTruthy();
      expect(response.body.data.assignee.id).toBe(testUser.id);
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await authRequest('get', `/api/v1/tasks/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'NotFoundError');
      expect(response.body.message).toContain('Task not found');
    });

    it('should reject invalid UUID format', async () => {
      const response = await authRequest('get', '/api/v1/tasks/invalid-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000),
        assigned_to: testUser.id
      });
    });

    it('should update a task with valid data', async () => {
      const updateData = {
        title: 'Updated Task Title',
        status: 'in_progress',
        priority: 'high'
      };

      const response = await authRequest('put', `/api/v1/tasks/${testTask.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it('should reject update with no fields provided', async () => {
      const response = await authRequest('put', `/api/v1/tasks/${testTask.id}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await authRequest('put', `/api/v1/tasks/${nonExistentId}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'NotFoundError');
    });

    it('should reject update of completed task', async () => {
      await testTask.update({ status: 'completed' });

      const response = await authRequest('put', `/api/v1/tasks/${testTask.id}`)
        .send({ title: 'Cannot Update' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('Cannot modify completed');
    });
  });

  describe('PATCH /api/v1/tasks/:id/status', () => {
    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000)
      });
    });

    it('should update task status', async () => {
      const response = await authRequest('patch', `/api/v1/tasks/${testTask.id}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should update status to completed and set completed_at', async () => {
      const response = await authRequest('patch', `/api/v1/tasks/${testTask.id}/status`)
        .send({ 
          status: 'completed',
          actual_hours: 8.5
        })
        .expect(200);

      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.completed_at).toBeTruthy();
      expect(response.body.data.actual_hours).toBe(8.5);
    });

    it('should reject invalid status', async () => {
      const response = await authRequest('patch', `/api/v1/tasks/${testTask.id}/status`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });

    it('should reject status update for archived task', async () => {
      await testTask.update({ is_archived: true });

      const response = await authRequest('patch', `/api/v1/tasks/${testTask.id}/status`)
        .send({ status: 'completed' })
        .expect(400);

      expect(response.body.message).toContain('Cannot update status of archived tasks');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000)
      });
    });

    it('should delete a pending task', async () => {
      const response = await authRequest('delete', `/api/v1/tasks/${testTask.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify task is soft deleted
      const deletedTask = await Task.findByPk(testTask.id, { paranoid: false });
      expect(deletedTask.deletedAt).toBeTruthy(); // Use camelCase deletedAt
    });

    it('should delete a cancelled task', async () => {
      await testTask.update({ status: 'cancelled' });

      const response = await authRequest('delete', `/api/v1/tasks/${testTask.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject deletion of in_progress task', async () => {
      await testTask.update({ status: 'in_progress' });

      const response = await authRequest('delete', `/api/v1/tasks/${testTask.id}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('Only pending or cancelled tasks can be deleted');
    });

    it('should reject deletion of completed task', async () => {
      await testTask.update({ status: 'completed' });

      const response = await authRequest('delete', `/api/v1/tasks/${testTask.id}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await authRequest('delete', `/api/v1/tasks/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'NotFoundError');
    });
  });

  describe('GET /api/v1/tasks/stats', () => {
    beforeEach(async () => {
      // Create tasks with different statuses
      await Task.bulkCreate([
        {
          title: 'Pending Task 1',
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000)
        },
        {
          title: 'Pending Task 2',
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 172800000)
        },
        {
          title: 'In Progress Task',
          status: 'in_progress',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000)
        },
        {
          title: 'Completed Task',
          status: 'completed',
          priority: 'low',
          due_date: new Date(Date.now() - 86400000)
        },
        {
          title: 'Overdue Task',
          status: 'pending',
          priority: 'urgent',
          due_date: new Date(Date.now() - 172800000) // 2 days ago
        }
      ]);
    });

    it('should return task statistics', async () => {
      const response = await authRequest('get', '/api/v1/tasks/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      const stats = response.body.data;
      expect(stats).toHaveProperty('total', 5);
      expect(stats).toHaveProperty('by_status');
      expect(stats.by_status).toHaveProperty('pending', 3);
      expect(stats.by_status).toHaveProperty('in_progress', 1);
      expect(stats.by_status).toHaveProperty('completed', 1);
      expect(stats).toHaveProperty('overdue', 1);
      expect(stats).toHaveProperty('completion_rate');
    });
  });
});
