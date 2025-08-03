<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
              <div v-if="task">
                <!-- Header -->
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1 min-w-0">
                    <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900 mb-2">
                      {{ task.title }}
                    </DialogTitle>
                    <div class="flex items-center space-x-3">
                      <TaskStatusBadge :status="task.status" />
                      <TaskPriorityBadge :priority="task.priority" />
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button
                      @click="editTask"
                      type="button"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon class="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                      Edit
                    </button>
                    <TaskActionsMenu
                      :task="task"
                      @edit="editTask"
                      @delete="deleteTask"
                      @status-change="handleStatusChange"
                      @duplicate="handleDuplicate"
                    />
                    <button
                      @click="closeModal"
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span class="sr-only">Close</span>
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <!-- Content -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <!-- Main Content -->
                  <div class="lg:col-span-2 space-y-6">
                    <!-- Description -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <div class="bg-gray-50 rounded-lg p-4">
                        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ task.description }}</p>
                      </div>
                    </div>

                    <!-- Additional Information -->
                    <div v-if="task.metadata && Object.keys(task.metadata).length > 0">
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
                      <div class="bg-gray-50 rounded-lg p-4">
                        <pre class="text-xs text-gray-700 font-mono whitespace-pre-wrap">{{ JSON.stringify(task.metadata, null, 2) }}</pre>
                      </div>
                    </div>

                    <!-- Activity Log (placeholder) -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Activity</h4>
                      <div class="bg-gray-50 rounded-lg p-4">
                        <div class="space-y-3">
                          <div class="flex items-start space-x-3">
                            <div class="flex-shrink-0">
                              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserIcon class="h-4 w-4 text-blue-600" aria-hidden="true" />
                              </div>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm text-gray-900">
                                Task created by <span class="font-medium">{{ getUserName(task.created_by || '') }}</span>
                              </p>
                              <p class="text-xs text-gray-500">{{ formatDateTime(task.createdAt) }}</p>
                            </div>
                          </div>

                          <div v-if="task.updatedAt && task.updatedAt !== task.createdAt" class="flex items-start space-x-3">
                            <div class="flex-shrink-0">
                              <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <PencilIcon class="h-4 w-4 text-green-600" aria-hidden="true" />
                              </div>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm text-gray-900">Task updated</p>
                              <p class="text-xs text-gray-500">{{ formatDateTime(task.updatedAt) }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Sidebar -->
                  <div class="space-y-6">
                    <!-- Task Details -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-3">Task Details</h4>
                      <dl class="space-y-3">
                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">ID</dt>
                          <dd class="mt-1 text-sm text-gray-900 font-mono">{{ task.id }}</dd>
                        </div>

                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                          <dd class="mt-1">
                            <TaskStatusBadge :status="task.status" />
                          </dd>
                        </div>

                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</dt>
                          <dd class="mt-1">
                            <TaskPriorityBadge :priority="task.priority" />
                          </dd>
                        </div>

                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</dt>
                          <dd class="mt-1 text-sm text-gray-900">
                            {{ task.assigned_to ? getUserName(task.assigned_to) : 'Unassigned' }}
                          </dd>
                        </div>

                        <div v-if="task.due_date">
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</dt>
                          <dd class="mt-1 text-sm text-gray-900">
                            <div class="flex items-center">
                              <CalendarIcon class="h-4 w-4 mr-1.5 text-gray-400" aria-hidden="true" />
                              <span 
                                :class="[
                                  isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-900'
                                ]"
                              >
                                {{ formatDateTime(task.due_date) }}
                              </span>
                            </div>
                            <p v-if="isOverdue" class="text-xs text-red-600 mt-1 font-medium">Overdue</p>
                            <p v-else-if="isDueSoon" class="text-xs text-orange-600 mt-1 font-medium">Due Soon</p>
                          </dd>
                        </div>

                        <div v-if="task.estimated_hours">
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimated Hours</dt>
                          <dd class="mt-1 text-sm text-gray-900">{{ task.estimated_hours }} hours</dd>
                        </div>

                        <div>
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</dt>
                          <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(task.createdAt) }}</dd>
                        </div>

                        <div v-if="task.updatedAt && task.updatedAt !== task.createdAt">
                          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</dt>
                          <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(task.updatedAt) }}</dd>
                        </div>
                      </dl>
                    </div>

                    <!-- Quick Actions -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div class="space-y-2">
                        <button
                          v-if="task.status !== 'completed'"
                          @click="markCompleted"
                          type="button"
                          class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckIcon class="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                          Mark Complete
                        </button>

                        <button
                          v-if="task.status === 'completed'"
                          @click="reopenTask"
                          type="button"
                          class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ArrowUturnLeftIcon class="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                          Reopen Task
                        </button>

                        <button
                          @click="duplicateTask"
                          type="button"
                          class="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DocumentDuplicateIcon class="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                          Duplicate
                        </button>

                        <button
                          @click="deleteTask"
                          type="button"
                          class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon class="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                          Delete Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  XMarkIcon,
  PencilIcon,
  UserIcon,
  CalendarIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import type { Task } from '@/services/api'
import TaskStatusBadge from './TaskStatusBadge.vue'
import TaskPriorityBadge from './TaskPriorityBadge.vue'
import TaskActionsMenu from './TaskActionsMenu.vue'

interface Props {
  open: boolean
  task?: Task | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'edit-task': [task: Task]
  'delete-task': [task: Task]
}>()

// Computed properties
const isOverdue = computed(() => {
  if (!props.task?.due_date || props.task.status === 'completed') return false
  return new Date(props.task.due_date) < new Date()
})

const isDueSoon = computed(() => {
  if (!props.task?.due_date || props.task.status === 'completed' || isOverdue.value) return false
  const dueDate = new Date(props.task.due_date)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 3 && diffDays >= 0
})

// Event handlers
function closeModal() {
  emit('update:open', false)
}

function editTask() {
  if (props.task) {
    emit('edit-task', props.task)
  }
}

function deleteTask() {
  if (props.task) {
    emit('delete-task', props.task)
  }
}

function markCompleted() {
  console.log('Mark completed:', props.task?.id)
  // Would update task status here
}

function reopenTask() {
  console.log('Reopen task:', props.task?.id)
  // Would update task status here
}

function duplicateTask() {
  console.log('Duplicate task:', props.task?.id)
  // Would create duplicate here
}

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

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
