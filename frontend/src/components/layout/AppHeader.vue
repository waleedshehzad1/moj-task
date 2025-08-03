<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Title -->
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
              <span class="text-white font-bold text-sm">H</span>
            </div>
          </div>
          <div class="ml-4">
            <h1 class="text-xl font-semibold text-gray-900">
              Task Management
            </h1>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': route.name === 'Dashboard' }"
          >
            Dashboard
          </router-link>
          <router-link
            to="/tasks"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': route.name === 'TaskList' }"
          >
            Tasks
          </router-link>
          <router-link
            to="/tasks/create"
            class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Create Task
          </router-link>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
          >
            <span class="sr-only">Open main menu</span>
            <svg v-if="!mobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-show="mobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
        <router-link
          to="/"
          @click="mobileMenuOpen = false"
          class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          :class="{ 'text-blue-600 bg-blue-50': route.name === 'Dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          to="/tasks"
          @click="mobileMenuOpen = false"
          class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          :class="{ 'text-blue-600 bg-blue-50': route.name === 'TaskList' }"
        >
          Tasks
        </router-link>
        <router-link
          to="/tasks/create"
          @click="mobileMenuOpen = false"
          class="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
        >
          Create Task
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const mobileMenuOpen = ref(false)
const route = useRoute()
</script>
