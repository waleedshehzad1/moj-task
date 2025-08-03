<template>
  <div id="app">
    <!-- Navigation -->
    <Navigation />
    
    <!-- Hero Section -->
    <Hero />
    
    <!-- Features Section -->
    <Features />
    
    <!-- How It Works Section -->
    <HowItWorks />
    
    <!-- Pricing Section -->
    <Pricing />
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue'
import Hero from './components/Hero.vue'
import Features from './components/Features.vue'
import HowItWorks from './components/HowItWorks.vue'
import Pricing from './components/Pricing.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navigation,
    Hero,
    Features,
    HowItWorks,
    Pricing,
    Footer
  }
}
</script>
