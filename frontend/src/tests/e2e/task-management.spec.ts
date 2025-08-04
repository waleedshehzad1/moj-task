import { test, expect } from '@playwright/test'

test.describe('Task Management App', () => {
  test.beforeEach(async ({ page }) => {
    // Visit the app
    await page.goto('http://localhost:3001')
  })

  test('should display dashboard with stats', async ({ page }) => {
    // Check if dashboard is loaded
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Check if stats cards are visible
    await expect(page.locator('[data-testid="stats-card"]')).toBeVisible()
  })

  test('should navigate to tasks page', async ({ page }) => {
    // Click on tasks link
    await page.click('a[href="/tasks"]')
    
    // Verify navigation
    await expect(page).toHaveURL('/tasks')
    await expect(page.locator('h1')).toContainText('Tasks')
  })

  test('should create a new task', async ({ page }) => {
    // Navigate to create task page
    await page.goto('/tasks/create')
    
    // Fill out the form
    await page.fill('#title', 'Test Task')
    await page.fill('#description', 'This is a test task description')
    await page.selectOption('#status', 'pending')
    await page.selectOption('#priority', 'high')
    
    // Set due date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dueDateString = tomorrow.toISOString().slice(0, 16)
    await page.fill('#due_date', dueDateString)
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Verify success (assuming redirect to task detail)
    await expect(page).toHaveURL(/\/tasks\/[\w-]+/)
    await expect(page.locator('h1')).toContainText('Test Task')
  })

  test('should filter tasks by status', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/tasks')
    
    // Select pending status filter
    await page.selectOption('#status-filter', 'pending')
    
    // Wait for filter to apply
    await page.waitForTimeout(1000)
    
    // Verify filter is applied (check URL or content)
    // This would depend on how your app implements filtering
  })

  test('should search for tasks', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/tasks')
    
    // Enter search term
    await page.fill('#search', 'test')
    
    // Wait for search to apply
    await page.waitForTimeout(1000)
    
    // Verify search results
    // This would depend on your search implementation
  })

  test('should update task status', async ({ page }) => {
    // Navigate to a specific task (you might need to create one first)
    await page.goto('/tasks/1') // Assuming task with ID 1 exists
    
    // Click on status update button
    await page.click('button:has-text("Mark Complete")')
    
    // Verify status is updated
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Completed')
  })

  test('should delete a task', async ({ page }) => {
    // Navigate to a specific task
    await page.goto('/tasks/1')
    
    // Click delete button
    await page.click('button:has-text("Delete")')
    
    // Confirm deletion in modal
    await page.click('button:has-text("Delete")') // Confirmation modal
    
    // Verify redirect to tasks list
    await expect(page).toHaveURL('/tasks')
  })

  test('should handle form validation', async ({ page }) => {
    // Navigate to create task page
    await page.goto('/tasks/create')
    
    // Try to submit without required fields
    await page.click('button[type="submit"]')
    
    // Verify validation errors are shown
    await expect(page.locator('.text-red-600')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to dashboard
    await page.goto('/')
    
    // Check if mobile navigation works
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and return errors
    await page.route('**/api/v1/tasks', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    // Navigate to tasks page
    await page.goto('/tasks')
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should persist data across page refreshes', async ({ page }) => {
    // Create a task
    await page.goto('/tasks/create')
    await page.fill('#title', 'Persistent Task')
    await page.fill('#description', 'This task should persist')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dueDateString = tomorrow.toISOString().slice(0, 16)
    await page.fill('#due_date', dueDateString)
    
    await page.click('button[type="submit"]')
    
    // Refresh the page
    await page.reload()
    
    // Verify task still exists
    await expect(page.locator('h1')).toContainText('Persistent Task')
  })
})
