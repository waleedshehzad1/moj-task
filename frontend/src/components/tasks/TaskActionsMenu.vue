<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton class="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <button
              @click="viewTask"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center w-full px-4 py-2 text-sm'
              ]"
            >
              <EyeIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              View Details
            </button>
          </MenuItem>
          
          <MenuItem v-slot="{ active }">
            <button
              @click="editTask"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center w-full px-4 py-2 text-sm'
              ]"
            >
              <PencilIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              Edit Task
            </button>
          </MenuItem>

          <MenuItem v-if="task.status !== 'completed'" v-slot="{ active }">
            <button
              @click="markCompleted"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center w-full px-4 py-2 text-sm'
              ]"
            >
              <CheckIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              Mark Complete
            </button>
          </MenuItem>

          <MenuItem v-if="task.status === 'completed'" v-slot="{ active }">
            <button
              @click="reopenTask"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center w-full px-4 py-2 text-sm'
              ]"
            >
              <ArrowUturnLeftIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              Reopen Task
            </button>
          </MenuItem>

          <div class="border-t border-gray-100"></div>
          
          <MenuItem v-slot="{ active }">
            <button
              @click="duplicateTask"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center w-full px-4 py-2 text-sm'
              ]"
            >
              <DocumentDuplicateIcon class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              Duplicate
            </button>
          </MenuItem>

          <div class="border-t border-gray-100"></div>
          
          <MenuItem v-slot="{ active }">
            <button
              @click="deleteTask"
              :class="[
                active ? 'bg-gray-100 text-red-900' : 'text-red-700',
                'group flex items-center w-full px-4 py-2 text-sm'
              ]"
            >
              <TrashIcon class="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" aria-hidden="true" />
              Delete Task
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import type { Task } from '@/services/api'

interface Props {
  task: Task
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
  view: [task: Task]
  statusChange: [task: Task, status: string]
  duplicate: [task: Task]
}>()

// Injected functions
const onTaskClick = inject('onTaskClick') as (task: Task) => void

function viewTask() {
  onTaskClick(props.task)
}

function editTask() {
  emit('edit', props.task)
}

function deleteTask() {
  if (confirm(`Are you sure you want to delete "${props.task.title}"?`)) {
    emit('delete', props.task)
  }
}

function markCompleted() {
  emit('statusChange', props.task, 'completed')
}

function reopenTask() {
  emit('statusChange', props.task, 'pending')
}

function duplicateTask() {
  emit('duplicate', props.task)
}
</script>
