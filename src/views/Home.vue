<template>
  <div>
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">s3rv3rl3ss</h1>
      <p class="text-gray-500">Runtimes, limits, quotas & news for serverless services — updated daily</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <router-link
        v-for="p in providers"
        :key="p.id"
        :to="`/${p.id}`"
        class="group block rounded-2xl border-2 transition-all duration-200 p-8 text-center hover:-translate-y-1"
        :class="cardClass(p.id)"
      >
        <span class="text-5xl block mb-4">{{ p.icon }}</span>
        <h2 class="text-xl font-bold text-gray-900 mb-1">{{ p.name }}</h2>
        <p class="text-sm text-gray-400">{{ serviceCount(p.id) }} services</p>
      </router-link>
    </div>

    <div class="flex justify-center gap-4 mt-10">
      <router-link to="/compare" class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium text-sm">
        ⚖️ Compare Services
      </router-link>
      <router-link to="/metrics" class="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:border-gray-400 transition font-medium text-sm">
        📊 Project Metrics
      </router-link>
    </div>

    <!-- Feedback -->
    <div class="mt-12 text-center">
      <p class="text-sm text-gray-400 mb-3">Have feedback, ideas or found a bug?</p>
      <div class="flex justify-center gap-3">
        <a href="https://github.com/olcortesb/s3rv3rl3ss/issues/new" target="_blank" class="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition">
          🐛 Open an Issue
        </a>
        <a href="https://x.com/olcortesb" target="_blank" class="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition">
          🐦 @olcortesb
        </a>
        <a href="https://www.linkedin.com/in/oscarcortesbracho/" target="_blank" class="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition">
          💼 LinkedIn
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { providers, getProviderData } from '../data/index.js'

const counts = ref({ aws: 0, gcp: 0, azure: 0 })

onMounted(async () => {
  for (const p of providers) {
    const data = await getProviderData(p.id)
    if (data) counts.value[p.id] = data.services.length
  }
})

function serviceCount(id) {
  return counts.value[id] || '—'
}

function cardClass(id) {
  return {
    aws: 'border-orange-200 bg-orange-50/50 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100',
    gcp: 'border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100',
    azure: 'border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100',
  }[id]
}
</script>
