<template>
  <div>

    <div class="border-b border-gray-200 pb-8 mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-1">Project Metrics</h1>
      <p class="text-gray-400 text-sm">Real infrastructure costs and usage — this project runs on serverless</p>
      <p v-if="metrics" class="text-xs text-gray-500 mt-3">Last updated: {{ metrics.lastUpdated }}</p>
    </div>

    <DataLoader :loading="loading" :error="error" @retry="load">
    <div>
      <!-- Cost card -->
      <div class="border-b border-gray-100 py-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4 text-center">Monthly Cost</h2>
        <div class="text-center mb-4">
          <span class="text-4xl font-bold text-gray-900">{{ metrics.cost.monthly.total }}</span>
          <span class="text-gray-400 text-sm block mt-1">{{ metrics.cost.note }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="(value, service) in metrics.cost.monthly" :key="service" v-show="service !== 'total'" class="text-center p-3 bg-gray-50">
            <div class="text-xs text-gray-500 capitalize">{{ service }}</div>
            <div class="text-sm font-medium text-gray-900">{{ value }}</div>
          </div>
        </div>
      </div>

      <!-- Infrastructure -->
      <div class="border-b border-gray-200 pb-6 mb-6">
        <h2 class="font-bold text-gray-900 mb-4">Infrastructure</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ metrics.infrastructure.lambdaFunctions }}</div>
            <div class="text-xs text-gray-400">Lambda Functions</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ metrics.infrastructure.architecture }}</div>
            <div class="text-xs text-gray-400">Architecture</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(metrics.infrastructure.dynamodbItems) }}</div>
            <div class="text-xs text-gray-400">DynamoDB Items</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ metrics.infrastructure.s3Objects }}</div>
            <div class="text-xs text-gray-400">S3 Objects</div>
          </div>
        </div>
      </div>

      <!-- Today -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="border-b border-gray-100 py-6">
          <h2 class="font-semibold text-gray-900 mb-4">Today <span class="text-xs font-normal text-gray-400">(Lambda executions)</span></h2>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ metrics.today.invocations }}</div>
              <div class="text-xs text-gray-500">Invocations</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ formatDuration(metrics.today.totalDurationMs) }}</div>
              <div class="text-xs text-gray-500">Total Duration</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold" :class="metrics.today.errors > 0 ? 'text-gray-900' : 'text-gray-900'">{{ metrics.today.errors }}</div>
              <div class="text-xs text-gray-500">Errors</div>
            </div>
          </div>
          <div v-if="Object.keys(metrics.today.functions).length" class="space-y-2">
            <div v-for="(fn, name) in metrics.today.functions" :key="name" class="flex justify-between text-sm">
              <span class="text-gray-600">{{ name }}</span>
              <span class="text-gray-400">
                {{ fn.invocations }}× · {{ fn.avgDurationMs }}ms
                <span v-if="fn.errors > 0" class="ml-1 text-gray-400">· {{ fn.errors }} err</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Month -->
        <div class="border-b border-gray-100 py-6">
          <h2 class="font-semibold text-gray-900 mb-4">This Month <span class="text-xs font-normal text-gray-400">(Lambda executions)</span></h2>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ metrics.month.invocations }}</div>
              <div class="text-xs text-gray-500">Invocations</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ formatDuration(metrics.month.totalDurationMs) }}</div>
              <div class="text-xs text-gray-500">Total Duration</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold" :class="metrics.month.errors > 0 ? 'text-gray-900' : 'text-gray-900'">{{ metrics.month.errors }}</div>
              <div class="text-xs text-gray-500">Errors</div>
            </div>
          </div>
          <div v-if="Object.keys(metrics.month.functions).length" class="space-y-2">
            <div v-for="(fn, name) in metrics.month.functions" :key="name" class="flex justify-between text-sm">
              <span class="text-gray-600">{{ name }}</span>
              <span class="text-gray-400">
                {{ fn.invocations }}× · {{ formatDuration(fn.totalDurationMs) }}
                <span v-if="fn.errors > 0" class="ml-1 text-gray-400">· {{ fn.errors }} err</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tech stack -->
      <div class="border-b border-gray-100 py-6">
        <h2 class="font-semibold text-gray-900 mb-4">Tech Stack</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="tech in techStack" :key="tech" class="px-3 py-1 bg-gray-100 text-gray-700 text-xs">{{ tech }}</span>
        </div>
      </div>

      <!-- Site Visits -->
      <div v-if="visits" class="border-t border-gray-200 pt-6 mt-6">
        <h2 class="font-bold text-gray-900 mb-4">Site Visits</h2>
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-900">{{ formatNumber(visits.total) }}</div>
            <div class="text-xs text-gray-400 mt-1">Total visits</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-900">{{ formatNumber(visits.yesterday) }}</div>
            <div class="text-xs text-gray-400 mt-1">Yesterday</div>
          </div>
        </div>
        <div v-if="visits.last_30_days && visits.last_30_days.length">
          <div class="text-xs text-gray-400 mb-3">Last 30 days</div>
          <div class="flex items-end gap-0.5 h-16">
            <div
              v-for="day in visits.last_30_days"
              :key="day.date"
              class="relative flex-1 group"
              style="height: 100%"
            >
              <div
                class="absolute bottom-0 w-full bg-gray-400 opacity-80 group-hover:opacity-100 transition-opacity"
                :style="{ height: maxVisits > 0 ? `${Math.max(4, (day.visits / maxVisits) * 100)}%` : '4%' }"
              />
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
                <div class="bg-white text-gray-900 text-xs rounded px-2 py-1 whitespace-nowrap shadow">
                  <div class="font-semibold">{{ day.visits }}</div>
                  <div class="text-gray-400">{{ day.date }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ visits.last_30_days[0]?.date }}</span>
            <span>{{ visits.last_30_days[visits.last_30_days.length - 1]?.date }}</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-4">Updated: {{ visits.updated_at }} · Bots filtered · Data from CloudFront logs</p>
      </div>
    </div>
    </DataLoader>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DataLoader from '../components/DataLoader.vue'
import { getMetrics, getVisits } from '../data/index.js'

const metrics = ref(null)
const visits = ref(null)
const loading = ref(true)
const error = ref(null)

const maxVisits = computed(() => {
  if (!visits.value?.last_30_days?.length) return 0
  return Math.max(...visits.value.last_30_days.map(d => d.visits))
})

const techStack = [
  'AWS Lambda (arm64)',
  'Python 3.12',
  'DynamoDB (on-demand)',
  'S3',
  'EventBridge',
  'SAM / CloudFormation',
  'GitHub API',
  'Vue 3 + Vite',
  'Tailwind CSS',
  'AWS Amplify',
]

async function load() {
  loading.value = true
  error.value = null
  try {
    metrics.value = await getMetrics()
    visits.value = await getVisits()
  } catch (e) {
    error.value = e.message || 'Failed to load metrics'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatDuration(ms) {
  if (!ms) return '0s'
  if (ms < 1000) return `${Math.round(ms)}ms`
  const totalSeconds = Math.floor(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

function formatNumber(n) {
  if (!n) return '0'
  return n.toLocaleString()
}
</script>
