<template>
  <section id="features" class="py-16 lg:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl font-display">
          Why Choose Bilafya?
        </h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          We're committed to making healthy eating convenient, delicious, and affordable for everyone.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="text-center group">
          <div class="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Fresh & Healthy</h3>
          <p class="text-gray-600">
            All our meals are prepared with the freshest ingredients, locally sourced when possible, and packed with essential nutrients.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="text-center group">
          <div class="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Quick Delivery</h3>
          <p class="text-gray-600">
            Fast and reliable delivery service ensures your meals arrive fresh and on time, every time.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="text-center group">
          <div class="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Flexible Plans</h3>
          <p class="text-gray-600">
            Choose from subscription plans or one-time orders. Skip, pause, or cancel anytime with no penalties.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="text-center group">
          <div class="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Chef Crafted</h3>
          <p class="text-gray-600">
            Every meal is designed by professional chefs and nutritionists to ensure both taste and health benefits.
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="text-center group">
          <div class="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Great Value</h3>
          <p class="text-gray-600">
            Competitive pricing with no hidden fees. Save more with subscription plans and bulk orders.
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="text-center group">
          <div class="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Track Nutrition</h3>
          <p class="text-gray-600">
            Monitor your nutrition intake with our app. Get detailed information about calories, macros, and more.
          </p>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-16 text-center">
        <div class="bg-primary-50 rounded-2xl p-8 lg:p-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Healthy Journey?</h3>
          <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who have transformed their eating habits with Bilafya's delicious and nutritious meals.
          </p>
          <button class="btn-primary text-lg px-8 py-4">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Features'
}
</script>
