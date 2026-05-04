import providersData from '../data/providers.json'
import awsData from '../data/services-aws.json'
import gcpData from '../data/services-gcp.json'
import azureData from '../data/services-azure.json'
import changelogData from '../data/changelog.json'
import statisticsData from '../data/statistics.json'
import statisticsGcpData from '../data/statistics-gcp.json'
import statisticsAzureData from '../data/statistics-azure.json'

const dataMap = { aws: awsData, gcp: gcpData, azure: azureData }
const statsMap = { aws: statisticsData, gcp: statisticsGcpData, azure: statisticsAzureData }

export const providers = providersData.providers.filter(p => p.enabled)

export function getProviderData(providerId) {
  return dataMap[providerId] || null
}

export function getProvider(providerId) {
  return providersData.providers.find(p => p.id === providerId) || null
}

export function getChangelog(serviceId) {
  return (changelogData.changes || []).filter(c => c.service === serviceId)
}

export function getStatistics(providerId = 'aws') {
  return statsMap[providerId] || {}
}
