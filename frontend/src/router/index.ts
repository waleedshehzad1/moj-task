import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Lazy load components
const Dashboard = () => import('@/views/Dashboard.vue')
const TaskList = () => import('@/views/TaskList.vue')
const TaskDetail = () => import('@/views/TaskDetail.vue')
const TaskCreate = () => import('@/views/TaskCreate.vue')
const TaskEdit = () => import('@/views/TaskEdit.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/tasks',
    name: 'TaskList',
    component: TaskList,
    meta: {
      title: 'Tasks'
    }
  },
  {
    path: '/tasks/create',
    name: 'TaskCreate',
    component: TaskCreate,
    meta: {
      title: 'Create Task'
    }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: TaskDetail,
    meta: {
      title: 'Task Details'
    }
  },
  {
    path: '/tasks/:id/edit',
    name: 'TaskEdit',
    component: TaskEdit,
    meta: {
      title: 'Edit Task'
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

// Global navigation guard for setting page titles
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Task Management`
  }
  next()
})

export default router
