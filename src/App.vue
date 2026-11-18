<template>
  <div class="min-h-screen bg-white flex flex-col">
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <router-link to="/" class="text-base font-bold tracking-tight text-white hover:text-zinc-300 transition inline-flex items-center gap-1.5">
          <img src="/icons/zap.svg" class="w-4 h-4 brightness-0 invert" /> s3rv3rl3ss
        </router-link>
        <nav class="flex gap-1">
          <router-link
            v-for="p in providers"
            :key="p.id"
            :to="`/${p.id}`"
            :class="[
              'px-3 py-1.5 text-sm font-medium transition',
              $route.path.startsWith(`/${p.id}`) ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'
            ]"
          >
            <span class="hidden md:inline">{{ p.name }}</span>
            <img :src="p.icon" :alt="p.name" class="w-4 h-4 md:hidden brightness-0 invert" />
          </router-link>
          <router-link
            to="/security"
            :class="[
              'px-3 py-1.5 text-sm font-medium transition',
              $route.path === '/security' ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'
            ]"
          >
            <span class="hidden sm:inline">Security</span>
          </router-link>
          <router-link
            to="/reinvent"
            :class="[
              'px-3 py-1.5 text-sm font-medium transition',
              $route.path === '/reinvent' ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'
            ]"
          >
            <span class="hidden sm:inline">re:Invent</span>
          </router-link>
          <router-link
            to="/tools"
            :class="[
              'px-3 py-1.5 text-sm font-medium transition',
              $route.path === '/tools' ? 'text-white border-b-2 border-white' : 'text-zinc-400 hover:text-white'
            ]"
          >
            <span class="hidden sm:inline">Tools</span>
          </router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-8 flex-1">
      <router-view :key="$route.fullPath" />
    </main>
    <footer class="border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <span>Built by <a href="https://linkedin.com/in/olcortesb" target="_blank" class="hover:text-gray-700 transition">olcortesb</a></span>
        <span>Updated daily · Last: {{ lastUpdated }}</span>
        <div class="flex items-center gap-4">
          <a href="https://github.com/olcortesb/s3rv3rl3ss/issues/new" target="_blank" class="hover:text-gray-700 transition">Feedback</a>
          <a href="https://x.com/olcortesb" target="_blank" class="hover:text-gray-700 transition">X</a>
          <a href="https://www.linkedin.com/in/oscarcortesbracho/" target="_blank" class="hover:text-gray-700 transition">LinkedIn</a>
          <a href="https://github.com/olcortesb/s3rv3rl3ss" target="_blank" class="hover:text-gray-700 transition">GitHub</a>
        </div>
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
