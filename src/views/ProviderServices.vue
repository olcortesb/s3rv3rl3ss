<template>
  <div v-if="providerData">
    <router-link to="/" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Providers</router-link>

    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ providerInfo.icon }} {{ providerInfo.name }} s3rv3rl3ss</h1>
      <p class="text-gray-500 mb-3">Runtimes, limits, quotas & news — updated daily</p>
      <div class="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
        <span>📊 Quotas via <a href="https://docs.aws.amazon.com/servicequotas/2019-06-24/apireference/API_ListServiceQuotas.html" target="_blank" class="underline hover:text-orange-500">Service Quotas API</a></span>
        <span>📰 News via <a href="https://aws.amazon.com/about-aws/whats-new/recent/feed/" target="_blank" class="underline hover:text-orange-500">AWS What's New RSS</a></span>
        <span>⚙️ Runtimes via <a href="https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html" target="_blank" class="underline hover:text-orange-500">AWS Docs</a></span>
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
import { getProviderData, getProvider } from '../data/index.js'
import SearchBar from '../components/SearchBar.vue'
import ServiceCard from '../components/ServiceCard.vue'
import CategoryFilter from '../components/CategoryFilter.vue'

const props = defineProps({ provider: String })

const providerInfo = getProvider(props.provider)
const providerData = getProviderData(props.provider)

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

  // Sort: services with recent news first
  results.sort((a, b) => {
    const aDate = a.news?.[0]?.date || ''
    const bDate = b.news?.[0]?.date || ''
    return bDate.localeCompare(aDate)
  })

  return results
})
</script>
