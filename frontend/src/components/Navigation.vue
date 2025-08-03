<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center logo-container">
            <div class="mr-3">
              <img src="/src/assets/logo.svg" alt="Bilafya Logo" class="w-10 h-10 sm:w-12 sm:h-12 logo-img" />
            </div>
            <span class="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">Bilafya</span>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-8">
            <a href="#features" class="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" class="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">How It Works</a>
            <a href="#pricing" class="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
          </div>
        </div>

        <!-- Desktop CTA Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <button class="btn-ghost">Sign In</button>
          <button class="btn-primary">Get Started</button>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 p-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="isMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <a href="#features" class="text-gray-600 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors">Features</a>
          <a href="#how-it-works" class="text-gray-600 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors">How It Works</a>
          <a href="#pricing" class="text-gray-600 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors">Pricing</a>
          <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="flex flex-col space-y-3">
              <button class="btn-ghost w-full text-left">Sign In</button>
              <button class="btn-primary w-full">Get Started</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Navigation',
  setup() {
    const isMenuOpen = ref(false)

    return {
      isMenuOpen
    }
  }
}
</script>
