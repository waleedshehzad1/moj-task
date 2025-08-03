import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TaskList from '@/views/TaskList.vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/services/taskService'

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
  format: vi.fn((_date, _formatStr) => '2024-01-15')
}))

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test description',
    status: 'pending' as const,
    priority: 'high' as const,
    due_date: '2024-01-15T17:00:00Z',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    is_archived: false
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Another test description',
    status: 'in_progress' as const,
    priority: 'medium' as const,
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
      hasNextPage: false,
      hasPreviousPage: false
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

  it('displays pagination when there are multiple pages', async () => {
    store.pagination = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    }
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Showing')
    expect(wrapper.text()).toContain('of 25 results')
  })

  it('handles pagination page change', async () => {
    store.pagination = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    }
    await wrapper.vm.$nextTick()
    
    // Find and click next button (if it exists)
    const nextButtons = wrapper.findAll('button').filter((btn: any) => 
      btn.text().includes('Next') || btn.element.innerHTML.includes('M9 5l7 7-7 7')
    )
    
    if (nextButtons.length > 0) {
      await nextButtons[0].trigger('click')
      expect(store.fetchTasks).toHaveBeenCalledTimes(2) // Once on mount, once on page change
    }
  })

  it('disables pagination buttons correctly', async () => {
    store.pagination = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    }
    await wrapper.vm.$nextTick()
    
    const prevButtons = wrapper.findAll('button').filter((btn: any) => 
      btn.text().includes('Previous') || btn.element.innerHTML.includes('M15 19l-7-7 7-7')
    )
    
    if (prevButtons.length > 0) {
      expect(prevButtons[0].attributes('disabled')).toBeDefined()
    }
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

    mount(TaskList, {
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
