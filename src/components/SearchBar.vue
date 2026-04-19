<template>
  <input
    type="text"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    placeholder="Search services..."
    class="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
  />
</template>

<script setup>
defineProps({ modelValue: String })
defineEmits(['update:modelValue'])
</script>
