<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-end">
      <!-- Search Input -->
      <div class="flex-1">
        <label for="search" class="block text-sm font-medium text-gray-700">Search Tasks</label>
        <div class="mt-1 relative">
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Search by title or description..."
            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            @input="handleSearchChange"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="lg:w-48">
        <label for="status-filter" class="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status-filter"
          v-model="statusFilter"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          @change="handleStatusChange"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Priority Filter -->
      <div class="lg:w-48">
        <label for="priority-filter" class="block text-sm font-medium text-gray-700">Priority</label>
        <select
          id="priority-filter"
          v-model="priorityFilter"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          @change="handlePriorityChange"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <!-- Sort Options -->
      <div class="lg:w-48">
        <label for="sort-by" class="block text-sm font-medium text-gray-700">Sort By</label>
        <select
          id="sort-by"
          v-model="sortBy"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          @change="handleSortChange"
        >
          <option value="createdAt">Created Date</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
      </div>

      <!-- Sort Order -->
      <div class="lg:w-32">
        <label for="sort-order" class="block text-sm font-medium text-gray-700">Order</label>
        <select
          id="sort-order"
          v-model="sortOrder"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          @change="handleSortChange"
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>

      <!-- Clear Filters Button -->
      <div class="lg:w-auto">
        <button
          @click="clearAllFilters"
          type="button"
          class="w-full lg:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <XMarkIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Clear
        </button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <span class="text-sm text-gray-500">Active filters:</span>
      
      <span
        v-if="searchQuery"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      >
        Search: "{{ searchQuery }}"
        <button
          @click="clearSearch"
          type="button"
          class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
        >
          <span class="sr-only">Remove search filter</span>
          <XMarkIcon class="h-3 w-3" aria-hidden="true" />
        </button>
      </span>

      <span
        v-if="statusFilter"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
      >
        Status: {{ formatStatus(statusFilter) }}
        <button
          @click="clearStatus"
          type="button"
          class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
        >
          <span class="sr-only">Remove status filter</span>
          <XMarkIcon class="h-3 w-3" aria-hidden="true" />
        </button>
      </span>

      <span
        v-if="priorityFilter"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
      >
        Priority: {{ formatPriority(priorityFilter) }}
        <button
          @click="clearPriority"
          type="button"
          class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500 focus:outline-none focus:bg-yellow-500 focus:text-white"
        >
          <span class="sr-only">Remove priority filter</span>
          <XMarkIcon class="h-3 w-3" aria-hidden="true" />
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const taskStore = useTaskStore()

// Local filter state
const searchQuery = ref(taskStore.searchQuery)
const statusFilter = ref(taskStore.statusFilter)
const priorityFilter = ref(taskStore.priorityFilter)
const sortBy = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Simple debounce function
let searchTimeout: ReturnType<typeof setTimeout> | null = null

function debounce(func: Function, delay: number) {
  return (...args: any[]) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => func(...args), delay)
  }
}

// Computed properties
const hasActiveFilters = computed(() => 
  searchQuery.value || statusFilter.value || priorityFilter.value
)

// Debounced search handler
const debouncedSearch = debounce((query: string) => {
  taskStore.setSearchQuery(query)
  refreshTasks()
}, 300)

// Event handlers
function handleSearchChange() {
  debouncedSearch(searchQuery.value)
}

function handleStatusChange() {
  taskStore.setStatusFilter(statusFilter.value)
  refreshTasks()
}

function handlePriorityChange() {
  taskStore.setPriorityFilter(priorityFilter.value)
  refreshTasks()
}

function handleSortChange() {
  refreshTasks()
}

function clearAllFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
  taskStore.clearFilters()
  refreshTasks()
}

function clearSearch() {
  searchQuery.value = ''
  taskStore.setSearchQuery('')
  refreshTasks()
}

function clearStatus() {
  statusFilter.value = ''
  taskStore.setStatusFilter('')
  refreshTasks()
}

function clearPriority() {
  priorityFilter.value = ''
  taskStore.setPriorityFilter('')
  refreshTasks()
}

function refreshTasks() {
  const params = {
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
    priority: priorityFilter.value || undefined,
    sort: sortBy.value,
    order: sortOrder.value,
    page: 1, // Reset to first page when filtering
  }
  
  taskStore.fetchTasks(params)
}

// Utility functions
function formatStatus(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'In Progress'
    case 'pending':
      return 'Pending'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

// Watch for external changes to store filters
watch(() => taskStore.searchQuery, (newValue) => {
  if (newValue !== searchQuery.value) {
    searchQuery.value = newValue
  }
})

watch(() => taskStore.statusFilter, (newValue) => {
  if (newValue !== statusFilter.value) {
    statusFilter.value = newValue
  }
})

watch(() => taskStore.priorityFilter, (newValue) => {
  if (newValue !== priorityFilter.value) {
    priorityFilter.value = newValue
  }
})
</script>
