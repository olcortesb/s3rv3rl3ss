<template>
  <div>
    <router-link to="/" class="text-orange-500 hover:underline text-sm mb-4 inline-block">← Home</router-link>

    <div class="bg-gray-900 text-white rounded-2xl p-8 mb-8 text-center">
      <h1 class="text-2xl font-bold text-white mb-1">Global Statistics</h1>
      <p class="text-gray-400 text-sm">Aggregated data across all 4 cloud providers</p>
      <p class="text-xs text-gray-500 mt-3">Last updated: {{ lastUpdated }}</p>
    </div>

    <DataLoader :loading="loading" :error="error" @retry="load">

      <!-- Totals -->
      <div class="bg-gray-900 rounded-2xl p-6 mb-6">
        <h2 class="font-semibold text-white mb-4">Totals</h2>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">{{ totals.services }}</div>
            <div class="text-xs text-gray-400">Services</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">{{ totals.quotas }}</div>
            <div class="text-xs text-gray-400">Quotas</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">{{ totals.limits }}</div>
            <div class="text-xs text-gray-400">Limits</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">{{ totals.news }}</div>
            <div class="text-xs text-gray-400">News</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">{{ totals.runtimes }}</div>
            <div class="text-xs text-gray-400">Active Runtimes</div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Services by Provider</h2>
          <div class="flex justify-center"><canvas ref="servicesChart" width="260" height="260"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">News by Provider</h2>
          <div class="flex justify-center"><canvas ref="newsChart" width="260" height="260"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Limits by Provider</h2>
          <div class="flex justify-center"><canvas ref="limitsChart" width="260" height="260"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Active Runtimes by Provider</h2>
          <div class="flex justify-center"><canvas ref="runtimesChart" width="260" height="260"></canvas></div>
        </div>
      </div>

      <!-- Per provider table -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4">By Provider</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left py-2 text-gray-500 font-normal">Provider</th>
                <th class="text-right py-2 text-gray-500 font-normal">Services</th>
                <th class="text-right py-2 text-gray-500 font-normal">Quotas</th>
                <th class="text-right py-2 text-gray-500 font-normal">Limits</th>
                <th class="text-right py-2 text-gray-500 font-normal">News</th>
                <th class="text-right py-2 text-gray-500 font-normal">Runtimes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableRows" :key="row.id" class="border-b border-gray-50 last:border-0">
                <td class="py-3 flex items-center gap-2">
                  <img :src="row.icon" :alt="row.name" class="w-5 h-5" :class="row.id === 'stackit' ? 'brightness-0' : ''" />
                  <router-link :to="`/${row.id}`" class="text-gray-700 hover:text-orange-500">{{ row.name }}</router-link>
                </td>
                <td class="py-3 text-right font-medium text-gray-900">{{ row.services }}</td>
                <td class="py-3 text-right text-gray-600">{{ row.quotas || '—' }}</td>
                <td class="py-3 text-right text-gray-600">{{ row.limits }}</td>
                <td class="py-3 text-right text-gray-600">{{ row.news }}</td>
                <td class="py-3 text-right text-gray-600">{{ row.runtimes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </DataLoader>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'
import { providers, getStatistics, getProvider } from '../data/index.js'
import DataLoader from '../components/DataLoader.vue'

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#22c55e']
const PROVIDER_ORDER = ['aws', 'gcp', 'azure', 'stackit']

const loading = ref(true)
const error = ref(null)
const lastUpdated = ref('')
const totals = ref({ services: 0, quotas: 0, limits: 0, news: 0, runtimes: 0 })
const tableRows = ref([])

const servicesChart = ref(null)
const newsChart = ref(null)
const limitsChart = ref(null)
const runtimesChart = ref(null)

function buildDonut(canvas, labels, data) {
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
      },
    },
  })
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const stats = {}
    for (const pid of PROVIDER_ORDER) {
      stats[pid] = await getStatistics(pid)
    }

    lastUpdated.value = stats.aws.lastUpdated || ''

    const rows = []
    let tServices = 0, tQuotas = 0, tLimits = 0, tNews = 0, tRuntimes = 0

    for (const pid of PROVIDER_ORDER) {
      const s = stats[pid].summary
      const p = getProvider(pid)
      rows.push({
        id: pid,
        name: p.name,
        icon: p.icon,
        services: s.totalServices || 0,
        quotas: s.totalQuotas || 0,
        limits: s.totalLimits || 0,
        news: s.totalNews || 0,
        runtimes: s.activeRuntimes || 0,
      })
      tServices += s.totalServices || 0
      tQuotas += s.totalQuotas || 0
      tLimits += s.totalLimits || 0
      tNews += s.totalNews || 0
      tRuntimes += s.activeRuntimes || 0
    }

    tableRows.value = rows
    totals.value = { services: tServices, quotas: tQuotas, limits: tLimits, news: tNews, runtimes: tRuntimes }

  } catch (e) {
    error.value = e.message || 'Failed to load statistics'
  } finally {
    loading.value = false
  }
}

onMounted(load)

watch(tableRows, async (rows) => {
  if (!rows.length) return
  await nextTick()
  const labels = rows.map(r => r.name)
  buildDonut(servicesChart.value, labels, rows.map(r => r.services))
  buildDonut(newsChart.value, labels, rows.map(r => r.news))
  buildDonut(limitsChart.value, labels, rows.map(r => r.limits))
  buildDonut(runtimesChart.value, labels, rows.map(r => r.runtimes))
})
</script>
