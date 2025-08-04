import { onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'

export function useApiErrorHandler() {
  const toast = useToast()

  const handleAuthError = (event: CustomEvent) => {
    toast.error(event.detail)
    // You can add additional auth error handling here
    // For example, redirect to login page
  }

  const handleApiError = (event: CustomEvent) => {
    toast.error(event.detail)
  }

  onMounted(() => {
    window.addEventListener('auth-error', handleAuthError as EventListener)
    window.addEventListener('api-error', handleApiError as EventListener)
  })

  onUnmounted(() => {
    window.removeEventListener('auth-error', handleAuthError as EventListener)
    window.removeEventListener('api-error', handleApiError as EventListener)
  })

  return {
    // Expose functions if needed for manual error handling
    handleAuthError,
    handleApiError
  }
}
