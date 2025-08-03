<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      getStatusClasses(status)
    ]"
  >
    <svg 
      :class="['-ml-0.5 mr-1.5 h-2 w-2', getDotClasses(status)]" 
      fill="currentColor" 
      viewBox="0 0 8 8"
    >
      <circle cx="4" cy="4" r="3" />
    </svg>
    {{ formatStatus(status) }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  status: string
}

defineProps<Props>()

const statusClasses: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const dotClasses: Record<string, string> = {
  pending: 'text-yellow-400',
  in_progress: 'text-blue-400',
  completed: 'text-green-400',
  cancelled: 'text-red-400',
}

function getStatusClasses(status: string): string {
  return statusClasses[status] || statusClasses.pending
}

function getDotClasses(status: string): string {
  return dotClasses[status] || dotClasses.pending
}

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
</script>
