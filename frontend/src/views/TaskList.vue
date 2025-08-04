<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
        <p class="mt-2 text-sm text-gray-700">Manage and track all your tasks</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <router-link
          to="/tasks/create"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </router-link>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white shadow rounded-lg p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Search -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
          <div class="mt-1 relative">
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Search tasks..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              @input="debouncedSearch"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status-filter"
            v-model="statusFilter"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            @change="applyFilters"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div>
          <label for="priority-filter" class="block text-sm font-medium text-gray-700">Priority</label>
          <select
            id="priority-filter"
            v-model="priorityFilter"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            @change="applyFilters"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <!-- Sort -->
        <div>
          <label for="sort" class="block text-sm font-medium text-gray-700">Sort by</label>
          <select
            id="sort"
            v-model="sortBy"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            @change="applyFilters"
          >
            <option value="created_at:desc">Newest First</option>
            <option value="created_at:asc">Oldest First</option>
            <option value="due_date:asc">Due Date (Ascending)</option>
            <option value="due_date:desc">Due Date (Descending)</option>
            <option value="priority:desc">Priority (High to Low)</option>
            <option value="title:asc">Title (A-Z)</option>
          </select>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedTasks.length > 0" class="mt-4 flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-sm text-gray-700">
            {{ selectedTasks.length }} task{{ selectedTasks.length !== 1 ? 's' : '' }} selected
          </span>
        </div>
        <div class="flex space-x-2">
          <button
            @click="bulkUpdateStatus('completed')"
            class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Mark Complete
          </button>
          <button
            @click="bulkDelete"
            class="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Tasks List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <!-- Loading State -->
      <div v-if="loading" class="p-6">
        <div class="animate-pulse space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
            <div class="h-4 w-4 bg-gray-200 rounded"></div>
            <div class="flex-1 space-y-2 py-1">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="(tasks || []).length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
        <div class="mt-6">
          <router-link
            to="/tasks/create"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </router-link>
        </div>
      </div>

      <!-- Tasks Table -->
      <div v-else>
        <!-- Header -->
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div class="flex items-center">
            <input
              id="select-all"
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="select-all" class="ml-3 text-sm font-medium text-gray-700">
              Select All
            </label>
          </div>
        </div>

        <!-- Task Items -->
        <ul class="divide-y divide-gray-200">
          <li v-for="task in tasks" :key="task.id" class="px-6 py-4 hover:bg-gray-50">
            <div class="flex items-center">
              <input
                :id="`task-${task.id}`"
                v-model="selectedTasks"
                :value="task.id"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              
              <div class="ml-4 flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <router-link
                      :to="`/tasks/${task.id}`"
                      class="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {{ task.title }}
                    </router-link>
                    <p v-if="task.description" class="text-sm text-gray-500 mt-1 truncate">
                      {{ task.description }}
                    </p>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <!-- Priority Badge -->
                    <TaskPriorityBadge :priority="task.priority" />
                    
                    <!-- Status Badge -->
                    <TaskStatusBadge :status="task.status" />
                    
                    <!-- Due Date -->
                    <div v-if="task.due_date" class="text-sm text-gray-500">
                      <div class="flex items-center">
                        <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span :class="{ 'text-red-600 font-medium': isOverdue(task) }">
                          {{ formatDate(task.due_date) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Actions Dropdown -->
                    <div class="relative" @click.stop>
                      <button
                        @click="toggleDropdown(task.id)"
                        class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
                      >
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      <div
                        v-if="openDropdown === task.id"
                        :ref="el => setDropdownRef(el, task.id)"
                        :class="getDropdownClasses(task.id)"
                        class="absolute w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 max-h-60 overflow-y-auto"
                      >
                        <div class="py-1">
                          <router-link
                            :to="`/tasks/${task.id}`"
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View Details
                          </router-link>
                          <router-link
                            :to="`/tasks/${task.id}/edit`"
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit Task
                          </router-link>
                          <button
                            v-if="task.status !== 'completed'"
                            @click="updateStatus(task.id, 'completed')"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Mark Complete
                          </button>
                          <button
                            v-if="task.status === 'completed'"
                            @click="updateStatus(task.id, 'pending')"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Mark Pending
                          </button>
                          <hr class="my-1">
                          <button
                            @click="deleteTask(task.id)"
                            class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          >
                            Delete Task
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          :disabled="!pagination.hasPreviousPage"
          @click="changePage(pagination.page - 1)"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          :disabled="!pagination.hasNextPage"
          @click="changePage(pagination.page + 1)"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
            of
            <span class="font-medium">{{ pagination.total }}</span>
            results
          </p>
        </div>
        
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              :disabled="!pagination.hasPreviousPage"
              @click="changePage(pagination.page - 1)"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <template v-for="page in visiblePages" :key="page">
              <button
                v-if="page === '...'"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </button>
              <button
                v-else
                @click="changePage(Number(page))"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium"
                :class="page === pagination.page 
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                {{ page }}
              </button>
            </template>
            
            <button
              :disabled="!pagination.hasNextPage"
              @click="changePage(pagination.page + 1)"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <ConfirmationModal
    v-if="showDeleteModal"
    title="Delete Task"
    :message="deleteModalMessage"
    confirm-text="Delete"
    cancel-text="Cancel"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useTaskStore } from '@/stores/taskStore'
import { formatDate, isTaskOverdue } from '@/utils/dateUtils'
import TaskStatusBadge from '@/components/ui/TaskStatusBadge.vue'
import TaskPriorityBadge from '@/components/ui/TaskPriorityBadge.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import { debounce } from '@/utils/debounce'

const router = useRouter()
const toast = useToast()
const taskStore = useTaskStore()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const sortBy = ref('created_at:desc')
const selectedTasks = ref<string[]>([])
const openDropdown = ref<string | null>(null)
const showDeleteModal = ref(false)
const taskToDelete = ref<string | null>(null)
const deleteModalMessage = ref('')
const isBulkDelete = ref(false)
const dropdownPositions = ref<Record<string, { top?: boolean; right?: boolean }>>({})
const dropdownRefs = ref<Record<string, HTMLElement>>({})

// Computed properties
const tasks = computed(() => {
  return taskStore.tasks || []
})
const loading = computed(() => {
  return taskStore.loading
})
const pagination = computed(() => taskStore.pagination || {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
})

const allSelected = computed(() => 
  tasks.value.length > 0 && selectedTasks.value.length === tasks.value.length
)

const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.totalPages
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else if (total > 1) {
    rangeWithDots.push(total)
  }

  return rangeWithDots
})

// Methods
const loadTasks = async (page?: number) => {
  try {
    const [sortField, sortOrder] = sortBy.value.split(':')
    
    const query = {
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      priority: priorityFilter.value || undefined,
      sort_by: sortField,
      sort_order: sortOrder as 'asc' | 'desc',
      page: page || pagination.value.page,
      limit: pagination.value.limit
    }
    
    await taskStore.fetchTasks(query)
  } catch (error) {
    console.error('TaskList: Failed to load tasks:', error)
    toast.error('Failed to load tasks')
  }
}

const debouncedSearch = debounce(async () => {
  await loadTasks(1) // Reset to page 1 when searching
}, 300)

const applyFilters = async () => {
  await loadTasks(1) // Reset to page 1 when applying filters
}

const changePage = async (page: number) => {
  await loadTasks(page)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedTasks.value = []
  } else {
    selectedTasks.value = tasks.value.map(task => task.id)
  }
}

const toggleDropdown = (taskId: string) => {
  const wasOpen = openDropdown.value === taskId
  openDropdown.value = wasOpen ? null : taskId
  
  if (!wasOpen) {
    // Calculate position after dropdown opens
    nextTick(() => {
      calculateDropdownPosition(taskId)
    })
  } else {
    // Clean up position data when closing
    delete dropdownPositions.value[taskId]
    delete dropdownRefs.value[taskId]
  }
}

const setDropdownRef = (el: any, taskId: string) => {
  if (el && el instanceof HTMLElement) {
    dropdownRefs.value[taskId] = el
  }
}

const calculateDropdownPosition = (taskId: string) => {
  const dropdown = dropdownRefs.value[taskId]
  if (!dropdown) return

  const rect = dropdown.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  
  // Add buffer to prevent dropdown from being too close to viewport edges
  const buffer = 20
  
  // Check if dropdown goes below viewport (considering dropdown height)
  const dropdownHeight = 240 // Approximate height based on content
  const wouldOverflowBottom = rect.top + dropdownHeight > viewportHeight - buffer
  
  // Check if dropdown goes beyond right edge
  const wouldOverflowRight = rect.right > viewportWidth - buffer

  dropdownPositions.value[taskId] = {
    top: wouldOverflowBottom,
    right: wouldOverflowRight
  }
}

const getDropdownClasses = (taskId: string) => {
  const position = dropdownPositions.value[taskId] || {}
  
  const classes = []
  
  if (position.top) {
    classes.push('bottom-full', 'mb-2')
  } else {
    classes.push('top-full', 'mt-2')
  }
  
  if (position.right) {
    classes.push('left-0')
  } else {
    classes.push('right-0')
  }
  
  return classes.join(' ')
}

const updateStatus = async (taskId: string, status: string) => {
  try {
    await taskStore.updateTaskStatus(taskId, status)
    toast.success(`Task status updated to ${status}`)
    openDropdown.value = null
  } catch (error) {
    toast.error('Failed to update task status')
  }
}

const deleteTask = (taskId: string) => {
  taskToDelete.value = taskId
  isBulkDelete.value = false
  deleteModalMessage.value = 'Are you sure you want to delete this task? This action cannot be undone.'
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    if (isBulkDelete.value) {
      // Handle bulk deletion
      const promises = selectedTasks.value.map(taskId => 
        taskStore.deleteTask(taskId)
      )
      await Promise.all(promises)
      toast.success(`${selectedTasks.value.length} task${selectedTasks.value.length !== 1 ? 's' : ''} deleted successfully`)
      selectedTasks.value = []
    } else if (taskToDelete.value) {
      // Handle single task deletion
      await taskStore.deleteTask(taskToDelete.value)
      toast.success('Task deleted successfully')
      selectedTasks.value = selectedTasks.value.filter(id => id !== taskToDelete.value)
    }
    
    // Refresh the task list to ensure UI is in sync
    await loadTasks()
  } catch (error) {
    console.error('Delete operation failed:', error)
    toast.error('Failed to delete task(s)')
    // Even if there's an error, refresh the list to ensure UI consistency
    await loadTasks()
  }
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteModal.value = false
  taskToDelete.value = null
  deleteModalMessage.value = ''
  isBulkDelete.value = false
}

const bulkUpdateStatus = async (status: string) => {
  try {
    const promises = selectedTasks.value.map(taskId => 
      taskStore.updateTaskStatus(taskId, status)
    )
    await Promise.all(promises)
    toast.success(`${selectedTasks.value.length} tasks updated`)
    selectedTasks.value = []
  } catch (error) {
    toast.error('Failed to update tasks')
  }
}

const bulkDelete = () => {
  isBulkDelete.value = true
  taskToDelete.value = null
  deleteModalMessage.value = `Are you sure you want to delete ${selectedTasks.value.length} task${selectedTasks.value.length !== 1 ? 's' : ''}? This action cannot be undone.`
  showDeleteModal.value = true
}

const isOverdue = (task: any) => {
  return isTaskOverdue(task)
}

// Close dropdown when clicking outside
const closeDropdowns = () => {
  openDropdown.value = null
  // Clean up all position data
  dropdownPositions.value = {}
  dropdownRefs.value = {}
}

// Handle window resize to recalculate dropdown positions
const handleResize = () => {
  if (openDropdown.value) {
    nextTick(() => {
      calculateDropdownPosition(openDropdown.value!)
    })
  }
}

// Lifecycle
onMounted(async () => {
  await loadTasks()
  document.addEventListener('click', closeDropdowns)
  window.addEventListener('resize', handleResize)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
  window.removeEventListener('resize', handleResize)
})

watch(() => router.currentRoute.value, () => {
  document.removeEventListener('click', closeDropdowns)
  window.removeEventListener('resize', handleResize)
})
</script>
