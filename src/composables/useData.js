import { ref } from 'vue'

export function useData(loader) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  async function load(...args) {
    loading.value = true
    error.value = null
    try {
      data.value = await loader(...args)
    } catch (e) {
      error.value = e.message || 'Failed to load data'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
}
