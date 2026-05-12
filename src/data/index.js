import providersData from '../data/providers.json'
import awsData from '../data/services-aws.json'
import gcpData from '../data/services-gcp.json'
import azureData from '../data/services-azure.json'
import changelogData from '../data/changelog.json'
import changelogGcpData from '../data/changelog-gcp.json'
import changelogAzureData from '../data/changelog-azure.json'
import statisticsData from '../data/statistics.json'
import statisticsGcpData from '../data/statistics-gcp.json'
import statisticsAzureData from '../data/statistics-azure.json'

const dataMap = { aws: awsData, gcp: gcpData, azure: azureData }
const statsMap = { aws: statisticsData, gcp: statisticsGcpData, azure: statisticsAzureData }
const changelogMap = { aws: changelogData, gcp: changelogGcpData, azure: changelogAzureData }

export const providers = providersData.providers.filter(p => p.enabled)

export function getProviderData(providerId) {
  return dataMap[providerId] || null
}

export function getProvider(providerId) {
  return providersData.providers.find(p => p.id === providerId) || null
}

export function getChangelog(serviceId, providerId) {
  if (providerId) {
    const data = changelogMap[providerId]
    return (data?.changes || []).filter(c => c.service === serviceId)
  }
  // Search all providers
  for (const data of Object.values(changelogMap)) {
    const matches = (data?.changes || []).filter(c => c.service === serviceId)
    if (matches.length) return matches
  }
  return []
}

export function getStatistics(providerId = 'aws') {
  return statsMap[providerId] || {}
}
