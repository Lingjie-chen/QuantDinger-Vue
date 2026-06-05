/**
 * Reconciliation API - 对账管理
 */
import request from '@/utils/request'

export function getReconciliationStatus() {
  return request({ url: '/api/reconciliation/status', method: 'get' })
}

export function triggerReconciliation() {
  return request({ url: '/api/reconciliation/trigger', method: 'post' })
}

export function getDiscrepancies(params) {
  return request({ url: '/api/reconciliation/discrepancies', method: 'get', params })
}

export function resolveDiscrepancy(id, data) {
  return request({ url: `/api/reconciliation/discrepancies/${id}/resolve`, method: 'post', data })
}

export function getReconciliationHistory(params) {
  return request({ url: '/api/reconciliation/history', method: 'get', params })
}
