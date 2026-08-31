<template>
  <div v-if="loading" class="text-center text-gray-400 py-12">
    <slot name="loading">Loading...</slot>
  </div>
  <div v-else-if="error" class="text-center py-12">
    <p class="text-red-400 text-sm mb-3">{{ error }}</p>
    <button @click="$emit('retry')" class="text-xs text-orange-500 hover:underline">Retry</button>
  </div>
  <slot v-else />
</template>

<script setup>
defineProps({ loading: Boolean, error: String })
defineEmits(['retry'])
</script>
