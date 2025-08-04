import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import authStore from '@/stores/authStore'

// Lazy load components
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const TaskList = () => import('@/views/TaskList.vue')
const TaskDetail = () => import('@/views/TaskDetail.vue')
const TaskCreate = () => import('@/views/TaskCreate.vue')
const TaskEdit = () => import('@/views/TaskEdit.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Sign In',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/tasks',
    name: 'TaskList',
    component: TaskList,
    meta: {
      title: 'Tasks',
      requiresAuth: true
    }
  },
  {
    path: '/tasks/create',
    name: 'TaskCreate',
    component: TaskCreate,
    meta: {
      title: 'Create Task',
      requiresAuth: true
    }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: TaskDetail,
    meta: {
      title: 'Task Details',
      requiresAuth: true
    }
  },
  {
    path: '/tasks/:id/edit',
    name: 'TaskEdit',
    component: TaskEdit,
    meta: {
      title: 'Edit Task',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guard for authentication and page titles
router.beforeEach((to, _from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Task Management`
  }
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.state.isAuthenticated
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not authenticated
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated) {
    // Redirect to dashboard if user is already authenticated and tries to access login
    next({ name: 'Dashboard' })
  } else {
    // Proceed as normal
    next()
  }
})

export default router
