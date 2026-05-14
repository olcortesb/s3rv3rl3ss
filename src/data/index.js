import providersData from '../data/providers.json'

export const providers = providersData.providers.filter(p => p.enabled)

// Data loaded lazily per provider - cached after first load
const dataCache = {}
const statsCache = {}
const changelogCache = {}

async function loadData(provider) {
  if (dataCache[provider]) return dataCache[provider]
  const modules = {
    aws: () => import('../data/services-aws.json'),
    gcp: () => import('../data/services-gcp.json'),
    azure: () => import('../data/services-azure.json'),
  }
  const mod = await modules[provider]()
  dataCache[provider] = mod.default
  return mod.default
}

async function loadStats(provider) {
  if (statsCache[provider]) return statsCache[provider]
  const modules = {
    aws: () => import('../data/statistics.json'),
    gcp: () => import('../data/statistics-gcp.json'),
    azure: () => import('../data/statistics-azure.json'),
  }
  const mod = await modules[provider]()
  statsCache[provider] = mod.default
  return mod.default
}

async function loadChangelog(provider) {
  if (changelogCache[provider]) return changelogCache[provider]
  const modules = {
    aws: () => import('../data/changelog.json'),
    gcp: () => import('../data/changelog-gcp.json'),
    azure: () => import('../data/changelog-azure.json'),
  }
  const mod = await modules[provider]()
  changelogCache[provider] = mod.default
  return mod.default
}

export async function getProviderData(providerId) {
  return loadData(providerId)
}

export function getProvider(providerId) {
  return providersData.providers.find(p => p.id === providerId) || null
}

export async function getChangelog(serviceId, providerId) {
  if (providerId) {
    const data = await loadChangelog(providerId)
    return (data?.changes || []).filter(c => c.service === serviceId)
  }
  for (const pid of ['aws', 'gcp', 'azure']) {
    const data = await loadChangelog(pid)
    const matches = (data?.changes || []).filter(c => c.service === serviceId)
    if (matches.length) return matches
  }
  return []
}

export async function getStatistics(providerId = 'aws') {
  return loadStats(providerId)
}
