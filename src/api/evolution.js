/**
 * Evolution API - 策略进化引擎
 */
import request from '@/utils/request'

export function getHyperoptStatus() {
  return request({ url: '/api/quant/evolution/hyperopt/status', method: 'get' })
}

export function startHyperopt(data) {
  return request({ url: '/api/quant/evolution/hyperopt/start', method: 'post', data })
}

export function stopHyperopt() {
  return request({ url: '/api/quant/evolution/hyperopt/stop', method: 'post' })
}

export function getHyperoptResults() {
  return request({ url: '/api/quant/evolution/hyperopt/results', method: 'get' })
}

export function getRDAgents() {
  return request({ url: '/api/quant/evolution/rd-agents', method: 'get' })
}

export function createRDAgent(data) {
  return request({ url: '/api/quant/evolution/rd-agents', method: 'post', data })
}

export function getRDAgentStatus(agentId) {
  return request({ url: `/api/evolution/rd-agents/${agentId}`, method: 'get' })
}

export function getSandboxStatus() {
  return request({ url: '/api/quant/evolution/sandbox/status', method: 'get' })
}

export function getSandboxResults() {
  return request({ url: '/api/quant/evolution/sandbox/results', method: 'get' })
}

export function getEvolutionDashboard() {
  return request({ url: '/api/quant/evolution/dashboard', method: 'get' })
}

export function getAbTests() {
  return request({ url: '/api/quant/evolution/ab-tests', method: 'get' })
}

export function createAbTest(data) {
  return request({ url: '/api/quant/evolution/ab-tests', method: 'post', data })
}

export function getAbTestResults(testId) {
  return request({ url: `/api/evolution/ab-tests/${testId}/results`, method: 'get' })
}
