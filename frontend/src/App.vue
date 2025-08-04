<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header (only show when authenticated) -->
    <AppHeader v-if="$route.meta.requiresAuth" />
    
    <!-- Main Content -->
    <main :class="{ 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8': $route.meta.requiresAuth }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import { useApiErrorHandler } from '@/composables/useApiErrorHandler'
import { onMounted } from 'vue'
import authStore from '@/stores/authStore'
import { useRouter } from 'vue-router'

const router = useRouter()

// Set up global API error handling
useApiErrorHandler()

// Check authentication on app start
onMounted(async () => {
  // If we have a token but no user info, try to get the user profile
  if (authStore.state.isAuthenticated && !authStore.state.user) {
    try {
      await authStore.getUserProfile()
    } catch (error) {
      // If we can't get the user profile, log the user out
      await authStore.logout()
      router.push({ name: 'Login' })
    }
  }
})
</script>

<style>
/* Global styles are in style.css */
</style>
