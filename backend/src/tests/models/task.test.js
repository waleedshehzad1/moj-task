const { Task, User } = require('../../models');

describe('Task Model', () => {
  let testUser;

  beforeAll(async () => {
    // Create test user (database setup is handled by global setup)
    testUser = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password_hash: 'hashedpassword',
      first_name: 'Test',
      last_name: 'User',
      role: 'caseworker',
      is_active: true,
      email_verified: true
    });
  });

  // Remove afterAll as it's handled by global teardown

  beforeEach(async () => {
    await Task.destroy({ where: {}, force: true });
  });

  describe('Task Creation', () => {
    it('should create a task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000),
        assigned_to: testUser.id
      };

      const task = await Task.create(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.assigned_to).toBe(taskData.assigned_to);
      expect(task.is_archived).toBe(false);
      expect(task.tags).toEqual([]);
      expect(task.metadata).toEqual({});
    });

    it('should set default values correctly', async () => {
      const taskData = {
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000)
      };

      const task = await Task.create(taskData);

      expect(task.priority).toBe('medium');
      expect(task.is_archived).toBe(false);
      expect(task.tags).toEqual([]);
      expect(task.metadata).toEqual({});
    });

    it('should fail to create task without required fields', async () => {
      const invalidData = {
        description: 'Missing required fields'
      };

      await expect(Task.create(invalidData)).rejects.toThrow();
    });

    it('should fail to create task with invalid status', async () => {
      const invalidData = {
        title: 'Test Task',
        status: 'invalid_status',
        due_date: new Date(Date.now() + 86400000)
      };

      await expect(Task.create(invalidData)).rejects.toThrow();
    });

    it('should fail to create task with invalid priority', async () => {
      const invalidData = {
        title: 'Test Task',
        status: 'pending',
        priority: 'invalid_priority',
        due_date: new Date(Date.now() + 86400000)
      };

      await expect(Task.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Task Validation', () => {
    it('should validate title length', async () => {
      const invalidData = {
        title: 'a'.repeat(256), // Too long
        status: 'pending',
        due_date: new Date(Date.now() + 86400000)
      };

      await expect(Task.create(invalidData)).rejects.toThrow();
    });

    it('should validate description length', async () => {
      const invalidData = {
        title: 'Test Task',
        description: 'a'.repeat(2001), // Too long
        status: 'pending',
        due_date: new Date(Date.now() + 86400000)
      };

      await expect(Task.create(invalidData)).rejects.toThrow();
    });

    it('should validate estimated hours range', async () => {
      const invalidData = {
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000),
        estimated_hours: -1 // Invalid negative value
      };

      await expect(Task.create(invalidData)).rejects.toThrow();
    });

    it('should validate actual hours range', async () => {
      const invalidData = {
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000),
        actual_hours: 1000 // Too large
      };

      await expect(Task.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Task Hooks', () => {
    it('should set completed_at when status changes to completed', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000)
      });

      expect(task.completed_at).toBeNull();

      await task.update({ status: 'completed' });
      expect(task.completed_at).toBeTruthy();
      expect(task.completed_at).toBeInstanceOf(Date);
    });

    it('should clear completed_at when status changes from completed', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'completed',
        due_date: new Date(Date.now() + 86400000)
      });

      expect(task.completed_at).toBeTruthy();

      await task.update({ status: 'pending' });
      expect(task.completed_at).toBeNull();
    });

    it('should set archived_at when is_archived changes to true', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000)
      });

      expect(task.archived_at).toBeNull();

      await task.update({ is_archived: true });
      expect(task.archived_at).toBeTruthy();
      expect(task.archived_at).toBeInstanceOf(Date);
    });

    it('should clear archived_at when is_archived changes to false', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000),
        is_archived: true
      });

      expect(task.archived_at).toBeTruthy();

      await task.update({ is_archived: false });
      expect(task.archived_at).toBeNull();
    });
  });

  describe('Instance Methods', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000)
      });
    });

    describe('isOverdue()', () => {
      it('should return false for future due date', () => {
        expect(task.isOverdue()).toBe(false);
      });

      it('should return true for past due date and non-completed status', async () => {
        await task.update({ due_date: new Date(Date.now() - 86400000) });
        expect(task.isOverdue()).toBe(true);
      });

      it('should return false for completed task even if past due', async () => {
        await task.update({ 
          due_date: new Date(Date.now() - 86400000),
          status: 'completed'
        });
        expect(task.isOverdue()).toBe(false);
      });
    });

    describe('getDaysUntilDue()', () => {
      it('should return positive number for future due date', () => {
        const days = task.getDaysUntilDue();
        expect(days).toBeGreaterThan(0);
        expect(days).toBeLessThanOrEqual(2); // Should be 1 day (tomorrow)
      });

      it('should return negative number for past due date', async () => {
        await task.update({ due_date: new Date(Date.now() - 86400000) });
        const days = task.getDaysUntilDue();
        expect(days).toBeLessThan(0);
      });
    });

    describe('canBeDeleted()', () => {
      it('should return true for pending task', () => {
        expect(task.canBeDeleted()).toBe(true);
      });

      it('should return true for cancelled task', async () => {
        await task.update({ status: 'cancelled' });
        expect(task.canBeDeleted()).toBe(true);
      });

      it('should return false for in_progress task', async () => {
        await task.update({ status: 'in_progress' });
        expect(task.canBeDeleted()).toBe(false);
      });

      it('should return false for completed task', async () => {
        await task.update({ status: 'completed' });
        expect(task.canBeDeleted()).toBe(false);
      });
    });

    describe('canBeModified()', () => {
      it('should return true for pending task', () => {
        expect(task.canBeModified()).toBe(true);
      });

      it('should return true for in_progress task', async () => {
        await task.update({ status: 'in_progress' });
        expect(task.canBeModified()).toBe(true);
      });

      it('should return false for completed task', async () => {
        await task.update({ status: 'completed' });
        expect(task.canBeModified()).toBe(false);
      });

      it('should return false for archived task', async () => {
        await task.update({ is_archived: true });
        expect(task.canBeModified()).toBe(false);
      });
    });
  });

  describe('Class Methods', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.bulkCreate([
        {
          title: 'Pending Task 1',
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000),
          assigned_to: testUser.id
        },
        {
          title: 'Pending Task 2',
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 172800000)
        },
        {
          title: 'In Progress Task',
          status: 'in_progress',
          priority: 'low',
          due_date: new Date(Date.now() + 86400000)
        },
        {
          title: 'Completed Task',
          status: 'completed',
          priority: 'medium',
          due_date: new Date(Date.now() - 86400000)
        },
        {
          title: 'Overdue Task',
          status: 'pending',
          priority: 'urgent',
          due_date: new Date(Date.now() - 172800000)
        },
        {
          title: 'Archived Task',
          status: 'pending',
          priority: 'low',
          due_date: new Date(Date.now() + 86400000),
          is_archived: true
        }
      ]);
    });

    describe('findByStatus()', () => {
      beforeEach(async () => {
        // Clean up all tasks first
        await Task.destroy({ where: {}, force: true });
        
        // Create specific test data for these tests
        await Task.bulkCreate([
          {
            title: 'Pending Task 1',
            status: 'pending',
            priority: 'high',
            due_date: new Date(Date.now() + 86400000),
            assigned_to: testUser.id
          },
          {
            title: 'Pending Task 2',
            status: 'pending',
            priority: 'medium',
            due_date: new Date(Date.now() + 172800000)
          },
          {
            title: 'Archived Task',
            status: 'pending',
            priority: 'low',
            due_date: new Date(Date.now() + 86400000),
            is_archived: true
          }
        ]);
      });
      
      it('should find tasks by status', async () => {
        const pendingTasks = await Task.findByStatus('pending');
        expect(pendingTasks).toHaveLength(2); // Excluding archived
        pendingTasks.forEach(task => {
          expect(task.status).toBe('pending');
          expect(task.is_archived).toBe(false);
        });
      });

      it('should find tasks by status with options', async () => {
        const pendingTasks = await Task.findByStatus('pending', {
          where: { priority: 'high' }
        });
        expect(pendingTasks).toHaveLength(1);
        expect(pendingTasks[0].priority).toBe('high');
      });
    });

    describe('findOverdue()', () => {
      it('should find overdue tasks', async () => {
        const overdueTasks = await Task.findOverdue();
        expect(overdueTasks).toHaveLength(1);
        expect(overdueTasks[0].title).toBe('Overdue Task');
        expect(overdueTasks[0].status).not.toBe('completed');
      });
    });

    describe('findByAssignee()', () => {
      it('should find tasks by assignee', async () => {
        const assignedTasks = await Task.findByAssignee(testUser.id);
        expect(assignedTasks).toHaveLength(1);
        expect(assignedTasks[0].assigned_to).toBe(testUser.id);
      });
    });

    describe('getStatusCounts()', () => {
      beforeEach(async () => {
        // Clean up all tasks first
        await Task.destroy({ where: {}, force: true });
        
        // Create specific test data for status counts
        await Task.bulkCreate([
          {
            title: 'Pending Task 1',
            status: 'pending',
            priority: 'high',
            due_date: new Date(Date.now() + 86400000)
          },
          {
            title: 'Pending Task 2',
            status: 'pending',
            priority: 'medium',
            due_date: new Date(Date.now() + 172800000)
          },
          {
            title: 'In Progress Task',
            status: 'in_progress',
            priority: 'high',
            due_date: new Date(Date.now() + 86400000)
          },
          {
            title: 'Completed Task',
            status: 'completed',
            priority: 'medium',
            due_date: new Date(Date.now() + 86400000)
          },
          {
            title: 'Archived Task',
            status: 'pending',
            priority: 'low',
            due_date: new Date(Date.now() + 86400000),
            is_archived: true
          }
        ]);
      });
      
      it('should return status counts', async () => {
        const statusCounts = await Task.getStatusCounts();
        
        const pendingCount = statusCounts.find(s => s.status === 'pending');
        const inProgressCount = statusCounts.find(s => s.status === 'in_progress');
        const completedCount = statusCounts.find(s => s.status === 'completed');
        
        expect(parseInt(pendingCount.count)).toBe(2); // Excluding archived
        expect(parseInt(inProgressCount.count)).toBe(1);
        expect(parseInt(completedCount.count)).toBe(1);
      });
    });
  });

  describe('Associations', () => {
    it('should associate task with assignee user', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000),
        assigned_to: testUser.id
      });

      const taskWithAssignee = await Task.findByPk(task.id, {
        include: [{ model: User, as: 'assignee' }]
      });

      expect(taskWithAssignee.assignee).toBeTruthy();
      expect(taskWithAssignee.assignee.id).toBe(testUser.id);
      expect(taskWithAssignee.assignee.first_name).toBe(testUser.first_name);
    });

    it('should associate task with creator user', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000),
        created_by: testUser.id
      });

      const taskWithCreator = await Task.findByPk(task.id, {
        include: [{ model: User, as: 'creator' }]
      });

      expect(taskWithCreator.creator).toBeTruthy();
      expect(taskWithCreator.creator.id).toBe(testUser.id);
    });
  });

  describe('Soft Delete', () => {
    it('should soft delete task', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000)
      });

      await task.destroy();

      // Should not find with normal query
      const foundTask = await Task.findByPk(task.id);
      expect(foundTask).toBeNull();

      // Should find with paranoid: false
      const deletedTask = await Task.findByPk(task.id, { paranoid: false });
      expect(deletedTask).toBeTruthy();
      expect(deletedTask.deletedAt).toBeTruthy(); // Use camelCase deletedAt
    });
  });
});
