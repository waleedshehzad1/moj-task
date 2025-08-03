<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="mt-2 text-sm text-gray-600">
              Overview of task management activities
            </p>
          </div>
          <router-link
            to="/tasks/create"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Tasks"
        :value="taskStats?.total || 0"
        icon="📋"
        color="blue"
      />
      <StatsCard
        title="Pending"
        :value="taskStats?.by_status?.pending || 0"
        icon="⏳"
        color="yellow"
      />
      <StatsCard
        title="In Progress"
        :value="taskStats?.by_status?.in_progress || 0"
        icon="🔄"
        color="blue"
      />
      <StatsCard
        title="Completed"
        :value="taskStats?.by_status?.completed || 0"
        icon="✅"
        color="green"
      />
    </div>

    <!-- Quick Actions and Recent Tasks -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <router-link
              to="/tasks/create"
              class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span class="mr-2">+</span>
              Create New Task
            </router-link>
            <router-link
              to="/tasks?status=pending"
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Pending Tasks
            </router-link>
            <router-link
              to="/tasks?overdue=true"
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Overdue Tasks
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Recent Tasks</h3>
            <router-link
              to="/tasks"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </router-link>
          </div>
          
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          
          <div v-else-if="recentTasks.length === 0" class="text-center py-6">
            <p class="text-gray-500">No recent tasks found</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="task in recentTasks"
              :key="task.id"
              class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              @click="$router.push(`/tasks/${task.id}`)"
            >
              <TaskStatusBadge :status="task.status" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ task.title }}
                </p>
                <p class="text-xs text-gray-500">
                  Due: {{ formatDate(task.due_date) }}
                </p>
              </div>
              <TaskPriorityBadge :priority="task.priority" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Overview -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">
              {{ taskStats?.completion_rate || 0 }}%
            </div>
            <div class="text-sm text-gray-500">Completion Rate</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-600">
              {{ taskStats?.overdue || 0 }}
            </div>
            <div class="text-sm text-gray-500">Overdue Tasks</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">
              {{ taskStats?.by_status?.in_progress || 0 }}
            </div>
            <div class="text-sm text-gray-500">Active Tasks</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { formatDate } from '@/utils/dateUtils'
import StatsCard from '@/components/ui/StatsCard.vue'
import TaskStatusBadge from '@/components/ui/TaskStatusBadge.vue'
import TaskPriorityBadge from '@/components/ui/TaskPriorityBadge.vue'

const taskStore = useTaskStore()

const taskStats = computed(() => taskStore.taskStats)
const loading = computed(() => taskStore.loading)
const recentTasks = computed(() => {
  return Array.isArray(taskStore.tasks) ? taskStore.tasks.slice(0, 5) : []
})

onMounted(async () => {
  try {
    await Promise.all([
      taskStore.fetchTaskStats(),
      taskStore.fetchTasks({ limit: 5, sort_by: 'created_at', sort_order: 'desc' })
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})
</script>
