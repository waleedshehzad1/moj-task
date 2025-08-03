<template>
  <section id="pricing" class="py-16 lg:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl font-display">
          Choose Your Plan
        </h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Flexible pricing options to fit your lifestyle. All plans include fresh ingredients, chef-prepared meals, and fast delivery.
        </p>
      </div>

      <!-- Pricing Toggle -->
      <div class="flex justify-center mb-12">
        <div class="bg-gray-100 rounded-lg p-1 flex">
          <button 
            @click="isSubscription = true"
            :class="[
              'px-6 py-2 rounded-md text-sm font-medium transition-all',
              isSubscription 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Subscription Plans
          </button>
          <button 
            @click="isSubscription = false"
            :class="[
              'px-6 py-2 rounded-md text-sm font-medium transition-all',
              !isSubscription 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            One-Time Orders
          </button>
        </div>
      </div>

      <!-- Subscription Plans -->
      <div v-if="isSubscription" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Basic Plan -->
        <div class="bg-white border border-gray-200 rounded-2xl p-8 relative">
          <div class="text-center">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Basic</h3>
            <p class="text-gray-600 mb-6">Perfect for individuals</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900">SR 89</span>
              <span class="text-gray-600">/week</span>
            </div>
            <ul class="text-left space-y-3 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">8 meals per week</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Free delivery</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Nutrition tracking</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Skip or pause anytime</span>
              </li>
            </ul>
            <button class="btn-secondary w-full">
              Choose Basic
            </button>
          </div>
        </div>

        <!-- Popular Plan -->
        <div class="bg-white border-2 border-primary-600 rounded-2xl p-8 relative">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Premium</h3>
            <p class="text-gray-600 mb-6">Great for couples</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900">SR 159</span>
              <span class="text-gray-600">/week</span>
            </div>
            <ul class="text-left space-y-3 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">16 meals per week</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Free priority delivery</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Premium meal options</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Nutritionist consultation</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">24/7 support</span>
              </li>
            </ul>
            <button class="btn-primary w-full">
              Choose Premium
            </button>
          </div>
        </div>

        <!-- Family Plan -->
        <div class="bg-white border border-gray-200 rounded-2xl p-8 relative">
          <div class="text-center">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Family</h3>
            <p class="text-gray-600 mb-6">Perfect for families</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900">SR 249</span>
              <span class="text-gray-600">/week</span>
            </div>
            <ul class="text-left space-y-3 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">28 meals per week</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Free family delivery</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Kid-friendly options</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Family nutrition plans</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-600">Bulk discounts</span>
              </li>
            </ul>
            <button class="btn-secondary w-full">
              Choose Family
            </button>
          </div>
        </div>
      </div>

      <!-- One-Time Orders -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Single Meal -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Single Meal</h3>
          <div class="text-3xl font-bold text-gray-900 mb-4">SR 12.99</div>
          <p class="text-gray-600 text-sm mb-4">Perfect for trying our meals</p>
          <button class="btn-secondary w-full text-sm">Order Now</button>
        </div>

        <!-- Meal Bundle -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">5-Meal Bundle</h3>
          <div class="text-3xl font-bold text-gray-900 mb-4">SR 59.95</div>
          <p class="text-gray-600 text-sm mb-4">Save SR 5 on 5 meals</p>
          <button class="btn-secondary w-full text-sm">Order Now</button>
        </div>

        <!-- Weekly Pack -->
        <div class="bg-white border-2 border-primary-600 rounded-xl p-6 text-center relative">
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span class="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Best Value
            </span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">10-Meal Pack</h3>
          <div class="text-3xl font-bold text-gray-900 mb-4">SR 109.90</div>
          <p class="text-gray-600 text-sm mb-4">Save SR 20 on 10 meals</p>
          <button class="btn-primary w-full text-sm">Order Now</button>
        </div>

        <!-- Custom Order -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Custom Order</h3>
          <div class="text-3xl font-bold text-gray-900 mb-4">Varies</div>
          <p class="text-gray-600 text-sm mb-4">Build your own meal plan</p>
          <button class="btn-secondary w-full text-sm">Customize</button>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="mt-16 text-center">
        <div class="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h3>
          <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is here to help you choose the perfect plan for your lifestyle and dietary needs.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="btn-primary">
              Start Free Trial
            </button>
            <button class="btn-ghost">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Pricing',
  setup() {
    const isSubscription = ref(true)

    return {
      isSubscription
    }
  }
}
</script>
