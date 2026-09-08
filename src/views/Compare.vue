<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Compare Services</h1>
      <div class="flex items-center gap-3 mt-1">
        <p v-if="comparisons.lastUpdated" class="text-xs text-gray-400">Updated {{ comparisons.lastUpdated }}</p>
        <span class="text-gray-200">·</span>
        <span class="text-xs text-gray-400 inline-flex items-center gap-1">
          Powered by
          <img src="https://img.shields.io/badge/Amazon%20Q-FF9900?style=flat&logo=amazon&logoColor=white" alt="Amazon Q" class="h-4" />
        </span>
      </div>
    </div>

    <DataLoader :loading="loading" :error="error" @retry="load">
      <!-- Category selector -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selected = cat.id"
          :class="[
            'px-3 py-1.5 rounded-full text-sm font-medium transition',
            selected === cat.id
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-gray-900'
          ]"
        >
          {{ cat.icon }} {{ cat.name }}
        </button>
      </div>

      <div v-if="comparison">
        <!-- Service headers -->
        <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        <div class="grid grid-cols-5 gap-3 min-w-[600px] sm:min-w-0">
          <div></div>
          <div v-for="provider in PROVIDERS" :key="provider"
            class="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="providerBadge(provider)">
              {{ provider.toUpperCase() }}
            </span>
            <div v-if="getService(provider)" class="mt-2">
              <img :src="`/icons/${provider}/${comparison.services[provider]}.svg`"
                class="w-7 h-7 mx-auto mb-1" @error="$event.target.style.display='none'" />
              <p class="text-xs font-semibold text-gray-900 leading-tight">{{ getService(provider).name }}</p>
              <div class="flex justify-center gap-2 mt-2">
                <router-link :to="`/${provider}/${comparison.services[provider]}`"
                  class="text-xs text-orange-500 hover:underline">details →</router-link>
                <a v-if="comparison.limitsUrls?.[provider]" :href="comparison.limitsUrls[provider]"
                  target="_blank" class="text-xs text-gray-400 hover:text-orange-500">limits ↗</a>
              </div>
            </div>
            <p v-else class="mt-3 text-xs text-gray-300">N/A</p>
          </div>
        </div>
        </div>

        <!-- Limits -->
        <div v-if="comparison.limits?.length" class="mb-6">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Limits</h2>
          <div class="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table class="w-full text-sm min-w-[500px]">
              <tbody>
                <tr v-for="row in comparison.limits" :key="row.label"
                  class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td class="py-2.5 px-4 text-gray-500 text-xs w-1/5 whitespace-nowrap">{{ row.label }}</td>
                  <td v-for="provider in PROVIDERS" :key="provider" class="py-2.5 px-3 text-center text-xs">
                    <span v-if="getLimitValue(provider, row)" class="text-gray-900 font-medium">
                      {{ getLimitValue(provider, row) }}
                    </span>
                    <span v-else class="text-gray-200">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pricing -->
        <div v-if="comparison.pricing?.length" class="mb-6">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Pricing</h2>
          <div class="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table class="w-full text-sm min-w-[500px]">
              <tbody>
                <tr v-for="row in comparison.pricing" :key="row.label"
                  class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td class="py-2.5 px-4 text-gray-500 text-xs w-1/5 whitespace-nowrap">{{ row.label }}</td>
                  <td v-for="provider in PROVIDERS" :key="provider" class="py-2.5 px-3 text-center text-xs">
                    <span v-if="getPricingValue(provider, row)" class="font-mono text-gray-900">
                      {{ getPricingValue(provider, row) }}
                    </span>
                    <span v-else class="text-gray-200">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Runtimes -->
        <div v-if="hasRuntimes" class="mb-6">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Runtimes</h2>
          <div class="bg-white rounded-xl border border-gray-100 p-4 overflow-x-auto">
            <div class="grid grid-cols-5 gap-3 min-w-[500px]">
              <div></div>
              <div v-for="provider in PROVIDERS" :key="provider">
                <div v-if="getService(provider)?.runtimes" class="flex flex-wrap gap-1">
                  <span v-for="rt in getService(provider).runtimes.filter(r => r.status === 'active')" :key="rt.name"
                    class="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                    {{ rt.name }}
                  </span>
                </div>
                <span v-else class="text-xs text-gray-200">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataLoader>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProviderData, getComparisons } from '../data/index.js'
import DataLoader from '../components/DataLoader.vue'

const PROVIDERS = ['aws', 'gcp', 'azure', 'stackit']
const route = useRoute()
const comparisons = ref({ categories: [] })
const categories = computed(() => comparisons.value.categories)
const selected = ref(route.params.category || '')
const servicesData = ref({ aws: null, gcp: null, azure: null, stackit: null })
const loading = ref(true)
const error = ref(null)

const comparison = computed(() => categories.value.find(c => c.id === selected.value))

async function loadServices() {
  for (const p of PROVIDERS) {
    const sid = comparison.value?.services[p]
    if (sid && !servicesData.value[p]) {
      try {
        servicesData.value[p] = await getProviderData(p)
      } catch {
        servicesData.value[p] = { services: [] }
      }
    }
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    comparisons.value = await getComparisons()
    if (!selected.value) selected.value = comparisons.value.categories[0]?.id || ''
    await loadServices()
  } catch (e) {
    error.value = e.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(selected, loadServices)

function getService(provider) {
  const serviceId = comparison.value?.services[provider]
  if (!serviceId) return null
  const data = servicesData.value[provider]
  return data?.services.find(s => s.id === serviceId) || null
}

function getLimitValue(provider, row) {
  // Check for static value first
  const staticVal = row[`${provider}_value`]
  if (staticVal) return staticVal

  const fieldName = row[provider]
  if (!fieldName) return null
  const svc = getService(provider)
  if (!svc?.limits) return null
  const limit = svc.limits.find(l => l.name === fieldName)
  if (!limit) return null
  // Clean HTML and truncate long descriptions
  let val = limit.value.replace(/<[^>]+>/g, '').trim()
  // Extract range max: "128 MB to 10,240 MB" → "10,240 MB"
  const rangeMatch = val.match(/[\d,.]+\s*\S+\s+to\s+([\d,.]+\s*\S+)/i)
  if (rangeMatch) return rangeMatch[1]
  // "0.25 – 16" style ranges → "16"
  const dashMatch = val.match(/[\d,.]+\s*\S*\s*[–\-]\s*([\d,.]+\s*\S*)/)
  if (dashMatch && val.length < 40) return dashMatch[0]
  // Take only first sentence (period followed by space or end)
  const cut = val.search(/\.\s|\n/)
  if (cut > 0 && cut < 60) val = val.substring(0, cut)
  // If still too long, take first number with unit
  if (val.length > 60) {
    const match = val.match(/^[\d,.]+\s*[A-Za-z/%]+/)
    if (match) val = match[0]
  }
  // Append unit if value is just a number and row has a unit defined
  if (row.unit && /^[\d,]+$/.test(val)) {
    val = `${val} ${row.unit}`
  }
  return val
}

function getPricingValue(provider, row) {
  // Check for static value first
  const staticVal = row[`${provider}_value`]
  if (staticVal) return staticVal

  const fieldName = row[provider]
  if (!fieldName) return null
  const svc = getService(provider)
  if (!svc?.pricingDetails) return null
  const item = svc.pricingDetails.find(p => p.label === fieldName)
  return item ? `${item.price} ${item.unit}` : null
}

const hasRuntimes = computed(() =>
  PROVIDERS.some(p => getService(p)?.runtimes?.length)
)

function providerBadge(provider) {
  return {
    aws: 'bg-orange-100 text-orange-700',
    gcp: 'bg-blue-100 text-blue-700',
    azure: 'bg-sky-100 text-sky-700',
    stackit: 'bg-green-100 text-green-700',
  }[provider]
}
</script>
