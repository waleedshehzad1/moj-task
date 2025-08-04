<template>
  <div v-if="loading" class="space-y-6">
    <!-- Loading skeleton -->
    <div class="animate-pulse">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="task" class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ task.title }}</h1>
          <div class="flex items-center space-x-4 mb-4">
            <TaskStatusBadge :status="task.status" />
            <TaskPriorityBadge :priority="task.priority" />
            <span 
              v-if="task.due_date"
              class="text-sm text-gray-500"
              :class="{ 'text-red-600 font-medium': isOverdue }"
            >
              Due: {{ formatDate(task.due_date) }}
            </span>
          </div>
          <p v-if="task.description" class="text-gray-700 mb-4">{{ task.description }}</p>
        </div>
        
        <div class="flex space-x-3">
          <router-link
            :to="`/tasks/${task.id}/edit`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </router-link>
          
          <button
            v-if="task.status !== 'completed'"
            @click="updateStatus('completed')"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Mark Complete
          </button>
          
          <button
            @click="deleteTask"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Task Information -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Task Information</h2>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1">
                <TaskStatusBadge :status="task.status" />
              </dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Priority</dt>
              <dd class="mt-1">
                <TaskPriorityBadge :priority="task.priority" />
              </dd>
            </div>
            
            <div v-if="task.due_date">
              <dt class="text-sm font-medium text-gray-500">Due Date</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <span :class="{ 'text-red-600 font-medium': isOverdue }">
                  {{ formatDate(task.due_date) }}
                </span>
              </dd>
            </div>
            
            <div v-if="task.assigned_to">
              <dt class="text-sm font-medium text-gray-500">Assigned To</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ task.assigned_to }}</dd>
            </div>
            
            <div v-if="task.estimated_hours">
              <dt class="text-sm font-medium text-gray-500">Estimated Hours</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ task.estimated_hours }}h</dd>
            </div>
            
            <div v-if="task.actual_hours">
              <dt class="text-sm font-medium text-gray-500">Actual Hours</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ task.actual_hours }}h</dd>
            </div>
          </dl>
        </div>

        <!-- Tags -->
        <div v-if="task.tags && task.tags.length > 0" class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Tags</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in task.tags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Metadata -->
        <div v-if="task.metadata && Object.keys(task.metadata).length > 0" class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div v-for="(value, key) in task.metadata" :key="key">
              <dt class="text-sm font-medium text-gray-500 capitalize">{{ key.replace('_', ' ') }}</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ value }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button
              v-if="task.status === 'pending'"
              @click="updateStatus('in_progress')"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Progress
            </button>
            
            <button
              v-if="task.status === 'in_progress'"
              @click="updateStatus('completed')"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Mark Complete
            </button>
            
            <button
              v-if="task.status === 'completed'"
              @click="updateStatus('pending')"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reopen Task
            </button>
            
            <button
              v-if="task.status !== 'cancelled'"
              @click="updateStatus('cancelled')"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel Task
            </button>
          </div>
        </div>

        <!-- Task Timeline -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Timeline</h2>
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-900">Task Created</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(task.created_at) }}</p>
              </div>
            </div>
            
            <div v-if="task.updated_at !== task.created_at" class="flex items-start">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-900">Last Updated</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(task.updated_at) }}</p>
              </div>
            </div>
            
            <div v-if="task.completed_at" class="flex items-start">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-900">Completed</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(task.completed_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h3 class="mt-2 text-sm font-medium text-gray-900">Task not found</h3>
    <p class="mt-1 text-sm text-gray-500">The task you're looking for doesn't exist or has been deleted.</p>
    <div class="mt-6">
      <router-link
        to="/tasks"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Back to Tasks
      </router-link>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <ConfirmationModal
    v-if="showDeleteModal"
    title="Delete Task"
    message="Are you sure you want to delete this task? This action cannot be undone."
    confirm-text="Delete"
    cancel-text="Cancel"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useTaskStore } from '@/stores/taskStore'
import { formatDate, formatDateTime } from '@/utils/dateUtils'
import TaskStatusBadge from '@/components/ui/TaskStatusBadge.vue'
import TaskPriorityBadge from '@/components/ui/TaskPriorityBadge.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const taskStore = useTaskStore()

const showDeleteModal = ref(false)

// Computed properties
const task = computed(() => taskStore.currentTask)
const loading = computed(() => taskStore.loading)

const isOverdue = computed(() => {
  if (!task.value || !task.value.due_date) return false
  
  const dueDate = new Date(task.value.due_date)
  if (isNaN(dueDate.getTime())) return false
  
  return dueDate < new Date() && 
         task.value.status !== 'completed' && 
         task.value.status !== 'cancelled'
})

// Methods

// Methods
const loadTask = async () => {
  const taskId = route.params.id as string
  try {
    // Clear current task cache to ensure fresh data
    taskStore.clearCurrentTask()
    await taskStore.fetchTask(taskId)
  } catch (error: any) {
    if (error.response?.status === 404) {
      toast.error('Task not found - it may have been deleted')
      router.push('/tasks')
    } else {
      toast.error('Failed to load task')
    }
  }
}

const updateStatus = async (status: string) => {
  if (!task.value) return
  
  try {
    await taskStore.updateTaskStatus(task.value.id, status)
    toast.success(`Task status updated to ${status}`)
    // Refresh the task to ensure UI shows latest data from backend
    await loadTask()
  } catch (error: any) {
    if (error.response?.status === 404) {
      toast.error('Task not found - it may have been deleted')
      router.push('/tasks')
    } else {
      toast.error('Failed to update task status')
      // Refresh even on error to ensure UI consistency
      await loadTask()
    }
  }
}

const deleteTask = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!task.value) return
  
  try {
    await taskStore.deleteTask(task.value.id)
    toast.success('Task deleted successfully')
    router.push('/tasks')
  } catch (error: any) {
    if (error.response?.status === 404) {
      toast.warning('Task was already deleted')
      router.push('/tasks')
    } else {
      toast.error('Failed to delete task')
    }
  }
  showDeleteModal.value = false
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

// Lifecycle
onMounted(async () => {
  await loadTask()
})
</script>
