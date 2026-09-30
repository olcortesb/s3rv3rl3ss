<template>
  <div v-if="providerData">
    <router-link to="/" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Providers</router-link>

    <DataLoader :loading="loading" :error="error" @retry="load">

    <div class="bg-gray-900 text-white rounded-2xl p-8 mb-8">
      <div class="flex items-center justify-center gap-3 mb-3">
        <img :src="providerInfo.icon" :alt="providerInfo.name" class="w-10 h-10 brightness-0 invert" />
        <h1 class="text-3xl font-bold text-white">{{ providerInfo.name }}</h1>
      </div>
      <p class="text-gray-400 text-sm text-center mb-3">
        Runtimes, limits, quotas & news — updated daily
        <span v-if="props.provider === 'aws' && providerData?.region" class="inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-orange-900 text-orange-300 rounded-full">📍 {{ providerData.region }}</span>
      </p>
      <div class="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
        <template v-if="props.provider === 'aws'">
          <span>Quotas via <a href="https://docs.aws.amazon.com/servicequotas/2019-06-24/apireference/API_ListServiceQuotas.html" target="_blank" class="underline hover:text-orange-400">Service Quotas API</a></span>
          <span>Pricing via <a href="https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html" target="_blank" class="underline hover:text-orange-400">Price List API</a></span>
          <span>News via <a href="https://aws.amazon.com/about-aws/whats-new/recent/feed/" target="_blank" class="underline hover:text-orange-400">AWS What's New RSS</a></span>
          <span>Runtimes via <a href="https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html" target="_blank" class="underline hover:text-orange-400">AWS Docs</a></span>
        </template>
        <template v-else-if="props.provider === 'gcp'">
          <span>Limits via static data (docs)</span>
          <span>Pricing via static data (docs)</span>
          <span>News via <a href="https://cloud.google.com/feeds/run-release-notes.xml" target="_blank" class="underline hover:text-orange-400">GCP Release Notes RSS</a></span>
          <span>Runtimes via static data (docs)</span>
        </template>
        <template v-else-if="props.provider === 'azure'">
          <span>Limits via static data (docs)</span>
          <span>Pricing via <a href="https://prices.azure.com/api/retail/prices" target="_blank" class="underline hover:text-orange-400">Azure Retail Prices API</a></span>
          <span>News via <a href="https://azure.microsoft.com/en-us/blog/feed/" target="_blank" class="underline hover:text-orange-400">Azure Blog</a>, <a href="https://azureweekly.info/rss.xml" target="_blank" class="underline hover:text-orange-400">Azure Weekly</a></span>
          <span>Runtimes via static data (docs)</span>
        </template>
        <template v-else-if="props.provider === 'stackit'">
          <span>Limits via static data (docs)</span>
          <span>Pricing via <a href="https://pim.api.stackit.cloud/v1/skus" target="_blank" class="underline hover:text-orange-400">STACKIT PIM API</a></span>
          <span>News via <a href="https://docs.stackit.cloud/release-notes/feed.xml" target="_blank" class="underline hover:text-orange-400">STACKIT Release Notes RSS</a></span>
          <span>Runtimes via static data (docs)</span>
        </template>
      </div>
    </div>

    <!-- Statistics removed: moved to /stats -->

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
      <SearchBar v-model="search" />
      <CategoryFilter :categories="categories" :modelValue="selectedCategory" @select="selectedCategory = $event" />
    </div>

    <div class="flex gap-3 mb-4 text-xs">
      <span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">New — last 48h</span>
      <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Updated — last 15 days</span>
      <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Recent — last 30 days</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ServiceCard v-for="s in filtered" :key="s.id" :service="s" :provider="provider" />
    </div>

    <p v-if="!filtered.length" class="text-center text-gray-400 mt-12">No services found.</p>
    </DataLoader>
  </div>
  <div v-else class="text-center text-gray-400 mt-12">Provider not found.</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Fuse from 'fuse.js'
import { getProviderData, getProvider } from '../data/index.js'
import SearchBar from '../components/SearchBar.vue'
import ServiceCard from '../components/ServiceCard.vue'
import CategoryFilter from '../components/CategoryFilter.vue'
import DataLoader from '../components/DataLoader.vue'

const props = defineProps({ provider: String })

const providerInfo = getProvider(props.provider)
const providerData = ref(null)
const loading = ref(true)
const error = ref(null)
const search = ref('')
const selectedCategory = ref('')
const enabledServices = ref([])
const categories = ref([])
let fuse = null

async function load() {
  loading.value = true
  error.value = null
  try {
    providerData.value = await getProviderData(props.provider)
    enabledServices.value = providerData.value ? providerData.value.services.filter(s => s.enabled) : []
    categories.value = [...new Set(enabledServices.value.map(s => s.category))].sort()
    fuse = new Fuse(enabledServices.value, {
      keys: ['name', 'description', 'category', 'useCases'],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  } catch (e) {
    error.value = e.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const filtered = computed(() => {
  if (!enabledServices.value.length) return []
  let results
  if (search.value && fuse) {
    const q = search.value.toLowerCase()
    const exact = enabledServices.value.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    )
    const fuzzy = fuse.search(search.value).map(r => r.item).filter(r => !exact.includes(r))
    results = [...exact, ...fuzzy]
  } else {
    results = enabledServices.value
  }

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
