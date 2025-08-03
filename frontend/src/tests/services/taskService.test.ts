import { describe, it, expect, beforeEach, vi } from 'vitest'
import { taskService } from '@/services/taskService'
import apiClient from '@/services/api'

// Mock the API client
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockApiClient = apiClient as any

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending',
  priority: 'high',
  due_date: '2024-01-15T17:00:00Z',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
  is_archived: false
}

const mockTasksResponse = {
  data: {
    data: [mockTask],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  }
}

const mockTaskResponse = {
  data: {
    data: mockTask
  }
}

const mockStatsResponse = {
  data: {
    data: {
      total: 10,
      by_status: {
        pending: 3,
        in_progress: 2,
        completed: 4,
        cancelled: 1
      },
      overdue: 1,
      completion_rate: 0.4
    }
  }
}

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockTasksResponse)

      const result = await taskService.getTasks()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/tasks', { params: {} })
      expect(result).toEqual(mockTasksResponse.data.data)
    })

    it('should fetch tasks with query parameters', async () => {
      mockApiClient.get.mockResolvedValue(mockTasksResponse)

      const query = {
        page: 2,
        limit: 20,
        status: 'pending',
        priority: 'high',
        search: 'test'
      }

      await taskService.getTasks(query)

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/tasks', { params: query })
    })

    it('should handle fetch tasks error', async () => {
      const error = new Error('Network error')
      mockApiClient.get.mockRejectedValue(error)

      await expect(taskService.getTasks()).rejects.toThrow('Network error')
    })
  })

  describe('getTask', () => {
    it('should fetch a single task successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockTaskResponse)

      const result = await taskService.getTask('1')

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/tasks/1')
      expect(result).toEqual(mockTask)
    })

    it('should handle fetch task error', async () => {
      const error = new Error('Task not found')
      mockApiClient.get.mockRejectedValue(error)

      await expect(taskService.getTask('invalid-id')).rejects.toThrow('Task not found')
    })
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskInput = {
        title: 'New Task',
        description: 'New description',
        due_date: '2024-01-15T17:00:00Z',
        priority: 'medium'
      }

      mockApiClient.post.mockResolvedValue(mockTaskResponse)

      const result = await taskService.createTask(taskInput)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/tasks', taskInput)
      expect(result).toEqual(mockTask)
    })

    it('should handle create task error', async () => {
      const taskInput = {
        title: '',
        due_date: '2024-01-15T17:00:00Z'
      }

      const error = new Error('Title is required')
      mockApiClient.post.mockRejectedValue(error)

      await expect(taskService.createTask(taskInput)).rejects.toThrow('Title is required')
    })
  })

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const taskUpdate = {
        title: 'Updated Task',
        description: 'Updated description'
      }

      mockApiClient.put.mockResolvedValue(mockTaskResponse)

      const result = await taskService.updateTask('1', taskUpdate)

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/tasks/1', taskUpdate)
      expect(result).toEqual(mockTask)
    })

    it('should handle update task error', async () => {
      const error = new Error('Task not found')
      mockApiClient.put.mockRejectedValue(error)

      await expect(taskService.updateTask('invalid-id', {})).rejects.toThrow('Task not found')
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      mockApiClient.patch.mockResolvedValue(mockTaskResponse)

      const result = await taskService.updateTaskStatus('1', 'completed')

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/v1/tasks/1/status', { status: 'completed' })
      expect(result).toEqual(mockTask)
    })

    it('should handle update status error', async () => {
      const error = new Error('Invalid status')
      mockApiClient.patch.mockRejectedValue(error)

      await expect(taskService.updateTaskStatus('1', 'invalid-status')).rejects.toThrow('Invalid status')
    })
  })

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockApiClient.delete.mockResolvedValue({ data: {} })

      await taskService.deleteTask('1')

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/v1/tasks/1')
    })

    it('should handle delete task error', async () => {
      const error = new Error('Task not found')
      mockApiClient.delete.mockRejectedValue(error)

      await expect(taskService.deleteTask('invalid-id')).rejects.toThrow('Task not found')
    })
  })

  describe('getTaskStats', () => {
    it('should fetch task statistics successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockStatsResponse)

      const result = await taskService.getTaskStats()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/tasks/stats')
      expect(result).toEqual(mockStatsResponse.data.data)
    })

    it('should handle fetch stats error', async () => {
      const error = new Error('Stats not available')
      mockApiClient.get.mockRejectedValue(error)

      await expect(taskService.getTaskStats()).rejects.toThrow('Stats not available')
    })
  })
})
