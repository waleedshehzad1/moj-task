<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div 
            class="w-10 h-10 rounded-md flex items-center justify-center text-2xl"
            :class="colorClasses"
          >
            {{ icon }}
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ title }}
            </dt>
            <dd class="text-lg font-medium text-gray-900">
              {{ formattedValue }}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number
  icon: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

const colorClasses = computed(() => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  }
  return colors[props.color]
})

const formattedValue = computed(() => {
  const numValue = props.value ?? 0
  return new Intl.NumberFormat().format(numValue)
})
</script>
