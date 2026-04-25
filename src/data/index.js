import providersData from '../data/providers.json'
import awsData from '../data/services-aws.json'
import changelogData from '../data/changelog.json'
import statisticsData from '../data/statistics.json'

const dataMap = { aws: awsData }

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

export function getStatistics() {
  return statisticsData
}
