<template>
  <div class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-12 w-auto" src="@/assets/hmcts-logo.png" alt="HMCTS Logo" />
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Task Management System
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Sign in to your account
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div v-if="authStore.state.error" class="bg-red-50 border border-red-400 text-red-700 p-3 rounded mb-4">
            {{ authStore.state.error }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                :class="{ 'border-red-500': validationErrors.email }"
              />
              <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">{{ validationErrors.email }}</p>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                :class="{ 'border-red-500': validationErrors.password }"
              />
              <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600">{{ validationErrors.password }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.state.isLoading"
              class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                v-if="authStore.state.isLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ authStore.state.isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-2 text-gray-500">Test users</span>
            </div>
          </div>
          
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <button
              @click="fillTestUser('admin@hmcts.gov.uk', 'Admin123!@#')"
              class="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Admin User
            </button>
            <button
              @click="fillTestUser('manager@hmcts.gov.uk', 'Manager123!@#')"
              class="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Manager User
            </button>
            <button
              @click="fillTestUser('caseworker1@hmcts.gov.uk', 'Caseworker123!@#')"
              class="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Caseworker User
            </button>
            <button
              @click="fillTestUser('viewer@hmcts.gov.uk', 'Viewer123!@#')"
              class="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Viewer User
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authStore from '@/stores/authStore'

// Component state
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const validationErrors = reactive<{
  email?: string
  password?: string
}>({})

const router = useRouter()

// Methods
const validateForm = (): boolean => {
  validationErrors.email = ''
  validationErrors.password = ''
  let isValid = true

  // Email validation
  if (!email.value) {
    validationErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    validationErrors.email = 'Email format is invalid'
    isValid = false
  }

  // Password validation
  if (!password.value) {
    validationErrors.password = 'Password is required'
    isValid = false
  } else if (password.value.length < 8) {
    validationErrors.password = 'Password must be at least 8 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  // Clear previous errors
  authStore.clearError()
  
  // Validate form
  if (!validateForm()) return
  
  // Attempt login
  const success = await authStore.login(email.value, password.value)
  
  if (success) {
    router.push({ name: 'Dashboard' })
  }
}

// Helper function to fill test user credentials
const fillTestUser = (testEmail: string, testPassword: string) => {
  email.value = testEmail
  password.value = testPassword
}
</script>
