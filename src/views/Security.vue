<template>
  <DataLoader :loading="loading" :error="error" @retry="load">
    <div class="max-w-3xl">
      <div class="bg-gray-900 text-white rounded-2xl p-8 mb-6">
        <div class="flex items-center gap-4 mb-3">
          <svg class="w-12 h-12 text-red-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <div>
            <h1 class="text-2xl font-bold text-white">Security Bulletins</h1>
            <p class="text-gray-400 text-sm mt-1">Security advisories and incidents from AWS and GCP</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3 text-xs text-gray-400">
          <a href="https://aws.amazon.com/security/security-bulletins/" target="_blank" class="hover:text-red-400 transition">
            aws.amazon.com/security/security-bulletins ↗
          </a>
          <span class="text-gray-600">·</span>
          <a href="https://docs.cloud.google.com/support/bulletins" target="_blank" class="hover:text-blue-400 transition">
            cloud.google.com/support/bulletins ↗
          </a>
          <span class="text-gray-600">·</span>
          <a href="https://status.cloud.google.com" target="_blank" class="hover:text-blue-400 transition">
            status.cloud.google.com ↗
          </a>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <!-- Tabs -->
        <div class="flex gap-1 mb-5 border-b border-gray-100 pb-4">
          <button
            v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition', activeTab === tab.id ? tab.activeClass : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50']"
          >
            {{ tab.label }}
            <span class="ml-1 text-xs opacity-70">({{ tabCount(tab.id) }})</span>
          </button>
        </div>

        <div class="flex items-center justify-between mb-4">
          <input
            v-model="search"
            type="text"
            placeholder="Search bulletins..."
            class="flex-1 mr-4 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <span class="text-xs text-gray-400 shrink-0">Updated: {{ news.updated_at?.slice(0, 10) || '—' }}</span>
        </div>

        <ul class="space-y-3">
          <li v-for="b in filteredBulletins" :key="b.title + b.date" class="flex gap-3 text-sm items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <span class="text-gray-400 shrink-0 font-mono">{{ b.date }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Provider badge -->
                <span v-if="b.provider === 'aws'" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600 shrink-0">
                  AWS
                </span>
                <span v-else-if="b.provider === 'gcp'" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 shrink-0">
                  GCP
                </span>
                <!-- Tag badge -->
                <span :class="tagClass(b.tag)" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                  {{ b.tag === 'incident' ? 'Incident' : 'Security' }}
                </span>
                <!-- Severity badge -->
                <span v-if="b.severity" :class="severityClass(b.severity)" class="px-1.5 py-0.5 rounded text-xs font-medium shrink-0">
                  {{ b.severity }}
                </span>
                <!-- Active incident indicator -->
                <span v-if="b.status === true" class="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 shrink-0 animate-pulse">
                  Active
                </span>
                <a v-if="b.url" :href="b.url" target="_blank"
                  class="text-gray-700 hover:text-red-500 underline decoration-gray-300 hover:decoration-red-400 transition break-words">
                  {{ b.title }}
                </a>
                <span v-else class="text-gray-700">{{ b.title }}</span>
              </div>
            </div>
            <div class="shrink-0 flex gap-1">
              <button @click="copyForX(b)" :title="copiedId === b.title ? 'Copied!' : 'Copy post for X'" class="text-gray-400 hover:text-gray-700 transition">
                <svg v-if="copiedId !== b.title" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                <svg v-else class="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <button @click="shareOnLinkedIn(b)" title="Share on LinkedIn" class="text-blue-600 hover:text-blue-800 transition">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </button>
            </div>
          </li>
        </ul>
        <p v-if="!filteredBulletins.length && !loading" class="text-sm text-gray-400 mt-2">No bulletins match.</p>
      </div>
    </div>
  </DataLoader>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSecurityNews } from '../data/index.js'
import DataLoader from '../components/DataLoader.vue'

const news = ref({ bulletins: [], updated_at: '' })
const loading = ref(true)
const error = ref(null)
const search = ref('')
const activeTab = ref('all')
const copiedId = ref(null)

const tabs = [
  { id: 'all',      label: 'All',      activeClass: 'bg-gray-900 text-white' },
  { id: 'aws',      label: 'AWS',      activeClass: 'bg-orange-100 text-orange-700' },
  { id: 'gcp',      label: 'GCP',      activeClass: 'bg-blue-100 text-blue-700' },
  { id: 'incident', label: 'Incidents', activeClass: 'bg-red-100 text-red-700' },
]

async function load() {
  loading.value = true
  error.value = null
  try {
    news.value = await getSecurityNews()
  } catch (e) {
    if (e.message?.includes('404') || e.message?.includes('403')) {
      news.value = { bulletins: [], updated_at: '' }
    } else {
      error.value = e.message || 'Failed to load security bulletins'
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)

function tabCount(tabId) {
  const all = news.value.bulletins || []
  if (tabId === 'all') return all.length
  if (tabId === 'incident') return all.filter(b => b.tag === 'incident').length
  return all.filter(b => b.provider === tabId).length
}

function tagClass(tag) {
  return tag === 'incident'
    ? 'bg-yellow-50 text-yellow-700'
    : 'bg-red-50 text-red-600'
}

function severityClass(severity) {
  const s = (severity || '').toLowerCase()
  if (s === 'high' || s === 'alta' || s === 'critical') return 'bg-red-100 text-red-700'
  if (s === 'medium' || s === 'media') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-600'
}

function copyForX(b) {
  const provider = b.provider?.toUpperCase() || 'Cloud'
  const text = `🔒 [${provider} Security] ${b.title}\n\n${b.url || ''}\n\n#${provider} #Security #CloudSecurity #s3rv3rl3ss`
  navigator.clipboard.writeText(text)
  copiedId.value = b.title
  setTimeout(() => { copiedId.value = null }, 2000)
}

function shareOnLinkedIn(b) {
  const provider = b.provider?.toUpperCase() || 'Cloud'
  const text = `🔒 [${provider} Security] ${b.title}\n\n${b.url ? b.url + '\n\n' : ''}#${provider} #Security #CloudSecurity #s3rv3rl3ss`
  const url = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'width=600,height=500')
}

const filteredBulletins = computed(() => {
  let items = news.value.bulletins || []
  if (activeTab.value === 'incident') {
    items = items.filter(b => b.tag === 'incident')
  } else if (activeTab.value !== 'all') {
    items = items.filter(b => b.provider === activeTab.value)
  }
  const q = search.value.toLowerCase()
  if (!q) return items
  return items.filter(b => b.title.toLowerCase().includes(q) || b.date.includes(q))
})
</script>
