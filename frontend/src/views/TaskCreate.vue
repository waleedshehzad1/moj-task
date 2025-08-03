<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white shadow rounded-lg p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit ? 'Edit Task' : 'Create New Task' }}
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ isEdit ? 'Update task information' : 'Fill in the details to create a new task' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="space-y-6">
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
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': errors.title }"
            placeholder="Enter task title"
          />
          <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': errors.description }"
            placeholder="Enter task description (optional)"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
        </div>

        <!-- Status and Priority Row -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.status }"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
          </div>

          <!-- Priority -->
          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              v-model="form.priority"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.priority }"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <p v-if="errors.priority" class="mt-1 text-sm text-red-600">{{ errors.priority }}</p>
          </div>
        </div>

        <!-- Due Date and Assigned To Row -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Due Date -->
          <div>
            <label for="due_date" class="block text-sm font-medium text-gray-700">
              Due Date <span class="text-red-500">*</span>
            </label>
            <input
              id="due_date"
              v-model="form.due_date"
              type="datetime-local"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.due_date }"
            />
            <p v-if="errors.due_date" class="mt-1 text-sm text-red-600">{{ errors.due_date }}</p>
          </div>

          <!-- Assigned To -->
          <div>
            <label for="assigned_to" class="block text-sm font-medium text-gray-700">
              Assigned To
            </label>
            <input
              id="assigned_to"
              v-model="form.assigned_to"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.assigned_to }"
              placeholder="Enter assignee name or email"
            />
            <p v-if="errors.assigned_to" class="mt-1 text-sm text-red-600">{{ errors.assigned_to }}</p>
          </div>
        </div>

        <!-- Estimated Hours -->
        <div>
          <label for="estimated_hours" class="block text-sm font-medium text-gray-700">
            Estimated Hours
          </label>
          <input
            id="estimated_hours"
            v-model.number="form.estimated_hours"
            type="number"
            min="0"
            step="0.5"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': errors.estimated_hours }"
            placeholder="0"
          />
          <p v-if="errors.estimated_hours" class="mt-1 text-sm text-red-600">{{ errors.estimated_hours }}</p>
        </div>

        <!-- Tags -->
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <div class="mt-1">
            <input
              v-model="tagInput"
              type="text"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add tags (press Enter to add)"
              @keydown.enter.prevent="addTag"
            />
            <div v-if="form.tags && form.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-500">Press Enter to add a tag</p>
        </div>

        <!-- Metadata -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <div class="space-y-3">
            <div
              v-for="(meta, index) in metadataFields"
              :key="index"
              class="grid grid-cols-5 gap-2"
            >
              <input
                v-model="meta.key"
                type="text"
                placeholder="Key"
                class="col-span-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                v-model="meta.value"
                type="text"
                placeholder="Value"
                class="col-span-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                @click="removeMetadata(index)"
                class="text-red-600 hover:text-red-800"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              @click="addMetadata"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Field
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <router-link
            :to="isEdit ? `/tasks/${taskId}` : '/tasks'"
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useTaskStore } from '@/stores/taskStore'
import type { TaskInput } from '@/services/taskService'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const taskStore = useTaskStore()

// Reactive data
const form = reactive<TaskInput>({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: '',
  assigned_to: '',
  estimated_hours: undefined,
  tags: [],
  metadata: {}
})

const errors = reactive<Record<string, string>>({})
const tagInput = ref('')
const metadataFields = ref<Array<{ key: string; value: string }>>([])

// Computed properties
const isEdit = computed(() => route.name === 'TaskEdit')
const taskId = computed(() => route.params.id as string)
const loading = computed(() => taskStore.loading)

const isFormValid = computed(() => {
  return form.title.trim().length > 0 && form.due_date.length > 0
})

// Methods
const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])

  // Title validation
  if (!form.title.trim()) {
    errors.title = 'Title is required'
  } else if (form.title.length > 255) {
    errors.title = 'Title must be less than 255 characters'
  }

  // Due date validation
  if (!form.due_date) {
    errors.due_date = 'Due date is required'
  } else if (new Date(form.due_date) < new Date()) {
    errors.due_date = 'Due date cannot be in the past'
  }

  // Estimated hours validation
  if (form.estimated_hours !== undefined && form.estimated_hours < 0) {
    errors.estimated_hours = 'Estimated hours must be a positive number'
  }

  return Object.keys(errors).length === 0
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags?.includes(tag)) {
    if (!form.tags) form.tags = []
    form.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  if (form.tags) {
    form.tags.splice(index, 1)
  }
}

const addMetadata = () => {
  metadataFields.value.push({ key: '', value: '' })
}

const removeMetadata = (index: number) => {
  metadataFields.value.splice(index, 1)
}

const buildMetadata = () => {
  const metadata: Record<string, any> = {}
  metadataFields.value.forEach(field => {
    if (field.key.trim() && field.value.trim()) {
      metadata[field.key.trim()] = field.value.trim()
    }
  })
  return Object.keys(metadata).length > 0 ? metadata : undefined
}

const submitForm = async () => {
  if (!validateForm()) {
    toast.error('Please fix the form errors')
    return
  }

  try {
    // Build metadata from fields
    form.metadata = buildMetadata()

    if (isEdit.value) {
      await taskStore.updateTask(taskId.value, form)
      toast.success('Task updated successfully')
      router.push(`/tasks/${taskId.value}`)
    } else {
      const newTask = await taskStore.createTask(form)
      toast.success('Task created successfully')
      router.push(`/tasks/${newTask.id}`)
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to save task')
  }
}

const loadTask = async () => {
  if (!isEdit.value) return

  try {
    const task = await taskStore.fetchTask(taskId.value)
    if (task) {
      // Populate form with task data
      form.title = task.title
      form.description = task.description || ''
      form.status = task.status
      form.priority = task.priority
      form.due_date = task.due_date.slice(0, 16) // Format for datetime-local input
      form.assigned_to = task.assigned_to || ''
      form.estimated_hours = task.estimated_hours
      form.tags = task.tags ? [...task.tags] : []
      
      // Convert metadata to fields
      if (task.metadata) {
        metadataFields.value = Object.entries(task.metadata).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      }
    }
  } catch (error) {
    toast.error('Failed to load task')
    router.push('/tasks')
  }
}

// Set default due date to tomorrow
const setDefaultDueDate = () => {
  if (!isEdit.value && !form.due_date) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(17, 0, 0, 0) // 5 PM
    form.due_date = tomorrow.toISOString().slice(0, 16)
  }
}

// Lifecycle
onMounted(async () => {
  await loadTask()
  setDefaultDueDate()
})
</script>
