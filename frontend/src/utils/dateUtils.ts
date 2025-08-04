import { format } from 'date-fns'

/**
 * Safely formats a date string to a readable format
 * @param date - The date string to format
 * @param formatString - The format string for date-fns (default: 'MMM dd, yyyy')
 * @param fallback - The fallback text when date is invalid or null (default: 'No due date')
 * @returns Formatted date string or fallback text
 */
export const formatDate = (
  date: string | null | undefined, 
  formatString: string = 'MMM dd, yyyy',
  fallback: string = 'No due date'
): string => {
  if (!date) {
    return fallback
  }
  
  const parsedDate = new Date(date)
  
  // Check if the date is valid
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }
  
  return format(parsedDate, formatString)
}

/**
 * Safely formats a date string to a readable date and time format
 * @param date - The date string to format
 * @param fallback - The fallback text when date is invalid or null (default: 'N/A')
 * @returns Formatted date and time string or fallback text
 */
export const formatDateTime = (
  date: string | null | undefined,
  fallback: string = 'N/A'
): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm', fallback)
}

/**
 * Checks if a task is overdue based on its due date and status
 * @param task - The task object with due_date and status properties
 * @returns true if the task is overdue, false otherwise
 */
export const isTaskOverdue = (task: { due_date?: string | null; status?: string }): boolean => {
  if (!task.due_date) {
    return false
  }
  
  const dueDate = new Date(task.due_date)
  
  // Check if the date is valid
  if (isNaN(dueDate.getTime())) {
    return false
  }
  
  return dueDate < new Date() && 
         task.status !== 'completed' && 
         task.status !== 'cancelled'
}

/**
 * Validates if a date string is valid
 * @param date - The date string to validate
 * @returns true if valid, false otherwise
 */
export const isValidDate = (date: string | null | undefined): boolean => {
  if (!date) return false
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}
