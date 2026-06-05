import request from '@/utils/request'

export function getRealtimeQuote(code) {
  return request({ url: `/api/a-stock/realtime/${code}`, method: 'get' })
}

export function getDailyBars(code, params) {
  return request({ url: `/api/a-stock/daily/${code}`, method: 'get', params })
}

export function getMarketStats() {
  return request({ url: '/api/a-stock/market/stats', method: 'get' })
}

export function getMainIndices() {
  return request({ url: '/api/a-stock/market/indices', method: 'get' })
}

export function getSectorRankings(params) {
  return request({ url: '/api/a-stock/market/sectors', method: 'get', params })
}

export function getChipDistribution(code) {
  return request({ url: `/api/a-stock/chip/${code}`, method: 'get' })
}

export function getAvailableSources() {
  return request({ url: '/api/a-stock/sources', method: 'get' })
}

export function analyzeStock(code, params) {
  return request({ url: `/api/a-stock/analyze/${code}`, method: 'get', params })
}

export function getMarketSentiment() {
  return request({ url: '/api/a-stock/market/sentiment', method: 'get' })
}

export function getMarketOverview() {
  return request({ url: '/api/a-stock/market/overview', method: 'get' })
}

export function searchStocks(params) {
  return request({ url: '/api/a-stock/search', method: 'get', params })
}
