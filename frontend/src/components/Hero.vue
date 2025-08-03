<template>
  <section class="bg-gradient-to-br from-primary-50 to-secondary-50 pt-20 pb-16 lg:pt-32 lg:pb-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
        <!-- Content -->
        <div class="lg:col-span-6">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl font-display">
            Healthy Meals
            <span class="text-primary-600">Delivered</span>
            to Your Door
          </h1>
          <p class="mt-6 text-lg text-gray-600 sm:text-xl max-w-lg">
            Subscribe to our carefully crafted meal plans or order one-time healthy meals. 
            Bilafya makes nutritious eating simple, convenient, and delicious.
          </p>
          
          <!-- CTA Buttons -->
          <div class="mt-8 flex flex-col sm:flex-row gap-4">
            <button class="btn-primary text-lg px-8 py-4">
              Start Subscription
            </button>
            <button class="btn-secondary text-lg px-8 py-4">
              Order Now
            </button>
          </div>

          <!-- Trust Indicators -->
          <div class="mt-12 flex items-center space-x-8 text-sm text-gray-500">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Fresh Ingredients
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              No Commitment
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Fast Delivery
            </div>
          </div>
        </div>

        <!-- Image/Visual -->
        <div class="mt-12 lg:mt-0 lg:col-span-6">
          <div class="relative">
            <!-- Placeholder for food image -->
            <div class="relative bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-xl">
              <div class="grid grid-cols-2 gap-4">
                <!-- Meal Card 1 -->
                <div class="bg-white rounded-lg p-4 shadow-md">
                  <div class="w-full h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg mb-3"></div>
                  <h3 class="font-semibold text-sm text-gray-900">Grilled Salmon</h3>
                  <p class="text-xs text-gray-600">with quinoa & vegetables</p>
                </div>
                
                <!-- Meal Card 2 -->
                <div class="bg-white rounded-lg p-4 shadow-md">
                  <div class="w-full h-24 bg-gradient-to-br from-green-200 to-green-300 rounded-lg mb-3"></div>
                  <h3 class="font-semibold text-sm text-gray-900">Buddha Bowl</h3>
                  <p class="text-xs text-gray-600">fresh & nutritious</p>
                </div>
                
                <!-- Meal Card 3 -->
                <div class="bg-white rounded-lg p-4 shadow-md">
                  <div class="w-full h-24 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg mb-3"></div>
                  <h3 class="font-semibold text-sm text-gray-900">Acai Bowl</h3>
                  <p class="text-xs text-gray-600">antioxidant rich</p>
                </div>
                
                <!-- Meal Card 4 -->
                <div class="bg-white rounded-lg p-4 shadow-md">
                  <div class="w-full h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-lg mb-3"></div>
                  <h3 class="font-semibold text-sm text-gray-900">Protein Bowl</h3>
                  <p class="text-xs text-gray-600">lean & filling</p>
                </div>
              </div>
              
              <!-- Floating Badge -->
              <div class="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                <div class="text-center">
                  <div class="text-2xl font-bold text-primary-600">5⭐</div>
                  <div class="text-xs text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Hero'
}
</script>
