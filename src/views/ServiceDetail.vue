<template>
  <div v-if="service">
    <router-link :to="`/${provider}`" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Back</router-link>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-3xl">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-4xl">{{ service.icon }}</span>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ service.name }}</h1>
          <span class="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
            {{ service.category }}
          </span>
        </div>
      </div>

      <p class="text-gray-700 mb-6">{{ service.description }}</p>

      <h2 class="font-semibold text-gray-900 mb-2">Use Cases</h2>
      <div class="flex flex-wrap gap-2 mb-6">
        <span v-for="uc in service.useCases" :key="uc" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {{ uc }}
        </span>
      </div>

      <div v-if="service.runtimes" class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Runtime Support</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="rt in service.runtimes"
            :key="rt.name"
            :class="[
              'px-3 py-1 rounded-full text-sm',
              rt.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500 line-through'
            ]"
          >
            {{ rt.name }}
          </span>
        </div>
      </div>

      <!-- Service Quotas (from API, with description) -->
      <div v-if="apiQuotas.length" class="mb-6">
        <button @click="showQuotas = !showQuotas" class="flex items-center gap-2 font-semibold text-gray-900 mb-2 hover:text-orange-500 transition">
          <span class="text-xs">{{ showQuotas ? '▼' : '▶' }}</span>
          Service Quotas
          <span class="text-xs font-normal text-gray-400">({{ filteredQuotas.length }})</span>
        </button>
        <div v-show="showQuotas">
          <input
            v-model="quotaSearch"
            type="text"
            placeholder="Search quotas..."
            class="w-full mb-3 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div class="space-y-1">
            <div
              v-for="l in filteredQuotas"
              :key="l.name"
              class="flex items-start justify-between py-2 border-b border-gray-100"
            >
              <div class="pr-4 min-w-0">
                <span class="text-sm text-gray-700">{{ l.name }}</span>
                <p v-if="l.description" class="text-xs text-gray-400 mt-0.5">{{ l.description }}</p>
              </div>
              <span class="text-sm text-gray-900 font-medium shrink-0">{{ l.value }}</span>
            </div>
          </div>
          <p v-if="!filteredQuotas.length" class="text-sm text-gray-400 mt-2">No quotas match.</p>
        </div>
      </div>

      <!-- Static Limits -->
      <div v-if="staticLimits.length" class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Limits</h2>
        <div class="space-y-1">
          <div
            v-for="l in staticLimits"
            :key="l.name"
            class="flex items-start justify-between py-2 border-b border-gray-100"
          >
            <span class="text-sm text-gray-500 pr-4">{{ l.name }}</span>
            <span class="text-sm text-gray-900 font-medium shrink-0">{{ l.value }}</span>
          </div>
        </div>
      </div>

      <div v-if="service.news" class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">News
          <span class="text-xs font-normal text-gray-400 ml-1">via AWS What's New</span>
        </h2>
        <ul class="space-y-2">
          <li v-for="n in service.news" :key="n.title" class="flex gap-3 text-sm">
            <span class="text-gray-400 shrink-0">{{ n.date }}</span>
            <a v-if="n.url" :href="n.url" target="_blank" class="text-gray-700 hover:text-orange-500 underline decoration-gray-300 hover:decoration-orange-500 transition">{{ n.title }} ↗</a>
            <span v-else class="text-gray-700">{{ n.title }}</span>
          </li>
        </ul>
      </div>

      <h2 class="font-semibold text-gray-900 mb-2">Pricing</h2>
      <p class="text-gray-600 mb-6">{{ service.pricing }}</p>

      <a :href="service.url" target="_blank" class="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">
        View on {{ provider.toUpperCase() }} →
      </a>
    </div>
  </div>
  <div v-else class="text-center text-gray-400 mt-12">Service not found.</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import { getProviderData } from '../data/index.js'

const props = defineProps({ provider: String, id: String })
const providerData = getProviderData(props.provider)
const service = computed(() => providerData?.services.find(s => s.id === props.id))

const showQuotas = ref(true)
const quotaSearch = ref('')

const apiQuotas = computed(() =>
  (service.value?.limits || []).filter(l => l.description)
)
const staticLimits = computed(() =>
  (service.value?.limits || []).filter(l => !l.description)
)

const quotaFuse = computed(() => new Fuse(apiQuotas.value, {
  keys: ['name', 'description', 'value'],
  threshold: 0.3,
}))

const filteredQuotas = computed(() =>
  quotaSearch.value
    ? quotaFuse.value.search(quotaSearch.value).map(r => r.item)
    : apiQuotas.value
)
</script>
