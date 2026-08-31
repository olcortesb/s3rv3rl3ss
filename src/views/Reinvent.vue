<template>
  <div>
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-1">🎪 re:Invent 2026</h1>
      <p class="text-gray-500 text-sm">November 30 – December 4, 2026 · Las Vegas</p>
    </div>

    <!-- Countdown -->
    <div class="bg-gray-900 text-white rounded-2xl p-8 mb-8 text-center">
      <p class="text-gray-400 text-sm mb-3">Starts in</p>
      <div class="flex justify-center gap-8">
        <div>
          <div class="text-5xl font-bold text-orange-400">{{ countdown.days }}</div>
          <div class="text-xs text-gray-400 mt-1">days</div>
        </div>
        <div>
          <div class="text-5xl font-bold text-orange-400">{{ countdown.hours }}</div>
          <div class="text-xs text-gray-400 mt-1">hours</div>
        </div>
        <div>
          <div class="text-5xl font-bold text-orange-400">{{ countdown.minutes }}</div>
          <div class="text-xs text-gray-400 mt-1">minutes</div>
        </div>
      </div>
      <p v-if="reinvent" class="text-xs text-gray-500 mt-4">Data last updated: {{ reinvent.lastUpdated }}</p>
    </div>

    <DataLoader :loading="loading" :error="error" @retry="load">

      <!-- This Week's Pace -->
      <div v-if="pace" class="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-6">
        <div class="text-center">
          <div class="text-4xl font-bold" :class="pace.delta >= 0 ? 'text-orange-500' : 'text-gray-400'">{{ pace.current }}</div>
          <div class="text-xs text-gray-400 mt-1">changes this week</div>
        </div>
        <div class="text-2xl">{{ pace.delta > 0 ? '🔺' : pace.delta < 0 ? '🔻' : '➡️' }}</div>
        <div class="text-sm text-gray-500">
          <span class="font-medium" :class="pace.delta >= 0 ? 'text-orange-500' : 'text-red-400'">{{ pace.delta >= 0 ? '+' : '' }}{{ pace.delta }}</span>
          vs last week ({{ pace.previous }})
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4">📈 AWS Activity Timeline</h2>
        <div v-if="reinvent?.activityTimeline?.length">
          <div class="flex items-end gap-1" style="height: 96px">
            <div
              v-for="week in reinvent.activityTimeline"
              :key="week.week"
              class="flex-1 bg-orange-400 rounded-t hover:bg-orange-500 transition cursor-default"
              :style="{ height: barHeight(week.changes) + 'px' }"
              :title="`${week.week}: ${week.changes} changes`"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span v-for="label in timelineLabels" :key="label">{{ label }}</span>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          <span class="text-gray-400 text-sm">🚧 Available from Nov 17</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Top Services -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-1">🏆 Most Active Services</h2>
          <p class="text-xs text-gray-400 mb-4">Last 180 days</p>
          <div v-if="reinvent?.topServices?.length" class="space-y-3">
            <div v-for="svc in reinvent.topServices.slice(0, 8)" :key="svc.service" class="flex items-center gap-3">
              <router-link :to="`/aws/${svc.service}`" class="text-sm text-gray-700 hover:text-orange-500 w-32 truncate shrink-0">{{ svc.name }}</router-link>
              <div class="flex-1 bg-gray-100 rounded-full h-2">
                <div class="bg-orange-400 h-2 rounded-full" :style="{ width: svc.percentage + '%' }"></div>
              </div>
              <span class="text-xs text-gray-400 shrink-0">{{ svc.changes }}</span>
              <span class="text-xs shrink-0">{{ trendIcon(svc.trend) }}</span>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
            <span class="text-gray-400 text-sm">🚧 Available from Nov 17</span>
          </div>
        </div>

        <!-- Hot Services -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-1">🔥 Hot Right Now</h2>
          <p class="text-xs text-gray-400 mb-4">Last 30 days</p>
          <div v-if="reinvent?.hotServices?.length" class="space-y-2">
            <div v-for="svc in reinvent.hotServices.slice(0, 8)" :key="svc.service" class="flex items-center justify-between">
              <router-link :to="`/aws/${svc.service}`" class="text-sm text-gray-700 hover:text-orange-500">{{ svc.name }}</router-link>
              <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">+{{ svc.recentChanges }}</span>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
            <span class="text-gray-400 text-sm">🚧 Available from Nov 30</span>
          </div>
        </div>
      </div>

      <!-- Changes by type -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-1">📊 Changes by Type</h2>
        <p class="text-xs text-gray-400 mb-4">Last 180 days</p>
        <div v-if="reinvent?.changesByType" class="flex flex-wrap gap-3">
          <div v-for="(count, type) in reinvent.changesByType" :key="type" class="text-center px-4 py-3 bg-gray-50 rounded-xl">
            <div class="text-2xl font-bold text-gray-900">{{ count }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ typeLabel(type) }}</div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          <span class="text-gray-400 text-sm">🚧 Available from Nov 17</span>
        </div>
      </div>

      <!-- Recent News -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-1">📰 Recent Announcements</h2>
        <p class="text-xs text-gray-400 mb-4">Last 20 news with URL</p>
        <div v-if="reinvent?.recentNews?.length" class="space-y-2">
          <div v-for="n in reinvent.recentNews.slice(0, 10)" :key="n.title" class="flex gap-3 text-sm">
            <span class="text-gray-400 shrink-0">{{ n.date }}</span>
            <router-link :to="`/aws/${n.service}`" class="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 shrink-0">{{ n.service }}</router-link>
            <span v-if="n.reinvent" class="text-xs shrink-0">🎪</span>
          <a :href="n.url" target="_blank" class="text-gray-700 hover:text-orange-500 underline decoration-gray-200">{{ n.title }}</a>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          <span class="text-gray-400 text-sm">🚧 Available from Nov 30</span>
        </div>
      </div>

    </DataLoader>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DataLoader from '../components/DataLoader.vue'

const REINVENT_START = new Date('2026-11-30T09:00:00-08:00')
const CLOUDFRONT_URL = 'https://d2p0oqeck3arvl.cloudfront.net'

const reinvent = ref(null)
const loading = ref(true)
const error = ref(null)
const now = ref(new Date())

let timer = null

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 60000)
  load()
})

onUnmounted(() => clearInterval(timer))

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${CLOUDFRONT_URL}/data/reinvent.json`)
    if (res.ok) reinvent.value = await res.json()
  } catch {
    // reinvent.json not yet available — WIP state, not an error
  } finally {
    loading.value = false
  }
}

const countdown = computed(() => {
  const diff = REINVENT_START - now.value
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes }
})

const maxChanges = computed(() =>
  Math.max(...(reinvent.value?.activityTimeline || []).map(w => w.changes), 1)
)

const timelineLabels = computed(() => {
  const t = reinvent.value?.activityTimeline
  if (!t?.length) return []
  const count = 5
  const step = Math.floor((t.length - 1) / (count - 1))
  return Array.from({ length: count }, (_, i) => {
    const idx = Math.min(i * step, t.length - 1)
    return t[idx].week.slice(0, 7)
  })
})

const pace = computed(() => {
  const timeline = reinvent.value?.activityTimeline
  if (!timeline || timeline.length < 2) return null
  const current = timeline[timeline.length - 1].changes
  const previous = timeline[timeline.length - 2].changes
  return { current, previous, delta: current - previous }
})

function barHeight(changes) {
  return Math.max(4, Math.round((changes / maxChanges.value) * 96))
}

function trendIcon(trend) {
  return { up: '🔺', down: '🔻', stable: '➡️' }[trend] || ''
}

const TYPE_LABELS = {
  new_news: 'News',
  quota_changed: 'Quota changes',
  quota_added: 'Quotas added',
  quota_removed: 'Quotas removed',
  service_added: 'New services',
  new_runtime: 'New runtimes',
  runtime_changed: 'Runtime changes',
  runtime_removed: 'Runtimes removed',
}

function typeLabel(type) {
  return TYPE_LABELS[type] || type
}
</script>
