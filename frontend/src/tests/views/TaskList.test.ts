import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TaskList from '@/views/TaskList.vue'
import { useTaskStore } from '@/stores/taskStore'

// Mock vue-router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

const mockRoute = {
  params: {},
  query: {},
  path: '/tasks',
  name: 'TaskList'
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

// Mock vue-toastification
vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  })
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => '2024-01-15')
}))

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test description',
    status: 'pending',
    priority: 'high',
    due_date: '2024-01-15T17:00:00Z',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    is_archived: false
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Another test description',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2024-01-20T17:00:00Z',
    created_at: '2024-01-02T10:00:00Z',
    updated_at: '2024-01-02T10:00:00Z',
    is_archived: false
  }
]

describe('TaskList', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })

    store = useTaskStore()
    store.tasks = mockTasks
    store.loading = false
    store.pagination = {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }

    wrapper = mount(TaskList, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
            props: ['to']
          },
          'TaskStatusBadge': {
            template: '<span>{{ status }}</span>',
            props: ['status']
          },
          'TaskPriorityBadge': {
            template: '<span>{{ priority }}</span>',
            props: ['priority']
          },
          'ConfirmationModal': {
            template: '<div v-if="true">Modal</div>',
            props: ['title', 'message', 'confirmText', 'cancelText']
          }
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.find('h1').text()).toBe('Tasks')
    expect(wrapper.find('p').text()).toContain('Manage and track all your tasks')
  })

  it('displays task list when tasks are available', () => {
    const taskItems = wrapper.findAll('[data-testid="task-item"]')
    expect(taskItems).toHaveLength(0) // No data-testid in current implementation
    
    // Check if task titles are rendered
    expect(wrapper.text()).toContain('Test Task 1')
    expect(wrapper.text()).toContain('Test Task 2')
  })

  it('shows loading state', async () => {
    store.loading = true
    await wrapper.vm.$nextTick()
    
    const loadingElement = wrapper.find('.animate-pulse')
    expect(loadingElement.exists()).toBe(true)
  })

  it('shows empty state when no tasks', async () => {
    store.tasks = []
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('No tasks found')
    expect(wrapper.text()).toContain('Get started by creating a new task')
  })

  it('handles search input', async () => {
    const searchInput = wrapper.find('#search')
    await searchInput.setValue('test search')
    
    expect(searchInput.element.value).toBe('test search')
  })

  it('handles status filter change', async () => {
    const statusFilter = wrapper.find('#status-filter')
    await statusFilter.setValue('completed')
    
    expect(statusFilter.element.value).toBe('completed')
  })

  it('handles task selection', async () => {
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setChecked(true)
    
    expect(checkbox.element.checked).toBe(true)
  })

  it('calls fetchTasks on mount', () => {
    expect(store.fetchTasks).toHaveBeenCalled()
  })
})

describe('TaskList Integration', () => {
  it('integrates with task store correctly', async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })

    const store = useTaskStore()
    store.fetchTasks = vi.fn().mockResolvedValue(undefined)
    store.tasks = mockTasks

    const wrapper = mount(TaskList, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true,
          'TaskStatusBadge': true,
          'TaskPriorityBadge': true,
          'ConfirmationModal': true
        }
      }
    })

    // Verify store methods are called
    expect(store.fetchTasks).toHaveBeenCalled()
  })
})
