import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest } from '@/services/api'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const currentUser = computed(() => user.value)

  // Actions
  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.login(credentials)
      user.value = response.user
      return response
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    
    try {
      await apiService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      isLoading.value = false
    }
  }

  async function getCurrentUser() {
    if (!apiService.isAuthenticated()) {
      return null
    }

    isLoading.value = true
    error.value = null
    
    try {
      const userData = await apiService.getCurrentUser()
      user.value = userData
      return userData
    } catch (err: any) {
      error.value = err.message || 'Failed to get user data'
      // Clear invalid token
      apiService.clearAuth()
      user.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function initializeAuth() {
    // Check if user is stored in localStorage
    const storedUser = apiService.getStoredUser()
    if (storedUser && apiService.isAuthenticated()) {
      user.value = storedUser
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    currentUser,
    
    // Actions
    login,
    logout,
    getCurrentUser,
    initializeAuth,
    clearError,
  }
})
