<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading tasks...
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-600 mb-4">{{ error }}</div>
      <button
        @click="retryLoading"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <ArrowPathIcon class="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="tasks.length === 0" class="p-8 text-center">
      <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ hasActiveFilters ? 'Try adjusting your filters to see more results.' : 'Get started by creating a new task.' }}
      </p>
      <div v-if="!hasActiveFilters" class="mt-6">
        <button
          @click="createNewTask"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Task
        </button>
      </div>
    </div>

    <!-- Tasks List -->
    <div v-else>
      <!-- Table Header -->
      <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Tasks ({{ pagination.total }})
          </h3>
          <div class="flex items-center space-x-2">
            <!-- View Toggle -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                List
              </button>
              <button
                @click="viewMode = 'cards'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  viewMode === 'cards'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="task in tasks"
              :key="task.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="onTaskClick(task)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">{{ task.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <TaskStatusBadge :status="task.status" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <TaskPriorityBadge :priority="task.priority" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ task.assigned_to ? getUserName(task.assigned_to) : 'Unassigned' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ task.due_date ? formatDate(task.due_date) : 'No due date' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <TaskActionsMenu :task="task" @edit="editTask" @delete="deleteTask" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards View -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @click="onTaskClick(task)"
          @edit="editTask"
          @delete="deleteTask"
        />
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <TaskPagination
          :current-page="pagination.page"
          :total-pages="pagination.totalPages"
          :total-items="pagination.total"
          :per-page="pagination.limit"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import type { Task } from '@/services/api'
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

// Components
import TaskStatusBadge from './TaskStatusBadge.vue'
import TaskPriorityBadge from './TaskPriorityBadge.vue'
import TaskActionsMenu from './TaskActionsMenu.vue'
import TaskCard from './TaskCard.vue'
import TaskPagination from './TaskPagination.vue'

const taskStore = useTaskStore()

// Injected functions
const onTaskClick = inject('onTaskClick') as (task: Task) => void

// Local state
const viewMode = ref<'list' | 'cards'>('list')

// Computed properties
const tasks = computed(() => taskStore.tasks)
const isLoading = computed(() => taskStore.isLoading)
const error = computed(() => taskStore.error)
const pagination = computed(() => taskStore.pagination)
const hasActiveFilters = computed(() => 
  taskStore.searchQuery || taskStore.statusFilter || taskStore.priorityFilter
)

// Event handlers
function retryLoading() {
  taskStore.clearError()
  taskStore.fetchTasks()
}

function createNewTask() {
  // This would trigger the create modal in parent component
  // For now, we'll emit an event or use event bus
  console.log('Create new task')
}

function editTask(task: Task) {
  console.log('Edit task:', task.id)
}

function deleteTask(task: Task) {
  console.log('Delete task:', task.id)
}

function handlePageChange(page: number) {
  const params = {
    page,
    search: taskStore.searchQuery || undefined,
    status: taskStore.statusFilter || undefined,
    priority: taskStore.priorityFilter || undefined,
  }
  taskStore.fetchTasks(params)
}

// Utility functions
function getUserName(userId: string): string {
  // This would normally look up user from a users store
  // For now, return the userId or a placeholder
  switch (userId) {
    case '550e8400-e29b-41d4-a716-446655440003':
      return 'John Smith'
    case '550e8400-e29b-41d4-a716-446655440004':
      return 'Sarah Jones'
    default:
      return 'Unknown User'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>
