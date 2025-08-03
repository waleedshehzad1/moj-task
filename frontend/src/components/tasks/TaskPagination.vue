<template>
  <nav class="flex items-center justify-between" aria-label="Pagination">
    <!-- Mobile pagination -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="goToPrevious"
        :disabled="currentPage <= 1"
        :class="[
          'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
          currentPage <= 1
            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
            : 'text-gray-700 bg-white hover:bg-gray-50'
        ]"
      >
        Previous
      </button>
      
      <span class="text-sm text-gray-700 flex items-center">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      
      <button
        @click="goToNext"
        :disabled="currentPage >= totalPages"
        :class="[
          'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
          currentPage >= totalPages
            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
            : 'text-gray-700 bg-white hover:bg-gray-50'
        ]"
      >
        Next
      </button>
    </div>

    <!-- Desktop pagination -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Showing
          <span class="font-medium">{{ startItem }}</span>
          to
          <span class="font-medium">{{ endItem }}</span>
          of
          <span class="font-medium">{{ totalItems }}</span>
          results
        </p>
      </div>
      
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <!-- Previous button -->
          <button
            @click="goToPrevious"
            :disabled="currentPage <= 1"
            :class="[
              'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium',
              currentPage <= 1
                ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                : 'text-gray-500 bg-white hover:bg-gray-50'
            ]"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
          </button>

          <!-- Page numbers -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="typeof page === 'number'"
              @click="goToPage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium',
                page === currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          </template>

          <!-- Next button -->
          <button
            @click="goToNext"
            :disabled="currentPage >= totalPages"
            :class="[
              'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium',
              currentPage >= totalPages
                ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                : 'text-gray-500 bg-white hover:bg-gray-50'
            ]"
          >
            <span class="sr-only">Next</span>
            <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

// Computed properties
const startItem = computed(() => {
  return Math.min((props.currentPage - 1) * props.perPage + 1, props.totalItems)
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.totalItems)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages } = props
  
  if (totalPages <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (currentPage <= 4) {
      // Show pages 1-5 + ... + last
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Show 1 + ... + last 5 pages
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show 1 + ... + current-1, current, current+1 + ... + last
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
})

// Event handlers
function goToPrevious() {
  if (props.currentPage > 1) {
    emit('pageChange', props.currentPage - 1)
  }
}

function goToNext() {
  if (props.currentPage < props.totalPages) {
    emit('pageChange', props.currentPage + 1)
  }
}

function goToPage(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('pageChange', page)
  }
}
</script>
