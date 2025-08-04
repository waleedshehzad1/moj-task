<template>
  <span
    class="inline-flex items-center rounded-full font-medium"
    :class="[sizeClasses, colorClasses]"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'pending',
  size: 'md'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[props.status || 'pending']
})

const statusText = computed(() => {
  const texts = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return texts[props.status || 'pending']
})
</script>
