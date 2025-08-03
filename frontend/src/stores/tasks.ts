import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, CreateTaskRequest, UpdateTaskRequest, PaginatedResponse } from '@/services/api'
import { apiService } from '@/services/api'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Search and filter state
  const searchQuery = ref('')
  const statusFilter = ref<string>('')
  const priorityFilter = ref<string>('')

  // Getters
  const filteredTasks = computed(() => {
    return tasks.value.filter(task => {
      const matchesSearch = !searchQuery.value || 
        task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      const matchesStatus = !statusFilter.value || task.status === statusFilter.value
      const matchesPriority = !priorityFilter.value || task.priority === priorityFilter.value
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  })

  const tasksByStatus = computed(() => {
    return {
      pending: tasks.value.filter(task => task.status === 'pending'),
      in_progress: tasks.value.filter(task => task.status === 'in_progress'),
      completed: tasks.value.filter(task => task.status === 'completed'),
    }
  })

  const taskStats = computed(() => ({
    total: tasks.value.length,
    pending: tasksByStatus.value.pending.length,
    inProgress: tasksByStatus.value.in_progress.length,
    completed: tasksByStatus.value.completed.length,
  }))

  // Actions
  async function fetchTasks(params?: {
    page?: number
    limit?: number
    status?: string
    priority?: string
    search?: string
  }) {
    isLoading.value = true
    error.value = null
    
    try {
      const response: PaginatedResponse<Task> = await apiService.getTasks(params)
      tasks.value = response.data
      pagination.value = response.pagination
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTask(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const task = await apiService.getTask(id)
      currentTask.value = task
      return task
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(taskData: CreateTaskRequest) {
    isLoading.value = true
    error.value = null
    
    try {
      const newTask = await apiService.createTask(taskData)
      tasks.value.unshift(newTask) // Add to beginning of list
      pagination.value.total += 1
      return newTask
    } catch (err: any) {
      error.value = err.message || 'Failed to create task'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateTask(id: string, taskData: UpdateTaskRequest) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedTask = await apiService.updateTask(id, taskData)
      
      // Update in tasks array
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      
      // Update current task if it's the same
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }
      
      return updatedTask
    } catch (err: any) {
      error.value = err.message || 'Failed to update task'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTask(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await apiService.deleteTask(id)
      
      // Remove from tasks array
      tasks.value = tasks.value.filter(task => task.id !== id)
      pagination.value.total -= 1
      
      // Clear current task if it's the deleted one
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete task'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setStatusFilter(status: string) {
    statusFilter.value = status
  }

  function setPriorityFilter(priority: string) {
    priorityFilter.value = priority
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = ''
    priorityFilter.value = ''
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentTask() {
    currentTask.value = null
  }

  return {
    // State
    tasks,
    currentTask,
    isLoading,
    error,
    pagination,
    searchQuery,
    statusFilter,
    priorityFilter,
    
    // Getters
    filteredTasks,
    tasksByStatus,
    taskStats,
    
    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    clearFilters,
    clearError,
    clearCurrentTask,
  }
})
