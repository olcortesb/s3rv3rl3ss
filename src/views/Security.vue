<template>
  <DataLoader :loading="loading" :error="error" @retry="load">
    <div class="max-w-3xl">
      <div class="bg-gray-900 text-white rounded-2xl p-8 mb-6">
        <div class="flex items-center gap-4 mb-3">
          <svg class="w-12 h-12 text-red-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <div>
            <h1 class="text-2xl font-bold text-white">AWS Security Bulletins</h1>
            <p class="text-gray-400 text-sm mt-1">Security advisories and vulnerability disclosures from AWS</p>
          </div>
        </div>
        <a href="https://aws.amazon.com/security/security-bulletins/" target="_blank"
          class="text-xs text-gray-400 hover:text-red-400 transition">
          aws.amazon.com/security/security-bulletins ↗
        </a>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">
            Bulletins
            <span class="text-xs font-normal text-gray-400 ml-1">({{ filteredBulletins.length }})</span>
          </h2>
          <span class="text-xs text-gray-400">Updated: {{ news.updated_at?.slice(0, 10) || '—' }}</span>
        </div>

        <input
          v-model="search"
          type="text"
          placeholder="Search bulletins..."
          class="w-full mb-4 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />

        <ul class="space-y-3">
          <li v-for="b in filteredBulletins" :key="b.title" class="flex gap-3 text-sm items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <span class="text-gray-400 shrink-0 font-mono">{{ b.date }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 shrink-0">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                  Security
                </span>
                <a v-if="b.url" :href="b.url" target="_blank"
                  class="text-gray-700 hover:text-red-500 underline decoration-gray-300 hover:decoration-red-400 transition break-words">
                  {{ b.title }}
                </a>
                <span v-else class="text-gray-700">{{ b.title }}</span>
              </div>
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

const filteredBulletins = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return news.value.bulletins || []
  return (news.value.bulletins || []).filter(b =>
    b.title.toLowerCase().includes(q) || b.date.includes(q)
  )
})
</script>
