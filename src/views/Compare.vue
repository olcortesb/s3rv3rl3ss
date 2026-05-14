<template>
  <div>
    <router-link to="/" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Home</router-link>

    <h1 class="text-2xl font-bold text-gray-900 mb-6">Compare Services</h1>

    <!-- Category selector -->
    <div class="flex flex-wrap gap-3 mb-8">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="selected = cat.id"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition border',
          selected === cat.id
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
        ]"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <div v-if="comparison">
      <!-- Service headers -->
      <div class="grid grid-cols-4 gap-2 mb-6">
        <div></div>
        <div v-for="provider in PROVIDERS" :key="provider" class="text-center">
          <span class="text-xs font-medium px-2 py-1 rounded-full" :class="providerBadge(provider)">{{ provider.toUpperCase() }}</span>
          <div v-if="getService(provider)" class="mt-2">
            <img :src="`/icons/${provider}/${comparison.services[provider]}.svg`" class="w-8 h-8 mx-auto mb-1" @error="$event.target.style.display='none'" />
            <p class="text-sm font-semibold text-gray-900">{{ getService(provider).name }}</p>
            <router-link :to="`/${provider}/${comparison.services[provider]}`" class="text-xs text-orange-500 hover:underline">details →</router-link>
          </div>
          <p v-else class="mt-2 text-sm text-gray-400">N/A</p>
        </div>
      </div>

      <!-- Limits comparison -->
      <div v-if="comparison.limits && comparison.limits.length" class="mb-8">
        <h2 class="font-semibold text-gray-900 mb-3">Limits</h2>
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="text-left py-2 px-3 text-gray-500 font-normal w-1/4"></th>
                <th v-for="provider in PROVIDERS" :key="provider" class="text-center py-2 px-3 text-gray-500 font-normal w-1/4">{{ provider.toUpperCase() }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparison.limits" :key="row.label" class="border-b border-gray-100 last:border-0">
                <td class="py-2 px-3 text-gray-700 font-medium">{{ row.label }}</td>
                <td v-for="provider in PROVIDERS" :key="provider" class="py-2 px-3 text-center">
                  <span v-if="getLimitValue(provider, row)" class="text-gray-900">{{ getLimitValue(provider, row) }}</span>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pricing comparison -->
      <div v-if="comparison.pricing && comparison.pricing.length" class="mb-8">
        <h2 class="font-semibold text-gray-900 mb-3">Pricing</h2>
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="text-left py-2 px-3 text-gray-500 font-normal w-1/4"></th>
                <th v-for="provider in PROVIDERS" :key="provider" class="text-center py-2 px-3 text-gray-500 font-normal w-1/4">{{ provider.toUpperCase() }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparison.pricing" :key="row.label" class="border-b border-gray-100 last:border-0">
                <td class="py-2 px-3 text-gray-700 font-medium">{{ row.label }}</td>
                <td v-for="provider in PROVIDERS" :key="provider" class="py-2 px-3 text-center">
                  <span v-if="getPricingValue(provider, row)" class="font-mono text-gray-900">{{ getPricingValue(provider, row) }}</span>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Runtimes comparison (only for functions) -->
      <div v-if="hasRuntimes" class="mb-8">
        <h2 class="font-semibold text-gray-900 mb-3">Runtimes</h2>
        <div class="grid grid-cols-4 gap-2">
          <div></div>
          <div v-for="provider in PROVIDERS" :key="provider">
            <div v-if="getService(provider)?.runtimes" class="flex flex-wrap gap-1">
              <span v-for="rt in getService(provider).runtimes.filter(r => r.status === 'active')" :key="rt.name" class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                {{ rt.name }}
              </span>
            </div>
            <span v-else class="text-xs text-gray-300">—</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import comparisons from '../data/comparisons.json'
import { getProviderData } from '../data/index.js'

const PROVIDERS = ['aws', 'gcp', 'azure']
const route = useRoute()
const categories = comparisons.categories
const selected = ref(route.params.category || categories[0].id)

const comparison = computed(() => categories.find(c => c.id === selected.value))

function getService(provider) {
  const serviceId = comparison.value?.services[provider]
  if (!serviceId) return null
  const data = getProviderData(provider)
  return data?.services.find(s => s.id === serviceId) || null
}

function getLimitValue(provider, row) {
  const fieldName = row[provider]
  if (!fieldName) return null
  const svc = getService(provider)
  if (!svc?.limits) return null
  const limit = svc.limits.find(l => l.name === fieldName)
  return limit?.value || null
}

function getPricingValue(provider, row) {
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
  }[provider]
}
</script>
