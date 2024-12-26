<script setup lang="ts">
// import events from '../data/events.json'
import ContactUs from '@/components/ContactUs.vue'
</script>

<template>
  <v-sheet color="black">
    <div class="px-4 pt-6" style="max-width: 800px; margin: auto">
      <h1>Contact Us</h1>
      <p class="mb-2">Leave us a message, and we'll get back to you when we can!</p>
      <ContactUs has-form-only></ContactUs>
    </div>
  </v-sheet>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    align-items: center;
  }
}
</style>
