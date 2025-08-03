import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

// Types based on backend API
export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  assigned_to?: string
  created_by?: string
  completed_at?: string
  estimated_hours?: number
  actual_hours?: number
  tags: string[]
  metadata: Record<string, any>
  is_archived: boolean
  archived_at?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  assignee?: User
  creator?: User
}

export interface CreateTaskRequest {
  title: string
  description: string
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  assigned_to?: string
  estimated_hours?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  assigned_to?: string
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'caseworker' | 'viewer'
  department?: string
  phone?: string
  is_active: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  timestamp: string
}

class ApiService {
  private api: AxiosInstance
  private baseURL: string
  private apiKey: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    this.apiKey = import.meta.env.VITE_API_KEY || 'test-api-key-12345678901234567890123456789012'
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        // Ensure API key is always present
        config.headers['x-api-key'] = this.apiKey
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          // Only redirect if we're in a browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health')
    return response.data
  }

  // Task methods (updated to match backend API)
  async getTasks(params?: {
    page?: number
    limit?: number
    status?: string
    priority?: string
    assigned_to?: string
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Task>> {
    const response = await this.api.get<PaginatedResponse<Task>>('/api/v1/tasks', { params })
    return response.data
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.api.get<ApiResponse<Task>>(`/api/v1/tasks/${id}`)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to get task')
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await this.api.post<ApiResponse<Task>>('/api/v1/tasks', task)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to create task')
  }

  async updateTask(id: string, task: UpdateTaskRequest): Promise<Task> {
    const response = await this.api.put<ApiResponse<Task>>(`/api/v1/tasks/${id}`, task)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to update task')
  }

  async deleteTask(id: string): Promise<void> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/v1/tasks/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete task')
    }
  }

  // User methods (placeholder - would need backend auth implementation)
  async getUsers(): Promise<User[]> {
    // For now, return demo users - in real implementation this would call backend
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        username: 'admin',
        email: 'admin@hmcts.gov.uk',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        department: 'IT',
        is_active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        username: 'jsmith',
        email: 'caseworker1@hmcts.gov.uk',
        first_name: 'John',
        last_name: 'Smith',
        role: 'caseworker',
        department: 'Case Management',
        is_active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        username: 'sjones',
        email: 'caseworker2@hmcts.gov.uk',
        first_name: 'Sarah',
        last_name: 'Jones',
        role: 'caseworker',
        department: 'Case Management',
        is_active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }

  // Auth methods (simplified for demo - would need proper implementation)
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // For demo purposes, simulate login
    const demoUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'jsmith',
      email: credentials.email,
      first_name: 'John',
      last_name: 'Smith',
      role: 'caseworker',
      department: 'Case Management',
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const token = 'demo-jwt-token-' + Date.now()
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(demoUser))
    
    return { token, user: demoUser }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  clearAuth(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }
}

export const apiService = new ApiService()
export default apiService
