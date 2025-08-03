<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      priorityClasses[priority] || priorityClasses.medium
    ]"
  >
    <component 
      :is="priorityIcons[priority] || priorityIcons.medium"
      :class="['-ml-0.5 mr-1.5 h-3 w-3']" 
      aria-hidden="true"
    />
    {{ formatPriority(priority) }}
  </span>
</template>

<script setup lang="ts">
import {
  ArrowUpIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/solid'

interface Props {
  priority: string
}

defineProps<Props>()

const priorityClasses: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const priorityIcons: Record<string, any> = {
  low: ArrowDownIcon,
  medium: ArrowRightIcon,
  high: ArrowUpIcon,
  urgent: ExclamationTriangleIcon,
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
</script>
