/**
 * Trade API - 交易管道 API
 */
import request from '@/utils/request'

export function analyzePipeline(data) {
  return request({ url: '/api/trade/analyze', method: 'post', data })
}

export function orchestrateMultiAgent(data) {
  return request({ url: '/api/trade/orchestrate', method: 'post', data })
}

export function getTradeStatus() {
  return request({ url: '/api/trade/status', method: 'get' })
}

export function getPipelineStatus(pipelineId) {
  return request({ url: `/api/trade/pipeline/${pipelineId}`, method: 'get' })
}

export function triggerEvolution(data) {
  return request({ url: '/api/trade/evolution/trigger', method: 'post', data })
}

export function runHyperopt(data) {
  return request({ url: '/api/trade/hyperopt', method: 'post', data })
}

export function getEvolutionStatus() {
  return request({ url: '/api/trade/evolution/status', method: 'get' })
}

export function routeSymbol(data) {
  return request({ url: '/api/trade/route', method: 'post', data })
}
