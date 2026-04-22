<template>
  <router-link
    :to="`/${provider}/${service.id}`"
    class="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border border-gray-100 relative"
  >
    <span v-if="badge" :class="badgeClass" class="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full">
      {{ badge }}
    </span>
    <div class="flex items-center gap-3 mb-2">
      <img :src="`/icons/aws/${service.id}.svg`" :alt="service.name" class="w-8 h-8" />
      <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
    </div>
    <span class="inline-block text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 mb-2">
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
import { computed } from 'vue'

const props = defineProps({ service: Object, provider: String })

const badge = computed(() => {
  if (!props.service.news?.length) return null
  const latest = props.service.news[0].date
  if (!latest) return null
  const now = new Date()
  const newsDate = new Date(latest + '-01')
  const days = Math.floor((now - newsDate) / (1000 * 60 * 60 * 24))
  if (days <= 7) return 'New'
  if (days <= 30) return 'Updated'
  return null
})

const badgeClass = computed(() =>
  badge.value === 'New'
    ? 'bg-green-100 text-green-700'
    : 'bg-blue-100 text-blue-700'
)
</script>
