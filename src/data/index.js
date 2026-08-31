import providersData from '../data/providers.json'

export const providers = providersData.providers.filter(p => p.enabled)

const CLOUDFRONT_URL = 'https://d2p0oqeck3arvl.cloudfront.net'

const dataCache = {}
const statsCache = {}
const changelogCache = {}

let _fetchMode = providersData.fetchMode

async function getFetchMode() {
  if (_fetchMode) return true
  try {
    const res = await fetch(`${CLOUDFRONT_URL}/data/providers.json`)
    const json = await res.json()
    _fetchMode = json.fetchMode === true
  } catch {
    _fetchMode = false
  }
  return _fetchMode
}

async function fetchOrImport(key, importFn) {
  const useFetch = await getFetchMode()
  if (useFetch) {
    const res = await fetch(`${CLOUDFRONT_URL}/data/${key}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
  const mod = await importFn()
  return mod.default
}

const DATA_FILES = {
  aws: 'services-aws.json',
  gcp: 'services-gcp.json',
  azure: 'services-azure.json',
  stackit: 'services-stackit.json',
}

const STATS_FILES = {
  aws: 'statistics.json',
  gcp: 'statistics-gcp.json',
  azure: 'statistics-azure.json',
  stackit: 'statistics-stackit.json',
}

const CHANGELOG_FILES = {
  aws: 'changelog.json',
  gcp: 'changelog-gcp.json',
  azure: 'changelog-azure.json',
  stackit: 'changelog-stackit.json',
}

const DATA_IMPORTS = {
  aws: () => import('../data/services-aws.json'),
  gcp: () => import('../data/services-gcp.json'),
  azure: () => import('../data/services-azure.json'),
  stackit: () => import('../data/services-stackit.json'),
}

const STATS_IMPORTS = {
  aws: () => import('../data/statistics.json'),
  gcp: () => import('../data/statistics-gcp.json'),
  azure: () => import('../data/statistics-azure.json'),
  stackit: () => import('../data/statistics-stackit.json'),
}

const CHANGELOG_IMPORTS = {
  aws: () => import('../data/changelog.json'),
  gcp: () => import('../data/changelog-gcp.json'),
  azure: () => import('../data/changelog-azure.json'),
  stackit: () => import('../data/changelog-stackit.json'),
}

async function loadData(provider) {
  if (dataCache[provider]) return dataCache[provider]
  dataCache[provider] = await fetchOrImport(DATA_FILES[provider], DATA_IMPORTS[provider])
  return dataCache[provider]
}

async function loadStats(provider) {
  if (statsCache[provider]) return statsCache[provider]
  statsCache[provider] = await fetchOrImport(STATS_FILES[provider], STATS_IMPORTS[provider])
  return statsCache[provider]
}

async function loadChangelog(provider) {
  if (changelogCache[provider]) return changelogCache[provider]
  changelogCache[provider] = await fetchOrImport(CHANGELOG_FILES[provider], CHANGELOG_IMPORTS[provider])
  return changelogCache[provider]
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
  for (const pid of ['aws', 'gcp', 'azure', 'stackit']) {
    const data = await loadChangelog(pid)
    const matches = (data?.changes || []).filter(c => c.service === serviceId)
    if (matches.length) return matches
  }
  return []
}

export async function getStatistics(providerId = 'aws') {
  return loadStats(providerId)
}
