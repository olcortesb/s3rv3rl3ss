<template>
  <DataLoader :loading="loading" :error="error" @retry="load">
  <div>
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-2 font-mono">
        s<span class="text-gray-400 italic">3</span>rv<span class="text-gray-400 italic">3</span>rl<span class="text-gray-400 italic">3</span>ss
      </h1>
      <p class="text-gray-500">Runtimes, limits, quotas & news for serverless services — updated daily</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-4">
      <div v-for="p in providers" :key="p.id" class="flex flex-col items-center">
        <router-link
          :to="`/${p.id}`"
          class="group block w-full border border-gray-200 bg-white hover:border-gray-400 transition-all duration-200 p-6 text-center"
        >
          <img :src="p.icon" :alt="p.name" class="w-10 h-10 block mb-3 mx-auto" :class="p.id === 'stackit' ? 'brightness-0' : ''" />
          <h2 class="text-base font-semibold text-gray-900 mb-1">{{ p.name }}</h2>
          <p class="text-xs text-gray-400">{{ serviceCount(p.id) }} services</p>
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

    <div class="grid grid-cols-3 gap-4 max-w-5xl mx-auto mb-4">
      <router-link to="/security" class="group block border border-gray-200 bg-white hover:border-gray-400 transition-all duration-200 p-5 text-center">
        <svg class="w-8 h-8 block mb-2 mx-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
        <h2 class="text-sm font-semibold text-gray-900 mb-1">Security</h2>
        <p class="text-xs text-gray-400">AWS Security Bulletins</p>
      </router-link>
      <router-link to="/reinvent" class="group block border border-gray-200 bg-white hover:border-gray-400 transition-all duration-200 p-5 text-center">
        <img src="/icons/reinvent.svg" alt="re:Invent" class="w-8 h-8 block mb-2 mx-auto" />
        <h2 class="text-sm font-semibold text-gray-900 mb-1">re:Invent 2026</h2>
        <p class="text-xs text-gray-400">Nov 30 – Dec 4, Las Vegas</p>
      </router-link>
      <router-link to="/tools" class="group block border border-gray-200 bg-white hover:border-gray-400 transition-all duration-200 p-5 text-center">
        <img src="/icons/tools.svg" alt="Tools" class="w-8 h-8 block mb-2 mx-auto" />
        <h2 class="text-sm font-semibold text-gray-900 mb-1">Tools</h2>
        <p class="text-xs text-gray-400">Local AWS emulators</p>
      </router-link>
    </div>

    <div class="flex justify-center gap-4 mt-10">
      <router-link to="/compare" class="px-5 py-2.5 text-sm font-medium border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
        Compare
      </router-link>
      <router-link to="/stats" class="px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition">
        Stats
      </router-link>
      <router-link to="/metrics" class="px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition">
        Metrics
      </router-link>
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
</script>
