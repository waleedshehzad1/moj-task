<template>
  <span
    class="inline-flex items-center rounded-full font-medium"
    :class="[sizeClasses, colorClasses]"
  >
    {{ priorityText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
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
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return colors[props.priority]
})

const priorityText = computed(() => {
  const texts = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  }
  return texts[props.priority]
})
</script>
