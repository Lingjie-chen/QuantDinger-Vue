/**
 * Quant Workflow API - 量化工作流
 */
import request from '@/utils/request'

export function runWorkflow(data) {
  return request({ url: '/api/quant/workflow/run', method: 'post', data })
}

export function getWorkflowStatus() {
  return request({ url: '/api/quant/workflow/status', method: 'get' })
}

export function analyzeWithAgents(data) {
  return request({ url: '/api/quant/agents/analyze', method: 'post', data })
}

export function triggerEvolution(data) {
  return request({ url: '/api/quant/strategy/evolve', method: 'post', data })
}

export function assessRisk(data) {
  return request({ url: '/api/quant/risk/assess', method: 'post', data })
}
