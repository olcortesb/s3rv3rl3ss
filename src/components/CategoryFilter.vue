<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="cat in categories"
      :key="cat"
      @click="$emit('select', cat === modelValue ? '' : cat)"
      :class="[
        'px-3 py-1 rounded-full text-sm font-medium transition',
        cat === modelValue
          ? 'bg-orange-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      ]"
    >
      {{ cat }}
    </button>
  </div>
</template>

<script setup>
defineProps({ categories: Array, modelValue: String })
defineEmits(['select'])
</script>
