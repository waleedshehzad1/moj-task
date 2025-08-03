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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
              <div>
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    {{ mode === 'create' ? 'Create New Task' : 'Edit Task' }}
                  </DialogTitle>
                  <button
                    @click="closeModal"
                    type="button"
                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span class="sr-only">Close</span>
                    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="space-y-6">
                  <!-- Title -->
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">
                      Title <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      v-model="form.title"
                      type="text"
                      required
                      maxlength="255"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter task title..."
                    />
                    <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
                  </div>

                  <!-- Description -->
                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">
                      Description <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      v-model="form.description"
                      rows="4"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter task description..."
                    />
                    <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
                  </div>

                  <!-- Status and Priority -->
                  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        id="status"
                        v-model="form.status"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        id="priority"
                        v-model="form.priority"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <!-- Assignee and Due Date -->
                  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label for="assigned_to" class="block text-sm font-medium text-gray-700">Assign To</label>
                      <select
                        id="assigned_to"
                        v-model="form.assigned_to"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Unassigned</option>
                        <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                          {{ user.first_name }} {{ user.last_name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label for="due_date" class="block text-sm font-medium text-gray-700">Due Date</label>
                      <input
                        id="due_date"
                        v-model="form.due_date"
                        type="datetime-local"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <!-- Estimated Hours -->
                  <div>
                    <label for="estimated_hours" class="block text-sm font-medium text-gray-700">Estimated Hours</label>
                    <input
                      id="estimated_hours"
                      v-model.number="form.estimated_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter estimated hours..."
                    />
                  </div>

                  <!-- Metadata (optional) -->
                  <div>
                    <label for="metadata" class="block text-sm font-medium text-gray-700">Additional Information (JSON)</label>
                    <textarea
                      id="metadata"
                      v-model="metadataText"
                      rows="3"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                      placeholder='{"key": "value"}'
                    />
                    <p v-if="errors.metadata" class="mt-1 text-sm text-red-600">{{ errors.metadata }}</p>
                    <p class="mt-1 text-xs text-gray-500">Optional JSON object for additional task metadata</p>
                  </div>

                  <!-- Form Actions -->
                  <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      @click="closeModal"
                      type="button"
                      class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ mode === 'create' ? 'Create Task' : 'Update Task' }}
                    </button>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { apiService } from '@/services/api'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Task, CreateTaskRequest, UpdateTaskRequest, User } from '@/services/api'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'task-saved': [task: Task]
}>()

const taskStore = useTaskStore()

// Form state
const form = reactive<CreateTaskRequest & { assigned_to?: string }>({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  assigned_to: '',
  due_date: '',
  estimated_hours: undefined,
  metadata: {},
})

const metadataText = ref('')
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const availableUsers = ref<User[]>([])

// Computed
const isEditMode = computed(() => props.mode === 'edit')

// Watchers
watch(() => props.open, (newValue) => {
  if (newValue) {
    resetForm()
    loadUsers()
    if (isEditMode.value && props.task) {
      populateForm(props.task)
    }
  }
})

watch(() => props.task, (newTask) => {
  if (newTask && isEditMode.value && props.open) {
    populateForm(newTask)
  }
})

// Methods
function resetForm() {
  Object.assign(form, {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    estimated_hours: undefined,
    metadata: {},
  })
  metadataText.value = ''
  errors.value = {}
  isSubmitting.value = false
}

function populateForm(task: Task) {
  Object.assign(form, {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigned_to: task.assigned_to || '',
    due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
    estimated_hours: task.estimated_hours,
    metadata: task.metadata || {},
  })
  metadataText.value = task.metadata ? JSON.stringify(task.metadata, null, 2) : ''
}

async function loadUsers() {
  try {
    availableUsers.value = await apiService.getUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

function validateForm(): boolean {
  errors.value = {}
  
  if (!form.title.trim()) {
    errors.value.title = 'Title is required'
  }
  
  if (!form.description.trim()) {
    errors.value.description = 'Description is required'
  }
  
  if (metadataText.value.trim()) {
    try {
      JSON.parse(metadataText.value)
    } catch (e) {
      errors.value.metadata = 'Invalid JSON format'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Parse metadata
    let metadata = {}
    if (metadataText.value.trim()) {
      metadata = JSON.parse(metadataText.value)
    }
    
    const taskData = {
      ...form,
      metadata,
      due_date: form.due_date || undefined,
      assigned_to: form.assigned_to || undefined,
    }
    
    let savedTask: Task
    
    if (isEditMode.value && props.task) {
      savedTask = await taskStore.updateTask(props.task.id, taskData as UpdateTaskRequest)
    } else {
      savedTask = await taskStore.createTask(taskData as CreateTaskRequest)
    }
    
    emit('task-saved', savedTask)
    closeModal()
  } catch (error: any) {
    console.error('Failed to save task:', error)
    errors.value.general = error.message || 'Failed to save task'
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  emit('update:open', false)
}

// Initialize
onMounted(() => {
  loadUsers()
})
</script>
