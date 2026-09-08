<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-gray-900 text-white shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold tracking-tight hover:text-gray-300 transition inline-flex items-center gap-1.5">
          <img src="/icons/zap.svg" class="w-5 h-5 brightness-0 invert" /> s3rv3rl3ss
        </router-link>
        <nav class="flex gap-2">
          <router-link
            to="/tools"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition inline-flex items-center gap-1.5',
              $route.path === '/tools'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            <img src="/icons/tools.svg" class="w-3.5 h-3.5 brightness-0 invert" /> Tools
          </router-link>
          <router-link
            to="/reinvent"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition inline-flex items-center gap-1.5',
              $route.path === '/reinvent'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            <img src="/icons/reinvent.svg" class="w-3.5 h-3.5 brightness-0 invert" /> re:Invent
          </router-link>
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
            <img :src="p.icon" :alt="p.name" class="w-4 h-4 inline-block brightness-0 invert" /> {{ p.name }}
          </router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-8 flex-1">
      <router-view :key="$route.fullPath" />
    </main>
    <footer class="border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>Built by
          <a href="https://linkedin.com/in/olcortesb" target="_blank" class="hover:text-orange-400 transition">olcortesb</a>
        </span>
        <span>Updated daily · Last: {{ lastUpdated }}</span>
        <a href="https://github.com/olcortesb/s3rv3rl3ss" target="_blank" class="hover:text-orange-400 transition">GitHub</a>
      </div>
      <div class="max-w-6xl mx-auto px-4 pb-3 text-center text-xs text-gray-400">
        This site does not collect personal data or use cookies.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { providers, getProviderData } from './data/index.js'

const lastUpdated = ref('')

onMounted(async () => {
  const data = await getProviderData('aws')
  lastUpdated.value = data.lastUpdated
})
</script>
