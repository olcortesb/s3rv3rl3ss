<template>
  <router-link
    :to="`/${provider}/${service.id}`"
    class="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border border-gray-100"
  >
    <div class="flex items-center gap-3 mb-2">
      <span class="text-2xl">{{ service.icon }}</span>
      <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
    </div>
    <span class="inline-block text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700 mb-2">
      {{ service.category }}
    </span>
    <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ service.description }}</p>
    <div class="flex flex-wrap gap-2 text-xs text-gray-400">
      <span v-if="service.limits">📊 {{ service.limits.length }} limits</span>
      <span v-if="service.runtimes">⚙️ {{ service.runtimes.filter(r => r.status === 'active').length }} runtimes</span>
    </div>
  </router-link>
</template>

<script setup>
defineProps({ service: Object, provider: String })
</script>
