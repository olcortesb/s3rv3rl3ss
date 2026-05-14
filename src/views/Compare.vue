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

    <!-- Comparison table -->
    <div v-if="comparison" class="grid grid-cols-3 gap-4">
      <div v-for="provider in ['aws', 'gcp', 'azure']" :key="provider" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <!-- Header -->
        <div class="text-center mb-4 pb-3 border-b border-gray-100">
          <span class="text-xs font-medium px-2 py-1 rounded-full" :class="providerBadge(provider)">{{ provider.toUpperCase() }}</span>
          <div v-if="getService(provider)" class="mt-3">
            <img :src="`/icons/${provider}/${comparison.services[provider]}.svg`" class="w-10 h-10 mx-auto mb-2" @error="$event.target.style.display='none'" />
            <h3 class="font-semibold text-gray-900">{{ getService(provider).name }}</h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ getService(provider).description }}</p>
          </div>
          <div v-else class="mt-3 text-gray-400 text-sm">Not available</div>
        </div>

        <template v-if="getService(provider)">
          <!-- Pricing -->
          <div class="mb-4">
            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Pricing</h4>
            <p class="text-sm text-gray-700 mb-2">{{ getService(provider).pricing }}</p>
            <div v-if="getService(provider).pricingDetails" class="space-y-1">
              <div v-for="p in getService(provider).pricingDetails" :key="p.label" class="flex justify-between text-xs">
                <span class="text-gray-600">{{ p.label }}</span>
                <span class="font-mono text-gray-900">{{ p.price }}</span>
              </div>
            </div>
          </div>

          <!-- Limits -->
          <div v-if="getService(provider).limits" class="mb-4">
            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Limits</h4>
            <div class="space-y-1">
              <div v-for="l in getService(provider).limits.slice(0, 8)" :key="l.name" class="flex justify-between text-xs">
                <span class="text-gray-600">{{ l.name }}</span>
                <span class="text-gray-900 font-medium">{{ l.value }}</span>
              </div>
              <p v-if="getService(provider).limits.length > 8" class="text-xs text-gray-400">+{{ getService(provider).limits.length - 8 }} more</p>
            </div>
          </div>

          <!-- Runtimes -->
          <div v-if="getService(provider).runtimes">
            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Runtimes</h4>
            <div class="flex flex-wrap gap-1">
              <span v-for="rt in getService(provider).runtimes.filter(r => r.status === 'active')" :key="rt.name" class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                {{ rt.name }}
              </span>
            </div>
          </div>

          <!-- Link -->
          <div class="mt-4 pt-3 border-t border-gray-100">
            <router-link :to="`/${provider}/${comparison.services[provider]}`" class="text-xs text-orange-500 hover:text-orange-600 underline">
              View full details →
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import comparisons from '../data/comparisons.json'
import { getProviderData } from '../data/index.js'

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

function providerBadge(provider) {
  const map = {
    aws: 'bg-orange-100 text-orange-700',
    gcp: 'bg-blue-100 text-blue-700',
    azure: 'bg-sky-100 text-sky-700',
  }
  return map[provider]
}
</script>
