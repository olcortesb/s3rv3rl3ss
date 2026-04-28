<template>
  <div v-if="service">
    <router-link :to="`/${provider}`" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Back</router-link>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-3xl">
      <div class="flex items-center gap-3 mb-4">
        <img :src="iconUrl" :alt="service.name" class="w-12 h-12" @error="$event.target.style.display='none';$event.target.nextElementSibling.style.display='inline'" />
        <span class="text-4xl" style="display:none">{{ service.icon }}</span>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ service.name }}</h1>
          <span class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {{ service.category }}
          </span>
          <span v-if="service.dataStatus === 'partial'" class="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 ml-1" title="Some data sources were unavailable">
            Partial data
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
        <button @click="showRuntimes = !showRuntimes" class="flex items-center gap-2 font-semibold text-gray-900 mb-2 hover:text-orange-500 transition">
          <span class="text-xs">{{ showRuntimes ? '▼' : '▶' }}</span>
          Runtime Support
          <span class="text-xs font-normal text-gray-400">({{ service.runtimes.length }})</span>
        </button>
        <div v-show="showRuntimes" class="flex flex-wrap gap-2">
          <span
            v-for="rt in service.runtimes"
            :key="rt.name"
            :class="[
              'px-3 py-1 rounded-full text-sm',
              runtimeClass(rt)
            ]"
            :title="rt.eol ? `EOL: ${rt.eol}${rt.identifier ? ' | ' + rt.identifier : ''}` : rt.identifier || ''"
          >
            {{ rt.name }}
            <span v-if="rt.eol" class="ml-1 text-xs opacity-70">{{ eolLabel(rt.eol) }}</span>
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
                <span v-if="l.adjustable" class="ml-1 text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600" title="This quota can be increased">adjustable</span>
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
        <button @click="showLimits = !showLimits" class="flex items-center gap-2 font-semibold text-gray-900 mb-2 hover:text-orange-500 transition">
          <span class="text-xs">{{ showLimits ? '▼' : '▶' }}</span>
          Limits
          <span class="text-xs font-normal text-gray-400">({{ filteredLimits.length }})</span>
        </button>
        <div v-show="showLimits">
          <input
            v-model="limitSearch"
            type="text"
            placeholder="Search limits..."
            class="w-full mb-3 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div class="space-y-1">
            <div
              v-for="l in filteredLimits"
              :key="l.name"
              class="py-2 border-b border-gray-100"
            >
              <div class="font-medium text-sm text-gray-700">{{ l.name }}</div>
              <div class="text-sm text-gray-500 mt-0.5">{{ l.value }}</div>
            </div>
          </div>
          <p v-if="!filteredLimits.length" class="text-sm text-gray-400 mt-2">No limits match.</p>
        </div>
      </div>

      <!-- Integrations -->
      <div v-if="service.integrations" class="mb-6">
        <div v-for="group in service.integrations" :key="group.label" class="mb-4">
          <h2 class="font-semibold text-gray-900 mb-1">{{ group.label }}
            <span v-if="group.description" class="text-xs font-normal text-gray-400 ml-1">{{ group.description }}</span>
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in group.items"
              :key="item.id"
              class="px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700"
            >
              {{ item.name }}
            </span>
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

      <!-- Pricing -->
      <div class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Pricing
          <span class="text-xs font-normal text-gray-400 ml-1">US East (N. Virginia) · On-Demand</span>
        </h2>
        <p class="text-gray-600 text-sm mb-3">{{ service.pricing }}</p>
        <div v-if="service.pricingDetails" class="bg-gray-50 rounded-lg p-3 mb-3">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-1 text-gray-500 font-normal">Item</th>
                <th class="text-right py-1 text-gray-500 font-normal">Price (USD)</th>
                <th class="text-left py-1 pl-2 text-gray-500 font-normal">Per</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in service.pricingDetails" :key="p.label" class="border-b border-gray-100 last:border-0" :title="p.description">
                <td class="py-2 text-gray-700">{{ p.label }}</td>
                <td class="py-2 text-right font-mono font-medium text-gray-900">{{ p.price }}</td>
                <td class="py-2 pl-2 text-gray-400">{{ p.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex flex-wrap gap-4">
          <a v-if="service.pricingUrl" :href="service.pricingUrl" target="_blank" class="text-sm text-orange-500 hover:text-orange-600 underline">Full pricing details ↗</a>
          <a href="https://calculator.aws" target="_blank" class="text-sm text-orange-500 hover:text-orange-600 underline">AWS Pricing Calculator ↗</a>
        </div>
      </div>

      <!-- Changelog -->
      <div v-if="changelog.length" class="mb-6">
        <button @click="showChangelog = !showChangelog" class="flex items-center gap-2 font-semibold text-gray-900 mb-2 hover:text-orange-500 transition">
          <span class="text-xs">{{ showChangelog ? '▼' : '▶' }}</span>
          Changelog
          <span class="text-xs font-normal text-gray-400">({{ changelog.length }})</span>
        </button>
        <div v-show="showChangelog">
          <ul class="space-y-2">
            <li v-for="(c, i) in changelog" :key="i" class="flex gap-3 text-sm">
              <span class="text-gray-400 shrink-0">{{ c.date }}</span>
              <span class="shrink-0">{{ typeIcon(c.type) }}</span>
              <span class="text-gray-700">{{ c.detail }}</span>
            </li>
          </ul>
        </div>
      </div>

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
import { getProviderData, getChangelog } from '../data/index.js'

const props = defineProps({ provider: String, id: String })
const providerData = getProviderData(props.provider)
const service = computed(() => providerData?.services.find(s => s.id === props.id))
const changelog = computed(() => getChangelog(props.id))
const iconUrl = computed(() => `/icons/${props.provider}/${props.id}.svg`)

const showRuntimes = ref(false)
const showQuotas = ref(false)
const showLimits = ref(false)
const showChangelog = ref(false)
const quotaSearch = ref('')
const limitSearch = ref('')

const TYPE_ICONS = {
  quota_changed: '📊',
  quota_added: '📊',
  quota_removed: '📊',
  new_runtime: '⚙️',
  runtime_changed: '⚙️',
  runtime_removed: '⚙️',
  new_news: '📰',
  service_added: '🆕',
}

function typeIcon(type) {
  return TYPE_ICONS[type] || '🔹'
}

function eolLabel(eol) {
  const end = new Date(eol)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  if (end < now) return '(expired)'
  return `(${months[end.getMonth()]} ${end.getFullYear()})`
}

function runtimeClass(rt) {
  if (rt.status === 'deprecated') return 'bg-red-100 text-red-500 line-through'
  if (rt.eol) {
    const days = Math.floor((new Date(rt.eol) - new Date()) / (1000 * 60 * 60 * 24))
    if (days <= 210) return 'bg-yellow-100 text-yellow-700'
  }
  return 'bg-green-100 text-green-700'
}

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

const limitFuse = computed(() => new Fuse(staticLimits.value, {
  keys: ['name', 'value'],
  threshold: 0.3,
}))

const filteredLimits = computed(() =>
  limitSearch.value
    ? limitFuse.value.search(limitSearch.value).map(r => r.item)
    : staticLimits.value
)

const filteredQuotas = computed(() =>
  quotaSearch.value
    ? quotaFuse.value.search(quotaSearch.value).map(r => r.item)
    : apiQuotas.value
)
</script>
