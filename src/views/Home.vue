<template>
  <DataLoader :loading="loading" :error="error" @retry="load">
  <div>
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-2 font-mono">
        s<span class="text-gray-400 italic">3</span>rv<span class="text-gray-400 italic">3</span>rl<span class="text-gray-400 italic">3</span>ss
      </h1>
      <p class="text-gray-500">Runtimes, limits, quotas & news for serverless services — updated daily</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      <div v-for="p in providers" :key="p.id" class="flex flex-col items-center">
        <router-link
          :to="`/${p.id}`"
          class="group block w-full rounded-2xl border-2 transition-all duration-200 p-8 text-center hover:-translate-y-1"
          :class="cardClass(p.id)"
        >
          <img :src="p.icon" :alt="p.name" class="w-12 h-12 block mb-4 mx-auto" />
          <h2 class="text-xl font-bold text-gray-900 mb-1">{{ p.name }}</h2>
          <p class="text-sm text-gray-400">{{ serviceCount(p.id) }} services</p>
        </router-link>
        <a :href="p.statusUrl" target="_blank"
          class="text-xs text-gray-400 hover:text-gray-600 transition mt-2 inline-flex items-center gap-1"
        >
          <span v-if="status[p.id] !== undefined" class="w-2 h-2 rounded-full"
            :class="status[p.id] === 'operational' ? 'bg-green-400' : 'bg-red-400'"
          />
          status
        </a>
      </div>
    </div>

    <div class="flex justify-center gap-4 mt-10">
      <router-link to="/compare" class="px-5 py-2.5 text-sm font-medium border border-gray-900 text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition">
        Compare
      </router-link>
      <router-link to="/metrics" class="px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-600 rounded-xl hover:border-gray-900 hover:text-gray-900 transition">
        Metrics
      </router-link>
    </div>

    <!-- Feedback -->
    <div class="mt-12 text-center">
      <p class="text-sm text-gray-400 mb-3">Have feedback, ideas or found a bug?</p>
      <div class="flex justify-center gap-3">
        <a href="https://github.com/olcortesb/s3rv3rl3ss/issues/new" target="_blank" class="p-2 text-gray-400 border border-gray-200 rounded-lg hover:border-gray-900 hover:text-gray-900 transition">
          <img src="/icons/github.svg" class="w-4 h-4" />
        </a>
        <a href="https://x.com/olcortesb" target="_blank" class="p-2 text-gray-400 border border-gray-200 rounded-lg hover:border-gray-900 hover:text-gray-900 transition">
          <img src="/icons/x.svg" class="w-4 h-4" />
        </a>
        <a href="https://www.linkedin.com/in/oscarcortesbracho/" target="_blank" class="p-2 text-gray-400 border border-gray-200 rounded-lg hover:border-gray-900 hover:text-gray-900 transition">
          <img src="/icons/linkedin.svg" class="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
  </DataLoader>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { providers, getProviderData, getProviderStatus } from '../data/index.js'
import DataLoader from '../components/DataLoader.vue'

const counts = ref({ aws: 0, gcp: 0, azure: 0, stackit: 0 })
const status = ref({})
const loading = ref(true)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    for (const p of providers) {
      const data = await getProviderData(p.id)
      if (data) counts.value[p.id] = data.services.length
    }
  } catch (e) {
    error.value = e.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
  // Status en paralelo, no bloquea el render
  for (const p of providers) {
    getProviderStatus(p.id).then(s => { if (s !== null) status.value = { ...status.value, [p.id]: s } })
  }
}

onMounted(load)

function serviceCount(id) {
  return counts.value[id] || '—'
}

function cardClass(id) {
  return {
    aws: 'border-orange-100 bg-orange-50/30 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50',
    gcp: 'border-blue-100 bg-blue-50/30 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50',
    azure: 'border-purple-100 bg-purple-50/30 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50',
    stackit: 'border-green-100 bg-green-50/30 hover:border-green-200 hover:shadow-lg hover:shadow-green-50',
  }[id]
}
</script>
