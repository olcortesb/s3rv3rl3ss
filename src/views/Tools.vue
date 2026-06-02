<template>
  <div>
    <router-link to="/" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Home</router-link>

    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">🛠️ AWS Local Dev Tools</h1>
      <p class="text-gray-500 text-sm">Compare AWS service emulators for local development</p>
      <p class="text-xs text-gray-400 mt-1">Last updated: {{ tools.lastUpdated }}</p>
    </div>

    <!-- Tool cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div v-for="tool in tools.tools" :key="tool.id" class="bg-white rounded-2xl border border-gray-100 p-6">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <img :src="`/icons/tools/${tool.id}.png`" :alt="tool.name" class="w-10 h-10 rounded-lg" @error="$event.target.style.display='none'" />
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ tool.name }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ tool.description }}</p>
            </div>
          </div>
          <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full shrink-0 ml-2">v{{ tool.version }}</span>
        </div>

        <div class="flex flex-wrap gap-1 mb-3">
          <span v-for="tech in tool.technology" :key="tech" class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{{ tech }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{{ tool.license }}</span>
        </div>

        <p class="text-xs text-gray-400 mb-2">{{ tool.serviceCount || tool.services.length }} services supported</p>

        <div class="flex gap-3">
          <a :href="tool.url" target="_blank" class="text-xs text-orange-500 hover:underline">Website ↗</a>
          <a v-if="tool.repoUrl" :href="tool.repoUrl" target="_blank" class="text-xs text-gray-500 hover:underline">GitHub ↗</a>
        </div>
      </div>
    </div>

    <!-- Performance comparison -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h2 class="font-semibold text-gray-900 mb-1">Performance</h2>
      <p class="text-xs text-gray-400 mb-4">Measured with fresh containers (docker pull + cold start), no cache, no preloaded data. Updated daily via CodeBuild.</p>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="text-left py-2 px-3 text-gray-500 font-normal"></th>
            <th v-for="tool in tools.tools" :key="tool.id" class="text-center py-2 px-3 text-gray-500 font-normal">{{ tool.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-100">
            <td class="py-2 px-3 text-gray-700 font-medium">Startup time</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-gray-900">{{ tool.performance?.startupTime || '—' }}</td>
          </tr>
          <tr class="border-b border-gray-100">
            <td class="py-2 px-3 text-gray-700 font-medium">Memory (idle)</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-gray-900">{{ tool.performance?.memoryIdle || '—' }}</td>
          </tr>
          <tr class="border-b border-gray-100">
            <td class="py-2 px-3 text-gray-700 font-medium">Docker image</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-gray-900">{{ tool.performance?.imageSize || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Technology comparison -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h2 class="font-semibold text-gray-900 mb-4">Technology</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="text-left py-2 px-3 text-gray-500 font-normal"></th>
            <th v-for="tool in tools.tools" :key="tool.id" class="text-center py-2 px-3 text-gray-500 font-normal">{{ tool.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-100">
            <td class="py-2 px-3 text-gray-700 font-medium">Language</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-gray-900">{{ tool.technology.join(', ') }}</td>
          </tr>
          <tr class="border-b border-gray-100">
            <td class="py-2 px-3 text-gray-700 font-medium">License</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-gray-900">{{ tool.license }}</td>
          </tr>
          <tr class="border-b border-gray-100">
            <td class="py-2 px-3 text-gray-700 font-medium">Version</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-gray-900">{{ tool.version }}</td>
          </tr>
          <tr class="border-b border-gray-100">
            <td class="py-2 px-3 text-gray-700 font-medium">Price</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center font-medium" :class="tool.price === '$0 forever' || tool.price === 'Free' ? 'text-green-600' : 'text-orange-600'">{{ tool.price }}</td>
          </tr>
          <tr>
            <td class="py-2 px-3 text-gray-700 font-medium">Services (free)</td>
            <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center text-gray-900">
              <span v-if="tool.serviceCount === 0 && tool.paidServiceCount > 0">0 <span class="text-xs text-orange-500">({{ tool.paidServiceCount }} paid)</span></span>
              <span v-else-if="tool.serviceMeta && tool.serviceMeta.native">{{ tool.serviceCount || tool.services.length }} <span class="text-xs text-gray-500">({{ tool.serviceMeta.native.length }} native + {{ tool.serviceMeta.moto.length }} moto)</span></span>
              <span v-else>{{ tool.serviceCount || tool.services.length }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Services comparison table -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 class="font-semibold text-gray-900 mb-4">Services Supported</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="text-left py-2 px-3 text-gray-500 font-normal">Service</th>
              <th v-for="tool in tools.tools" :key="tool.id" class="text-center py-2 px-3 text-gray-500 font-normal">{{ tool.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in allServices" :key="service" class="border-b border-gray-100 last:border-0">
              <td class="py-2 px-3 text-gray-700 font-medium">{{ displayName(service) }}</td>
              <td v-for="tool in tools.tools" :key="tool.id" class="py-2 px-3 text-center">
                <span v-if="tool.services.includes(service)" class="text-green-600">✓</span>
                <span v-else-if="tool.paidServices && tool.paidServices.includes(service)" class="text-orange-500" title="Paid">💰</span>
                <span v-else class="text-gray-300">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import tools from '../data/tools.json'

const allServices = computed(() => {
  const set = new Set()
  for (const tool of tools.tools) {
    for (const s of tool.services) set.add(s)
    if (tool.paidServices) {
      for (const s of tool.paidServices) set.add(s)
    }
  }
  return [...set].sort((a, b) => displayName(a).localeCompare(displayName(b)))
})

const displayName = (service) => {
  return tools.serviceDisplayNames?.[service] || service
}
</script>
