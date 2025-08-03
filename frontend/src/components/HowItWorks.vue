<template>
  <section id="how-it-works" class="py-16 lg:py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl font-display">
          How Bilafya Works
        </h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Getting healthy meals has never been easier. Follow these simple steps to start your wellness journey.
        </p>
      </div>

      <!-- Steps -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <!-- Step 1 -->
        <div class="text-center lg:text-left">
          <div class="flex items-center justify-center lg:justify-start mb-6">
            <div class="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
              1
            </div>
            <div class="hidden lg:block w-full h-0.5 bg-gray-300"></div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Choose Your Plan</h3>
          <p class="text-gray-600">
            Select from our subscription plans or choose one-time orders. Pick your preferred meal types, portion sizes, and delivery frequency.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="text-center lg:text-left">
          <div class="flex items-center justify-center lg:justify-start mb-6">
            <div class="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
              2
            </div>
            <div class="hidden lg:block w-full h-0.5 bg-gray-300"></div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">We Prepare Fresh</h3>
          <p class="text-gray-600">
            Our expert chefs prepare your meals using the freshest ingredients. Each meal is carefully crafted to meet your nutritional needs.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="text-center lg:text-left">
          <div class="flex items-center justify-center lg:justify-start mb-6">
            <div class="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Delivered to You</h3>
          <p class="text-gray-600">
            Your meals are delivered fresh to your doorstep at your preferred time. Just heat and enjoy your healthy, delicious meal!
          </p>
        </div>
      </div>

      <!-- Visual Process -->
      <div class="mt-16">
        <div class="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <!-- Left Content -->
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Two Ways to Order</h3>
              
              <!-- Subscription Option -->
              <div class="mb-8">
                <div class="flex items-start mb-4">
                  <div class="bg-primary-100 rounded-lg p-3 mr-4">
                    <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900">Subscription Plans</h4>
                    <p class="text-gray-600 mt-1">
                      Save money with regular deliveries. Flexible scheduling, easy to pause or cancel anytime.
                    </p>
                  </div>
                </div>
              </div>

              <!-- One-time Option -->
              <div>
                <div class="flex items-start">
                  <div class="bg-primary-100 rounded-lg p-3 mr-4">
                    <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900">One-Time Orders</h4>
                    <p class="text-gray-600 mt-1">
                      Perfect for trying our meals or when you need healthy food on-demand. No commitment required.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Visual -->
            <div class="relative">
              <!-- App Mockup -->
              <div class="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-6 shadow-lg">
                <div class="bg-white rounded-xl p-4 mb-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-900">Your Order</h4>
                    <span class="text-sm text-gray-500">Today</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Grilled Salmon Bowl</span>
                      <span class="font-medium">$12.99</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Quinoa Buddha Bowl</span>
                      <span class="font-medium">$10.99</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Green Smoothie</span>
                      <span class="font-medium">$6.99</span>
                    </div>
                  </div>
                </div>
                <div class="bg-primary-600 text-white rounded-xl p-4 text-center">
                  <div class="text-sm font-medium">Estimated Delivery</div>
                  <div class="text-lg font-bold">2:30 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="mt-16 text-center">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
        <p class="text-gray-600 mb-8 max-w-xl mx-auto">
          Choose your preferred way to order and start enjoying healthy, delicious meals today.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="btn-primary text-lg px-8 py-4">
            Subscribe & Save
          </button>
          <button class="btn-secondary text-lg px-8 py-4">
            Order Once
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HowItWorks'
}
</script>
