<template>
  <div>
    <router-link to="/" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Home</router-link>

    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">📊 Project Metrics</h1>
      <p class="text-gray-500 text-sm">Real infrastructure costs and usage — this project runs on serverless</p>
      <p v-if="metrics" class="text-xs text-gray-400 mt-1">Last updated: {{ metrics.lastUpdated }}</p>
    </div>

    <div v-if="metrics">
      <!-- Cost card -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4">💰 Monthly Cost</h2>
        <div class="text-center mb-4">
          <span class="text-4xl font-bold text-green-600">{{ metrics.cost.monthly.total }}</span>
          <span class="text-gray-400 text-sm block mt-1">{{ metrics.cost.note }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="(value, service) in metrics.cost.monthly" :key="service" v-show="service !== 'total'" class="text-center p-3 bg-gray-50 rounded-lg">
            <div class="text-xs text-gray-500 capitalize">{{ service }}</div>
            <div class="text-sm font-medium text-gray-900">{{ value }}</div>
          </div>
        </div>
      </div>

      <!-- Infrastructure -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4">🏗️ Infrastructure</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ metrics.infrastructure.lambdaFunctions }}</div>
            <div class="text-xs text-gray-500">Lambda Functions</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ metrics.infrastructure.architecture }}</div>
            <div class="text-xs text-gray-500">Architecture</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(metrics.infrastructure.dynamodbItems) }}</div>
            <div class="text-xs text-gray-500">DynamoDB Items</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ metrics.infrastructure.s3Objects }}</div>
            <div class="text-xs text-gray-500">S3 Objects</div>
          </div>
        </div>
      </div>

      <!-- Today -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">⚡ Today <span class="text-xs font-normal text-gray-400">(Lambda executions)</span></h2>
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
              <div class="text-2xl font-bold" :class="metrics.today.errors > 0 ? 'text-red-500' : 'text-green-600'">{{ metrics.today.errors }}</div>
              <div class="text-xs text-gray-500">Errors</div>
            </div>
          </div>
          <div v-if="Object.keys(metrics.today.functions).length" class="space-y-2">
            <div v-for="(fn, name) in metrics.today.functions" :key="name" class="flex justify-between text-sm">
              <span class="text-gray-600">{{ name }}</span>
              <span class="text-gray-400">{{ fn.invocations }}× · {{ fn.avgDurationMs }}ms</span>
            </div>
          </div>
        </div>

        <!-- Month -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">📅 This Month <span class="text-xs font-normal text-gray-400">(Lambda executions)</span></h2>
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
              <div class="text-2xl font-bold" :class="metrics.month.errors > 0 ? 'text-red-500' : 'text-green-600'">{{ metrics.month.errors }}</div>
              <div class="text-xs text-gray-500">Errors</div>
            </div>
          </div>
          <div v-if="Object.keys(metrics.month.functions).length" class="space-y-2">
            <div v-for="(fn, name) in metrics.month.functions" :key="name" class="flex justify-between text-sm">
              <span class="text-gray-600">{{ name }}</span>
              <span class="text-gray-400">{{ fn.invocations }}× · {{ formatDuration(fn.totalDurationMs) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tech stack -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">🛠️ Tech Stack</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="tech in techStack" :key="tech" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{{ tech }}</span>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 py-12">
      Loading metrics...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const metrics = ref(null)

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

onMounted(async () => {
  try {
    const mod = await import('../data/metrics.json')
    metrics.value = mod.default
  } catch {
    metrics.value = null
  }
})

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
