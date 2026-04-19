<template>
  <div>
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">s3rv3rl3ss</h1>
      <p class="text-gray-500">Runtimes, limits, quotas & news for serverless services — updated daily</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
      <router-link
        v-for="p in providers"
        :key="p.id"
        :to="`/${p.id}`"
        class="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100 text-center"
      >
        <span class="text-4xl">{{ p.icon }}</span>
        <h2 class="mt-2 font-semibold text-gray-900 text-lg">{{ p.name }}</h2>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { providers } from '../data/index.js'
</script>
