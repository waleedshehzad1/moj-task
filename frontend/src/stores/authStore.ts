import { reactive, readonly } from 'vue'
import apiClient from '@/services/api'

interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  department?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Initial state
const state = reactive<AuthState>({
  user: null,
  token: localStorage.getItem('authToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isLoading: false,
  error: null
})

// Actions
const actions = {
  async login(email: string, password: string): Promise<boolean> {
    try {
      state.isLoading = true
      state.error = null
      
      const response = await apiClient.post('/api/v1/auth/login', { email, password })
      const { user, tokens } = response.data.data
      
      // Store authentication data
      state.user = user
      state.token = tokens.accessToken
      state.refreshToken = tokens.refreshToken
      state.isAuthenticated = true
      
      // Save to localStorage
      localStorage.setItem('authToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      
      return true
    } catch (error: any) {
      state.error = error.response?.data?.message || 'Authentication failed'
      return false
    } finally {
      state.isLoading = false
    }
  },
  
  async logout(): Promise<void> {
    try {
      state.isLoading = true
      // Call logout API if token exists
      if (state.token) {
        await apiClient.post('/api/v1/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear auth state regardless of API call result
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      
      // Remove from localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      state.isLoading = false
    }
  },
  
  async refreshAccessToken(): Promise<boolean> {
    if (!state.refreshToken) return false
    
    try {
      state.isLoading = true
      const response = await apiClient.post('/api/v1/auth/refresh', {
        refreshToken: state.refreshToken
      })
      
      const { tokens } = response.data.data
      
      // Update tokens
      state.token = tokens.accessToken
      state.refreshToken = tokens.refreshToken
      
      // Save to localStorage
      localStorage.setItem('authToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      
      return true
    } catch (error) {
      // If refresh fails, logout
      await actions.logout()
      return false
    } finally {
      state.isLoading = false
    }
  },
  
  async getUserProfile(): Promise<void> {
    if (!state.token) return
    
    try {
      state.isLoading = true
      const response = await apiClient.get('/api/v1/auth/profile')
      state.user = response.data.data.user
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error)
      // If 401, logout
      if (error.response?.status === 401) {
        await actions.logout()
      }
    } finally {
      state.isLoading = false
    }
  },
  
  clearError() {
    state.error = null
  }
}

// Create the auth store
export default {
  state: readonly(state),
  ...actions
}
