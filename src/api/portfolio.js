/**
 * Portfolio API - 投资组合管理
 *
 * 后端已实现: summary, positions, performance, allocations, rebalance, risk
 * 后端未实现: monitors, alerts, groups (前端预留)
 */
import request from '@/utils/request'

// ==================== 核心端点（后端已实现） ====================

export function getPortfolioSummary(params = {}) {
  return request({ url: '/api/portfolio/summary', method: 'get', params })
}

export function getPositions(params = {}) {
  return request({ url: '/api/portfolio/positions', method: 'get', params })
}

export function getPerformance(params = {}) {
  return request({ url: '/api/portfolio/performance', method: 'get', params })
}

export function getAllocations() {
  return request({ url: '/api/portfolio/allocations', method: 'get' })
}

export function setAllocations(data) {
  return request({ url: '/api/portfolio/allocations', method: 'post', data })
}

export function rebalance(data) {
  return request({ url: '/api/portfolio/rebalance', method: 'post', data })
}

export function getRiskMetrics() {
  return request({ url: '/api/portfolio/risk', method: 'get' })
}

// ==================== Market (reuse from market.js) ====================

export function searchSymbols(data) {
  return request({ url: '/api/market/symbols/search', method: 'post', data })
}

export function getMarketTypes() {
  return request({ url: '/api/market/types', method: 'get' })
}

// ==================== 兼容别名（前端页面旧函数，后端暂无对应端点） ====================

export function addPosition(data) {
  return request({ url: '/api/portfolio/positions', method: 'post', data })
}

export function updatePosition(id, data) {
  return request({ url: `/api/portfolio/positions`, method: 'post', data: { ...data, id } })
}

export function deletePosition(id) {
  return request({ url: '/api/portfolio/positions', method: 'get', params: { delete_id: id } })
}

export function getMonitors() {
  return request({ url: '/api/ai/monitor', method: 'get' })
}

export function addMonitor(data) {
  return request({ url: '/api/ai/monitor', method: 'post', data })
}

export function updateMonitor(id, data) {
  return request({ url: `/api/ai/monitor/${id}`, method: 'patch', data })
}

export function deleteMonitor(id) {
  return request({ url: `/api/ai/monitor/${id}`, method: 'delete' })
}

export function runMonitor(id, params = {}) {
  return request({ url: `/api/ai/monitor/${id}/run`, method: 'post', params })
}

export function getAlerts() {
  return Promise.resolve({ data: [] })
}

export function addAlert(data) {
  return Promise.resolve({ data })
}

export function updateAlert(id, data) {
  return Promise.resolve({ data: { id, ...data } })
}

export function deleteAlert(id) {
  return Promise.resolve({ data: null })
}

export function getGroups() {
  return Promise.resolve({ data: [] })
}

export function renameGroup(data) {
  return Promise.resolve({ data: null })
}
