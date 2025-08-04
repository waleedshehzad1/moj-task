import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService, type Task, type TaskInput, type TaskQuery, type TaskStats } from '@/services/taskService'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const taskStats = ref<TaskStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  // Getters
  const pendingTasks = computed(() => Array.isArray(tasks.value) ? tasks.value.filter(task => task.status === 'pending') : [])
  const inProgressTasks = computed(() => Array.isArray(tasks.value) ? tasks.value.filter(task => task.status === 'in_progress') : [])
  const completedTasks = computed(() => Array.isArray(tasks.value) ? tasks.value.filter(task => task.status === 'completed') : [])
  const overdueTasks = computed(() => 
    Array.isArray(tasks.value) ? tasks.value.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    ) : []
  )

  // Actions
  const fetchTasks = async (query: TaskQuery = {}) => {
    loading.value = true
    error.value = null
    try {
      // Always clear cache before fetching to ensure we're not mixing cached and fresh data
      tasks.value = []
      pagination.value = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
      
      const response = await taskService.getTasks(query)
      tasks.value = Array.isArray(response.data) ? response.data : []
      pagination.value = response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTask = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      currentTask.value = await taskService.getTask(id)
      return currentTask.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: TaskInput) => {
    loading.value = true
    error.value = null
    try {
      const newTask = await taskService.createTask(taskData)
      
      // Clear the cached tasks to force fresh data retrieval
      // This ensures consistency between different API queries
      tasks.value = []
      
      // Add a small delay to allow backend consistency to propagate
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Refresh stats since creating a task affects statistics
      try {
        await fetchTaskStats()
      } catch (statsError) {
        console.warn('Failed to refresh task statistics after creation:', statsError)
      }
      
      return newTask
    } catch (err: any) {
      error.value = err.message || 'Failed to create task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, taskData: Partial<TaskInput>) => {
    loading.value = true
    error.value = null
    try {
      const updatedTask = await taskService.updateTask(id, taskData)
      
      // Clear the cached tasks to force fresh data retrieval
      // This ensures consistency between different API queries
      tasks.value = []
      
      // Add a small delay to allow backend consistency to propagate
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Update current task if it's the one being updated
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }
      
      // Refresh stats since updating a task might affect statistics
      try {
        await fetchTaskStats()
      } catch (statsError) {
        console.warn('Failed to refresh task statistics after update:', statsError)
      }
      
      return updatedTask
    } catch (err: any) {
      error.value = err.message || 'Failed to update task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      const response = await taskService.updateTaskStatus(id, status)
      
      // Clear the cached tasks to force fresh data retrieval
      // This ensures consistency between different API queries
      tasks.value = []
      
      // Add a small delay to allow backend consistency to propagate
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Update current task if it's the one being updated
      if (currentTask.value?.id === id) {
        currentTask.value = { ...currentTask.value, ...response }
      }
      
      // Refresh stats since status changes affect statistics
      try {
        await fetchTaskStats()
      } catch (statsError) {
        console.warn('Failed to refresh task statistics after status update:', statsError)
      }
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to update task status'
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await taskService.deleteTask(id)
    } catch (err: any) {
      // If task is not found (404), it's already deleted, so we treat it as success
      if (err.response?.status !== 404) {
        error.value = err.message || 'Failed to delete task'
        throw err
      }
      // Log 404 errors for debugging but don't throw
      console.warn(`Task ${id} was already deleted (404 response)`)
    } finally {
      // Clear the cached tasks to force fresh data retrieval
      // This ensures consistency between different API queries
      tasks.value = []
      
      // Add a small delay to allow backend consistency to propagate
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Clear current task if it's the one being deleted
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
      
      // Refresh stats since deleting a task affects statistics
      try {
        await fetchTaskStats()
      } catch (statsError) {
        console.warn('Failed to refresh task statistics after deletion:', statsError)
      }
      
      loading.value = false
    }
  }

  const fetchTaskStats = async () => {
    try {
      taskStats.value = await taskService.getTaskStats()
      return taskStats.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task statistics'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentTask = () => {
    currentTask.value = null
  }

  // Clear all cached data to force fresh retrieval
  const clearCache = () => {
    tasks.value = []
    currentTask.value = null
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  }

  // Force refresh all data from backend - useful for ensuring data consistency
  const refreshAllData = async (query: TaskQuery = {}) => {
    try {
      // Clear cache first to ensure fresh data
      clearCache()
      
      // Add a small delay to ensure any pending backend operations are complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      await Promise.all([
        fetchTasks(query),
        fetchTaskStats()
      ])
    } catch (err) {
      console.error('Failed to refresh data:', err)
      throw err
    }
  }

  // Force refresh with longer delay for backend consistency
  const forceRefreshAfterWrite = async (query: TaskQuery = {}) => {
    try {
      // Clear cache first
      clearCache()
      
      // Longer delay to ensure backend consistency after write operations
      await new Promise(resolve => setTimeout(resolve, 300))
      
      await Promise.all([
        fetchTasks(query),
        fetchTaskStats()
      ])
    } catch (err) {
      console.error('Failed to force refresh after write:', err)
      throw err
    }
  }

  return {
    // State
    tasks,
    currentTask,
    taskStats,
    loading,
    error,
    pagination,
    // Getters
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    fetchTaskStats,
    clearError,
    clearCurrentTask,
    clearCache,
    refreshAllData,
    forceRefreshAfterWrite,
  }
})
