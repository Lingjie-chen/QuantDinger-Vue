/**
 * Risk API - 风控引擎、熔断机制、告警与规则
 */
import request from '@/utils/request'

// ==================== 引擎状态 ====================

/**
 * 获取风控引擎完整状态（熔断 + 日频状态）
 */
export function getRiskStatus () {
  return request({
    url: '/api/risk/status',
    method: 'get'
  })
}

/**
 * 评估一笔交易的风险
 * @param {Object} params - {symbol, action, size, price, capital}
 */
export function getRiskAssessment (params) {
  return request({
    url: '/api/risk/assessment',
    method: 'get',
    params
  })
}

/**
 * 解除断路器（需管理员权限）
 */
export function deactivateCircuitBreaker () {
  return request({
    url: '/api/risk/circuit-breaker/deactivate',
    method: 'post'
  })
}

// ==================== 告警管理 ====================

/**
 * 获取告警列表
 * @param {Object} params - {severity?: string, status?: string, symbol?: string, limit?: number, offset?: number}
 */
export function listAlerts (params = {}) {
  return request({
    url: '/api/risk/alerts',
    method: 'get',
    params
  })
}

/**
 * 获取告警摘要统计
 */
export function getAlertSummary () {
  return request({
    url: '/api/risk/alerts/summary',
    method: 'get'
  })
}

/**
 * 获取单条告警详情
 * @param {string|number} alertId
 */
export function getAlertDetail (alertId) {
  return request({
    url: `/api/risk/alerts/${alertId}`,
    method: 'get'
  })
}

/**
 * 手动记录一条告警
 * @param {Object} data - {severity, category, symbol?, title, message, details?}
 */
export function recordAlert (data) {
  return request({
    url: '/api/risk/alerts',
    method: 'post',
    data
  })
}

/**
 * 确认（ack）一条告警
 * @param {string|number} alertId
 */
export function acknowledgeAlert (alertId) {
  return request({
    url: `/api/risk/alerts/${alertId}/acknowledge`,
    method: 'post'
  })
}

/**
 * 解决一条告警
 * @param {string|number} alertId
 */
export function resolveAlert (alertId) {
  return request({
    url: `/api/risk/alerts/${alertId}/resolve`,
    method: 'post'
  })
}

// ==================== 风险规则 ====================

/**
 * 获取当前风险规则配置
 */
export function getRiskRules () {
  return request({
    url: '/api/risk/rules',
    method: 'get'
  })
}

/**
 * 更新风险规则配置
 * @param {Object} rules - 规则对象
 */
export function updateRiskRules (rules) {
  return request({
    url: '/api/risk/rules',
    method: 'put',
    data: rules
  })
}
