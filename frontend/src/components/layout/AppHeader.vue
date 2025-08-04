<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo and Title -->
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img 
              src="/src/assets/hmcts-logo.png" 
              alt="HMCTS Logo" 
              class="h-10 w-auto"
            />
          </div>
          <div class="ml-4">
            <div class="flex flex-col">
              <h1 class="text-lg font-semibold text-gray-900 leading-tight">
                HM Courts & Tribunals Service
              </h1>
              <span class="text-sm text-gray-600 font-medium">
                Task Management System
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav v-if="authStore.state.isAuthenticated" class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': route.name === 'Dashboard' }"
          >
            Dashboard
          </router-link>
          <router-link
            to="/tasks"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': route.name === 'TaskList' }"
          >
            Tasks
          </router-link>
          <router-link
            to="/tasks/create"
            class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Create Task
          </router-link>
        </nav>
        
        <!-- User Menu -->
        <div v-if="authStore.state.isAuthenticated" class="hidden md:flex items-center ml-4">
          <div class="relative" ref="userMenuContainer">
            <button 
              @click="toggleUserMenu"
              class="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100"
            >
              <div class="text-right mr-2">
                <p class="text-sm font-medium text-gray-700 truncate">
                  {{ authStore.state.user?.first_name }} {{ authStore.state.user?.last_name }}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {{ authStore.state.user?.role }}
                </p>
              </div>
              <div class="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-medium">
                {{ userInitials }}
              </div>
            </button>
            
            <!-- Dropdown menu -->
            <div v-show="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button 
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
          >
            <span class="sr-only">Open main menu</span>
            <svg v-if="!mobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-show="mobileMenuOpen" class="md:hidden">
      <div v-if="authStore.state.isAuthenticated" class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
        <router-link
          to="/"
          @click="mobileMenuOpen = false"
          class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          :class="{ 'text-blue-600 bg-blue-50': route.name === 'Dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          to="/tasks"
          @click="mobileMenuOpen = false"
          class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          :class="{ 'text-blue-600 bg-blue-50': route.name === 'TaskList' }"
        >
          Tasks
        </router-link>
        <router-link
          to="/tasks/create"
          @click="mobileMenuOpen = false"
          class="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
        >
          Create Task
        </router-link>
        
        <!-- Mobile user profile and logout -->
        <div class="border-t border-gray-200 mt-3 pt-3">
          <div class="flex items-center px-3 py-2">
            <div class="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
              {{ userInitials }}
            </div>
            <div class="ml-3">
              <p class="text-base font-medium text-gray-700">
                {{ authStore.state.user?.first_name }} {{ authStore.state.user?.last_name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ authStore.state.user?.role }}
              </p>
            </div>
          </div>
          <button 
            @click="handleLogout" 
            class="mt-2 w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authStore from '@/stores/authStore'

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuContainer = ref<HTMLElement | null>(null)
const route = useRoute()
const router = useRouter()

// Compute user initials for avatar
const userInitials = computed(() => {
  if (!authStore.state.user) return '?'
  const firstName = authStore.state.user.first_name || ''
  const lastName = authStore.state.user.last_name || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
})

// Toggle user dropdown menu
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

// Handle click outside to close user menu
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuContainer.value && (userMenuContainer.value as HTMLElement).contains(event.target as Node)) {
    return
  }
  userMenuOpen.value = false
}

// Handle logout
const handleLogout = async () => {
  await authStore.logout()
  userMenuOpen.value = false
  mobileMenuOpen.value = false
  router.push({ name: 'Login' })
}

// Add and remove click outside event listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Load user profile if authenticated
  if (authStore.state.isAuthenticated && !authStore.state.user) {
    authStore.getUserProfile()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
