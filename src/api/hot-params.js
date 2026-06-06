/**
 * Hot Params API - 热参数管理
 */
import request from '@/utils/request'

// GET /api/params/ — 获取所有热参数
export function getHotParams() {
  return request({ url: '/api/params/', method: 'get' })
}

// GET /api/params/{key} — 获取单个参数
export function getHotParam(key) {
  return request({ url: `/api/params/${key}`, method: 'get' })
}

// GET /api/params/history/versions — 参数版本历史
export function getHotParamHistory(params) {
  return request({ url: '/api/params/history/versions', method: 'get', params })
}

// POST /api/params/update — 更新参数
export function updateHotParam(data) {
  return request({ url: '/api/params/update', method: 'post', data })
}

// POST /api/params/batch — 批量更新参数
export function batchUpdateHotParams(data) {
  return request({ url: '/api/params/batch', method: 'post', data })
}

// POST /api/params/rollback — 回滚参数
export function rollbackHotParam(data) {
  return request({ url: '/api/params/rollback', method: 'post', data })
}
