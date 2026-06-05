/**
 * Autonomous Trading API - 自主交易代理控制台
 */
import request from '@/utils/request'

// ==================== 代理控制 ====================

export function getAgentStatus() {
  return request({ url: '/api/autonomous/status', method: 'get' })
}

export function startAgent(config) {
  return request({ url: '/api/autonomous/start', method: 'post', data: config })
}

export function stopAgent() {
  return request({ url: '/api/autonomous/stop', method: 'post' })
}

export function pauseAgent() {
  return request({ url: '/api/autonomous/pause', method: 'post' })
}

export function resumeAgent() {
  return request({ url: '/api/autonomous/resume', method: 'post' })
}

// ==================== 配置管理 ====================

export function getAgentConfig() {
  return request({ url: '/api/autonomous/config', method: 'get' })
}

export function updateAgentConfig(config) {
  return request({ url: '/api/autonomous/config', method: 'put', data: config })
}

// ==================== 交易记录 ====================

export function getTradeHistory(params) {
  return request({ url: '/api/autonomous/trades', method: 'get', params })
}

export function getPositions() {
  return request({ url: '/api/autonomous/positions', method: 'get' })
}

// ==================== 决策日志 ====================

export function getDecisionLog(params) {
  return request({ url: '/api/autonomous/decisions', method: 'get', params })
}

// ==================== 性能指标 ====================

export function getPerformanceMetrics() {
  return request({ url: '/api/autonomous/performance', method: 'get' })
}

// ==================== 凭据管理 ====================

export function getCredentials() {
  return request({ url: '/api/autonomous/credentials', method: 'get' })
}

export function saveCredentials(data) {
  return request({ url: '/api/autonomous/credentials', method: 'post', data })
}

export function deleteCredential(credId) {
  return request({ url: `/api/autonomous/credentials/${credId}`, method: 'delete' })
}

// ==================== SSE 事件流 ====================

export function getPhaseEventsUrl() {
  return '/api/autonomous/phases/stream'
}
