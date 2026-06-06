/**
 * Reconciliation API - 对账管理
 */
import request from '@/utils/request'

export function getReconciliationStatus() {
  return request({ url: '/api/quant/supervisor/status', method: 'get' })
}

export function triggerReconciliation() {
  return request({ url: '/api/quant/supervisor/trigger', method: 'post' })
}

export function getDiscrepancies(params) {
  return request({ url: '/api/quant/supervisor/discrepancies', method: 'get', params })
}

export function resolveDiscrepancy(id, data) {
  return request({ url: `/api/reconciliation/discrepancies/${id}/resolve`, method: 'post', data })
}

export function getReconciliationHistory(params) {
  return request({ url: '/api/quant/supervisor/history', method: 'get', params })
}
