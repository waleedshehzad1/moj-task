<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
]

// Computed property for user display name
const userDisplayName = computed(() => {
  if (!authStore.currentUser) return ''
  
  const { first_name, last_name, username } = authStore.currentUser
  
  if (first_name && last_name) {
    return `${first_name} ${last_name}`
  }
  
  return username
})

async function handleLogout() {
  try {
    await authStore.logout()
    toast.success('Logged out successfully')
    router.push('/login')
  } catch (error) {
    toast.error('Failed to logout')
  }
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and primary nav -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-gray-900">
              HMCTS Task Manager
            </h1>
          </div>
          
          <!-- Desktop navigation -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              :class="$route.path === item.href 
                ? 'border-primary-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
            >
              <component :is="item.icon" class="w-4 h-4 mr-2" />
              {{ item.name }}
            </router-link>
          </div>
        </div>

        <!-- User menu -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
          <!-- User info -->
          <div class="flex items-center space-x-2 text-sm text-gray-700">
            <UserIcon class="w-5 h-5" />
            <span>{{ userDisplayName }}</span>
          </div>
          
          <!-- Logout button -->
          <button
            @click="handleLogout"
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            aria-controls="mobile-menu"
            :aria-expanded="isMobileMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!isMobileMenuOpen" class="block h-6 w-6" />
            <XMarkIcon v-else class="block h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-show="isMobileMenuOpen" class="sm:hidden" id="mobile-menu">
      <div class="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          @click="closeMobileMenu"
          class="flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
          :class="$route.path === item.href
            ? 'bg-primary-50 border-primary-500 text-primary-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </div>
      
      <!-- Mobile user menu -->
      <div class="pt-4 pb-3 border-t border-gray-200">
        <div class="flex items-center px-4">
          <div class="flex-shrink-0">
            <UserIcon class="h-10 w-10 text-gray-400" />
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-gray-800">
              {{ userDisplayName }}
            </div>
            <div class="text-sm font-medium text-gray-500">
              {{ authStore.currentUser?.email }}
            </div>
          </div>
        </div>
        <div class="mt-3 space-y-1">
          <button
            @click="handleLogout"
            class="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
