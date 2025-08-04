import apiClient from './api.ts'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  assigned_to?: string
  created_by?: string
  completed_at?: string
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
  metadata?: Record<string, any>
  is_archived: boolean
  archived_at?: string
  created_at: string
  updated_at: string
}

export interface TaskInput {
  title: string
  description?: string
  status?: string
  priority?: string
  due_date: string
  assigned_to?: string
  estimated_hours?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface TaskQuery {
  page?: number
  limit?: number
  status?: string
  priority?: string
  assigned_to?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedTasks {
  data: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface TaskStats {
  total: number
  by_status: {
    pending: number
    in_progress: number
    completed: number
    cancelled: number
  }
  overdue: number
  completion_rate: number
}

export interface TaskStatusUpdate {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completed_at?: string
  actual_hours?: number
}

class TaskService {
  private basePath = '/api/v1/tasks'

  async getTasks(query: TaskQuery = {}): Promise<PaginatedTasks> {
    const response = await apiClient.get(this.basePath, { params: query })
    return response.data
  }

  async getTask(id: string): Promise<Task> {
    const response = await apiClient.get(`${this.basePath}/${id}`)
    return response.data.data
  }

  async createTask(task: TaskInput): Promise<Task> {
    const response = await apiClient.post(this.basePath, task)
    return response.data.data
  }

  async updateTask(id: string, task: Partial<TaskInput>): Promise<Task> {
    const response = await apiClient.put(`${this.basePath}/${id}`, task)
    return response.data.data
  }

  async updateTaskStatus(id: string, status: string): Promise<TaskStatusUpdate> {
    const response = await apiClient.patch(`${this.basePath}/${id}/status`, { status })
    return response.data.data
  }

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  async getTaskStats(): Promise<TaskStats> {
    const response = await apiClient.get(`${this.basePath}/stats`)
    return response.data.data
  }
}

export const taskService = new TaskService()
