<template>
  <div>
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">AWS Serverless Services</h1>
      <p class="text-gray-500">Explore serverless services to build modern applications</p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
      <SearchBar v-model="search" />
      <CategoryFilter :categories="categories" :modelValue="selectedCategory" @select="selectedCategory = $event" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ServiceCard v-for="s in filtered" :key="s.id" :service="s" />
    </div>

    <p v-if="!filtered.length" class="text-center text-gray-400 mt-12">No services found.</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import data from '../data/services.json'
import SearchBar from '../components/SearchBar.vue'
import ServiceCard from '../components/ServiceCard.vue'
import CategoryFilter from '../components/CategoryFilter.vue'

const search = ref('')
const selectedCategory = ref('')

const enabledServices = data.services.filter(s => s.enabled)
const categories = [...new Set(enabledServices.map(s => s.category))].sort()

const fuse = new Fuse(enabledServices, {
  keys: ['name', 'description', 'category', 'useCases'],
  threshold: 0.3,
})

const filtered = computed(() => {
  let results = search.value
    ? fuse.search(search.value).map(r => r.item)
    : enabledServices

  if (selectedCategory.value) {
    results = results.filter(s => s.category === selectedCategory.value)
  }
  return results
})
</script>
