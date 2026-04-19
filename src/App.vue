<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-gray-900 text-white shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold tracking-tight hover:text-orange-400 transition">
          ⚡ s3rv3rl3ss
        </router-link>
        <nav class="flex gap-2">
          <router-link
            v-for="p in providers"
            :key="p.id"
            :to="`/${p.id}`"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition',
              $route.path.startsWith(`/${p.id}`)
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            {{ p.icon }} {{ p.name }}
          </router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-8 flex-1">
      <router-view />
    </main>
    <footer class="border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <span>Built by
          <a href="https://linkedin.com/in/olcortesb" target="_blank" class="hover:text-orange-400 transition">olcortesb</a>
        </span>
        <span class="flex items-center gap-1">
          🔄 Updated daily · Last: {{ lastUpdated }}
        </span>
        <a href="https://github.com/olcortesb/s3rv3rl3ss" target="_blank" class="hover:text-orange-400 transition">GitHub</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { providers } from './data/index.js'
import awsData from './data/services-aws.json'

const lastUpdated = awsData.lastUpdated
</script>
