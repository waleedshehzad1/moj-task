<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navigation from './components/layout/Navigation.vue'
import { Toaster } from 'vue-sonner'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initializeAuth()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <Navigation v-if="authStore.isAuthenticated" />
    
    <!-- Main Content -->
    <main :class="{ 'pt-16': authStore.isAuthenticated }">
      <RouterView />
    </main>
    
    <!-- Toast Notifications -->
    <Toaster 
      position="top-right" 
      :duration="4000"
      rich-colors
    />
  </div>
</template>

<style scoped>
/* Additional app-level styles can go here */
</style>
