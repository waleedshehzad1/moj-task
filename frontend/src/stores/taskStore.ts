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
  const pendingTasks = computed(() => tasks.value.filter(task => task.status === 'pending'))
  const inProgressTasks = computed(() => tasks.value.filter(task => task.status === 'in_progress'))
  const completedTasks = computed(() => tasks.value.filter(task => task.status === 'completed'))
  const overdueTasks = computed(() => 
    tasks.value.filter(task => 
      new Date(task.due_date) < new Date() && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    )
  )

  // Actions
  const fetchTasks = async (query: TaskQuery = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await taskService.getTasks(query)
      tasks.value = response.data
      pagination.value = response.pagination
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
      tasks.value.unshift(newTask)
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
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
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
      const updatedTask = await taskService.updateTaskStatus(id, status)
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }
      return updatedTask
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
      tasks.value = tasks.value.filter(task => task.id !== id)
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete task'
      throw err
    } finally {
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
  }
})
