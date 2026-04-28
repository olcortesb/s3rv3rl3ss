<template>
  <div v-if="providerData">
    <router-link to="/" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Providers</router-link>

    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ providerInfo.icon }} {{ providerInfo.name }} s3rv3rl3ss</h1>
      <p class="text-gray-500 mb-3">Runtimes, limits, quotas & news — updated daily</p>
      <div class="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
        <span>📊 Quotas via <a href="https://docs.aws.amazon.com/servicequotas/2019-06-24/apireference/API_ListServiceQuotas.html" target="_blank" class="underline hover:text-orange-500">Service Quotas API</a></span>
        <span>💰 Pricing via <a href="https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html" target="_blank" class="underline hover:text-orange-500">Price List API</a></span>
        <span>📰 News via <a href="https://aws.amazon.com/about-aws/whats-new/recent/feed/" target="_blank" class="underline hover:text-orange-500">AWS What's New RSS</a></span>
        <span>⚙️ Runtimes via <a href="https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html" target="_blank" class="underline hover:text-orange-500">AWS Docs</a></span>
      </div>
    </div>

    <!-- Statistics -->
    <div v-if="stats.summary?.totalServices" class="mb-6">
      <button @click="showStats = !showStats" class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition mb-3">
        <span class="text-xs">{{ showStats ? '▼' : '▶' }}</span>
        Statistics
      </button>
      <div v-show="showStats">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.summary.totalServices }}</div>
            <div class="text-xs text-gray-500">Services</div>
          </div>
          <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.summary.totalQuotas }}</div>
            <div class="text-xs text-gray-500">Service Quotas</div>
          </div>
          <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.summary.totalLimits }}</div>
            <div class="text-xs text-gray-500">Limits</div>
          </div>
          <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.summary.totalNews }}</div>
            <div class="text-xs text-gray-500">News</div>
          </div>
          <div v-if="stats.summary.totalRuntimes" class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.summary.activeRuntimes }}<span class="text-sm text-gray-400">/{{ stats.summary.totalRuntimes }}</span></div>
            <div class="text-xs text-gray-500">Active Runtimes</div>
          </div>
          <div v-if="stats.topServices?.mostQuotas" class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-lg font-bold text-gray-900">{{ stats.topServices.mostQuotas.name }}</div>
            <div class="text-xs text-gray-500">Most Quotas ({{ stats.topServices.mostQuotas.count }})</div>
          </div>
          <div v-if="stats.topServices?.mostNews" class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-lg font-bold text-gray-900">{{ stats.topServices.mostNews.name }}</div>
            <div class="text-xs text-gray-500">Most News ({{ stats.topServices.mostNews.count }})</div>
          </div>
          <div v-if="stats.topServices?.mostLimits" class="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <div class="text-lg font-bold text-gray-900">{{ stats.topServices.mostLimits.name }}</div>
            <div class="text-xs text-gray-500">Most Limits ({{ stats.topServices.mostLimits.count }})</div>
          </div>
        </div>
        <div v-if="stats.byCategory?.length" class="flex flex-wrap gap-2 mb-2">
          <span v-for="cat in stats.byCategory" :key="cat.category" class="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
            {{ cat.category }} ({{ cat.count }})
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
      <SearchBar v-model="search" />
      <CategoryFilter :categories="categories" :modelValue="selectedCategory" @select="selectedCategory = $event" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ServiceCard v-for="s in filtered" :key="s.id" :service="s" :provider="provider" />
    </div>

    <p v-if="!filtered.length" class="text-center text-gray-400 mt-12">No services found.</p>
  </div>
  <div v-else class="text-center text-gray-400 mt-12">Provider not found.</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import { getProviderData, getProvider, getStatistics } from '../data/index.js'
import SearchBar from '../components/SearchBar.vue'
import ServiceCard from '../components/ServiceCard.vue'
import CategoryFilter from '../components/CategoryFilter.vue'

const props = defineProps({ provider: String })

const providerInfo = getProvider(props.provider)
const providerData = getProviderData(props.provider)
const stats = getStatistics(props.provider)
const showStats = ref(false)

const search = ref('')
const selectedCategory = ref('')

const enabledServices = providerData ? providerData.services.filter(s => s.enabled) : []
const categories = [...new Set(enabledServices.map(s => s.category))].sort()

const fuse = new Fuse(enabledServices, {
  keys: ['name', 'description', 'category', 'useCases'],
  threshold: 0.3,
})

const filtered = computed(() => {
  let results = search.value
    ? fuse.search(search.value).map(r => r.item)
    : enabledServices

  if (selectedCategory.value) {
    results = results.filter(s => s.category === selectedCategory.value)
  }

  results.sort((a, b) => {
    const aDate = a.news?.[0]?.date || ''
    const bDate = b.news?.[0]?.date || ''
    return bDate.localeCompare(aDate)
  })

  return results
})
</script>
