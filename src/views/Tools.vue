<template>
  <div>
    <DataLoader :loading="loading" :error="error" @retry="load">
    <div>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">AWS Local Dev Tools</h1>
      <p class="text-xs text-gray-400 mt-1 mb-3">Updated {{ tools.lastUpdated }}</p>
      <p class="text-sm text-gray-500 leading-relaxed max-w-2xl">
        Data collected daily by a Lambda that queries the GitHub API for versions and stars,
        then reads Docker metrics from a CodeBuild run that pulls each image fresh, starts the container,
        hits the health endpoint to list supported services, and measures startup time and idle memory.
      </p>
      <div class="mt-3 bg-gray-900 rounded-xl px-4 py-3 font-mono text-xs text-gray-300 space-y-1 max-w-2xl">
        <div><span class="text-gray-500"># pull and start any tool locally</span></div>
        <div>docker run --rm -p 4566:4566 ministackorg/ministack:latest</div>
        <div>docker run --rm -p 4566:4566 floci/floci:latest</div>
        <div>docker run --rm -p 4566:4566 localstack/localstack:latest</div>
        <div>docker run --rm -p 4569:4566 jackdanger/robotocore:latest</div>
        <div class="pt-1"><span class="text-gray-500"># verify it's running</span></div>
        <div>curl http://localhost:4566/_localstack/health</div>
      </div>
    </div>

    <!-- Tool cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div v-for="tool in tools.tools" :key="tool.id"
        class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <img :src="`/icons/tools/${tool.id}.png`" :alt="tool.name"
              class="w-9 h-9 rounded-lg object-contain"
              @error="$event.target.style.display='none'" />
            <div>
              <h2 class="text-sm font-bold text-gray-900">{{ tool.name }}</h2>
              <p class="text-xs text-gray-400 mt-0.5 leading-snug">{{ tool.description }}</p>
            </div>
          </div>
          <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full shrink-0 ml-2 font-mono">v{{ tool.version }}</span>
        </div>

        <div class="flex flex-wrap gap-1 mb-3">
          <span v-for="tech in tool.technology" :key="tech"
            class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{{ tech }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full"
            :class="tool.price === '$0 forever' || tool.price === 'Free' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'">
            {{ tool.price }}
          </span>
        </div>

        <p class="text-xs text-gray-400 mb-3">{{ tool.serviceCount || tool.services.length }} services supported</p>

        <div class="flex gap-3">
          <a :href="tool.url" target="_blank" class="text-xs text-orange-500 hover:underline">Website ↗</a>
          <a v-if="tool.repoUrl" :href="tool.repoUrl" target="_blank" class="text-xs text-gray-400 hover:text-orange-500">GitHub ↗</a>
        </div>
      </div>
    </div>

    <!-- Performance -->
    <div class="mb-4">
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Performance</h2>
      <p class="text-xs text-gray-400 mb-2 px-1">Fresh containers, no cache. Updated daily via CodeBuild.</p>
      <div class="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table class="w-full text-sm min-w-[400px]">
          <tbody>
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">Startup time</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs text-gray-900 font-medium">{{ tool.performance?.startupTime || '—' }}</td>
            </tr>
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">Memory (idle)</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs text-gray-900 font-medium">{{ tool.performance?.memoryIdle || '—' }}</td>
            </tr>
            <tr class="hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">Docker image</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs text-gray-900 font-medium">{{ tool.performance?.imageSize || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Technology -->
    <div class="mb-4">
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Technology</h2>
      <div class="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table class="w-full text-sm min-w-[400px]">
          <tbody>
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">Language</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs text-gray-900">{{ tool.technology.join(', ') }}</td>
            </tr>
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">License</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs text-gray-900">{{ tool.license }}</td>
            </tr>
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">Version</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs font-mono text-gray-900">{{ tool.version }}</td>
            </tr>
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">Price</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs font-medium"
                :class="tool.price === '$0 forever' || tool.price === 'Free' ? 'text-green-600' : 'text-orange-600'">
                {{ tool.price }}
              </td>
            </tr>
            <tr class="hover:bg-gray-50/50 transition-colors">
              <td class="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">Services (free)</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2.5 px-3 text-center text-xs text-gray-900">
                <span v-if="tool.serviceCount === 0 && tool.paidServiceCount > 0">0 <span class="text-orange-500">({{ tool.paidServiceCount }} paid)</span></span>
                <span v-else-if="tool.serviceMeta?.native">{{ tool.serviceCount || tool.services.length }} <span class="text-gray-400">({{ tool.serviceMeta.native.length }} native + {{ tool.serviceMeta.moto.length }} moto)</span></span>
                <span v-else>{{ tool.serviceCount || tool.services.length }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Services supported -->
    <div>
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Services Supported</h2>
      <div class="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table class="w-full text-sm min-w-[400px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left py-2 px-4 text-xs text-gray-400 font-normal">Service</th>
              <th v-for="tool in tools.tools" :key="tool.id" class="text-center py-2 px-3 text-xs text-gray-400 font-normal">{{ tool.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in allServices" :key="service"
              class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <td class="py-2 px-4 text-xs text-gray-700">{{ displayName(service) }}</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-xs">
                <span v-if="tool.services.includes(service)" class="text-green-500">✓</span>
                <span v-else-if="tool.paidServices?.includes(service)" class="text-orange-400" title="Paid">💰</span>
                <span v-else class="text-gray-200">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    </div>
    </DataLoader>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DataLoader from '../components/DataLoader.vue'
import { getTools } from '../data/index.js'

const tools = ref({ tools: [], serviceDisplayNames: {} })
const loading = ref(true)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    tools.value = await getTools()
  } catch (e) {
    error.value = e.message || 'Failed to load tools'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const allServices = computed(() => {
  const set = new Set()
  for (const tool of tools.value.tools) {
    for (const s of tool.services) set.add(s)
    if (tool.paidServices) {
      for (const s of tool.paidServices) set.add(s)
    }
  }
  return [...set].sort((a, b) => displayName(a).localeCompare(displayName(b)))
})

const displayName = (service) => {
  return tools.value.serviceDisplayNames?.[service] || service
}
</script>
