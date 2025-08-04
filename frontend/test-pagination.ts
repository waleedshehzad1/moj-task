// Quick test to verify pagination types work correctly
import type { PaginatedTasks } from './src/services/taskService'

// This should compile without errors
const mockResponse: PaginatedTasks = {
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  }
}

console.log('Pagination types are working correctly:', mockResponse.pagination)
