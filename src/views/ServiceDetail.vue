<template>
  <div v-if="service">
    <router-link :to="`/${provider}`" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Back</router-link>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-3xl">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-4xl">{{ service.icon }}</span>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ service.name }}</h1>
          <span class="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
            {{ service.category }}
          </span>
        </div>
      </div>

      <p class="text-gray-700 mb-6">{{ service.description }}</p>

      <h2 class="font-semibold text-gray-900 mb-2">Use Cases</h2>
      <div class="flex flex-wrap gap-2 mb-6">
        <span v-for="uc in service.useCases" :key="uc" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {{ uc }}
        </span>
      </div>

      <div v-if="service.runtimes" class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Runtime Support</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="rt in service.runtimes"
            :key="rt.name"
            :class="[
              'px-3 py-1 rounded-full text-sm',
              rt.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500 line-through'
            ]"
          >
            {{ rt.name }}
          </span>
        </div>
      </div>

      <div v-if="service.limits" class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Limits & Quotas</h2>
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="l in service.limits" :key="l.name" class="border-b border-gray-100">
              <td class="py-2 text-gray-500 pr-4">{{ l.name }}</td>
              <td class="py-2 text-gray-900 font-medium">{{ l.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="service.news" class="mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">News</h2>
        <ul class="space-y-2">
          <li v-for="n in service.news" :key="n.title" class="flex gap-3 text-sm">
            <span class="text-gray-400 shrink-0">{{ n.date }}</span>
            <span class="text-gray-700">{{ n.title }}</span>
          </li>
        </ul>
      </div>

      <h2 class="font-semibold text-gray-900 mb-2">Pricing</h2>
      <p class="text-gray-600 mb-6">{{ service.pricing }}</p>

      <a :href="service.url" target="_blank" class="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">
        View on {{ provider.toUpperCase() }} →
      </a>
    </div>
  </div>
  <div v-else class="text-center text-gray-400 mt-12">Service not found.</div>
</template>

<script setup>
import { computed } from 'vue'
import { getProviderData } from '../data/index.js'

const props = defineProps({ provider: String, id: String })
const providerData = getProviderData(props.provider)
const service = computed(() => providerData?.services.find(s => s.id === props.id))
</script>
