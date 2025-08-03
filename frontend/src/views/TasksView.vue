<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Task Management
              </h1>
              <p class="mt-1 text-sm text-gray-500">
                Manage and track tasks for HMCTS caseworkers
              </p>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <button
                @click="showCreateModal = true"
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClipboardDocumentListIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ taskStats.total }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ taskStats.pending }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <PlayIcon class="h-6 w-6 text-blue-400" aria-hidden="true" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ taskStats.inProgress }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ taskStats.completed }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <TaskFilters />
    </div>

    <!-- Tasks List Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <TaskList />
    </div>

    <!-- Task Creation Modal -->
    <TaskModal
      v-model:open="showCreateModal"
      mode="create"
      @task-saved="handleTaskSaved"
    />

    <!-- Task Edit Modal -->
    <TaskModal
      v-model:open="showEditModal"
      mode="edit"
      :task="selectedTask"
      @task-saved="handleTaskSaved"
    />

    <!-- Task Details Modal -->
    <TaskDetailsModal
      v-model:open="showDetailsModal"
      :task="selectedTask"
      @edit-task="handleEditTask"
      @delete-task="handleDeleteTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'
import type { Task } from '@/services/api'

// Components
import TaskFilters from '../components/tasks/TaskFilters.vue'
import TaskList from '../components/tasks/TaskList.vue'
import TaskModal from '../components/tasks/TaskModal.vue'
import TaskDetailsModal from '../components/tasks/TaskDetailsModal.vue'

const taskStore = useTaskStore()
const authStore = useAuthStore()

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const selectedTask = ref<Task | null>(null)

// Computed properties
const taskStats = computed(() => taskStore.taskStats)

// Event handlers
function handleTaskSaved() {
  showCreateModal.value = false
  showEditModal.value = false
  selectedTask.value = null
  // Refresh tasks list
  taskStore.fetchTasks()
}

function handleEditTask(task: Task) {
  selectedTask.value = task
  showDetailsModal.value = false
  showEditModal.value = true
}

async function handleDeleteTask(task: Task) {
  if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
    try {
      await taskStore.deleteTask(task.id)
      showDetailsModal.value = false
      selectedTask.value = null
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }
}

// Global event listeners for opening task details
function handleTaskClick(task: Task) {
  selectedTask.value = task
  showDetailsModal.value = true
}

// Initialize
onMounted(async () => {
  // Initialize auth if needed
  if (!authStore.isAuthenticated) {
    authStore.initializeAuth()
  }
  
  // Load initial tasks
  try {
    await taskStore.fetchTasks()
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
})

// Provide task click handler for child components
provide('onTaskClick', handleTaskClick)
</script>
