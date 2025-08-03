import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle errors with console logging and optional toast notifications
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      console.error('Authentication failed')
      // Dispatch custom event for authentication failure that components can listen to
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: 'Authentication failed. Please login again.' 
      }))
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data)
      window.dispatchEvent(new CustomEvent('api-error', { 
        detail: 'Server error. Please try again later.' 
      }))
    } else if (error.response?.data?.message) {
      console.error('API error:', error.response.data.message)
      window.dispatchEvent(new CustomEvent('api-error', { 
        detail: error.response.data.message 
      }))
    } else {
      console.error('Unexpected error:', error)
      window.dispatchEvent(new CustomEvent('api-error', { 
        detail: 'An unexpected error occurred.' 
      }))
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
