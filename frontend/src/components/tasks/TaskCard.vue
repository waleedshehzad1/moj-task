<template>
  <div
    class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    @click="$emit('click', task)"
  >
    <!-- Card Header -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</h3>
          <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ task.description }}</p>
        </div>
        <div class="ml-2 flex-shrink-0">
          <TaskActionsMenu
            :task="task"
            @edit="$emit('edit', task)"
            @delete="$emit('delete', task)"
            @status-change="handleStatusChange"
            @duplicate="handleDuplicate"
          />
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-4 space-y-3">
      <!-- Status and Priority -->
      <div class="flex items-center justify-between">
        <TaskStatusBadge :status="task.status" />
        <TaskPriorityBadge :priority="task.priority" />
      </div>

      <!-- Assignment and Due Date -->
      <div class="space-y-2">
        <div class="flex items-center text-sm text-gray-600">
          <UserIcon class="h-4 w-4 mr-2 text-gray-400" aria-hidden="true" />
          <span>{{ task.assigned_to ? getUserName(task.assigned_to) : 'Unassigned' }}</span>
        </div>

        <div v-if="task.due_date" class="flex items-center text-sm text-gray-600">
          <CalendarIcon class="h-4 w-4 mr-2 text-gray-400" aria-hidden="true" />
          <span 
            :class="[
              isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-600'
            ]"
          >
            {{ formatDueDate(task.due_date) }}
            <span v-if="isOverdue" class="font-medium">(Overdue)</span>
            <span v-else-if="isDueSoon" class="font-medium">(Due Soon)</span>
          </span>
        </div>
      </div>

      <!-- In-progress indicator for in-progress tasks -->
      <div v-if="task.status === 'in_progress'" class="space-y-1">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>In Progress</span>
          <ClockIcon class="h-3 w-3" aria-hidden="true" />
        </div>
      </div>

      <!-- Task metadata -->
      <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>Created {{ formatRelativeTime(task.createdAt) }}</span>
        <span v-if="task.updatedAt && task.updatedAt !== task.createdAt">
          Updated {{ formatRelativeTime(task.updatedAt) }}
        </span>
      </div>
    </div>

    <!-- Overdue indicator -->
    <div v-if="isOverdue" class="absolute top-0 right-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-red-500 border-b-8 border-b-transparent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserIcon, CalendarIcon, ClockIcon } from '@heroicons/vue/24/outline'
import type { Task } from '@/services/api'
import TaskStatusBadge from './TaskStatusBadge.vue'
import TaskPriorityBadge from './TaskPriorityBadge.vue'
import TaskActionsMenu from './TaskActionsMenu.vue'

interface Props {
  task: Task
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
}>()

// Computed properties
const isOverdue = computed(() => {
  if (!props.task.due_date || props.task.status === 'completed') return false
  return new Date(props.task.due_date) < new Date()
})

const isDueSoon = computed(() => {
  if (!props.task.due_date || props.task.status === 'completed' || isOverdue.value) return false
  const dueDate = new Date(props.task.due_date)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 3 && diffDays >= 0
})

// Event handlers
function handleStatusChange(task: Task, status: string) {
  console.log('Status change:', task.id, status)
  // Would update task status here
}

function handleDuplicate(task: Task) {
  console.log('Duplicate task:', task.id)
  // Would create duplicate task here
}

// Utility functions
function getUserName(userId: string): string {
  // This would normally look up user from a users store
  switch (userId) {
    case '550e8400-e29b-41d4-a716-446655440003':
      return 'John Smith'
    case '550e8400-e29b-41d4-a716-446655440004':
      return 'Sarah Jones'
    default:
      return 'Unknown User'
  }
}

function formatDueDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays === -1) return 'Due yesterday'
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`
  if (diffDays <= 7) return `Due in ${diffDays} days`
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))

  if (diffDays > 7) {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    })
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
