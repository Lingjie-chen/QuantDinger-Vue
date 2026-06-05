/**
 * Hot Params API - 热参数管理
 */
import request from '@/utils/request'

export function getHotParams() {
  return request({ url: '/api/hot-params', method: 'get' })
}

export function updateHotParam(key, value) {
  return request({ url: `/api/hot-params/${key}`, method: 'put', data: { value } })
}

export function getHotParamHistory(key) {
  return request({ url: `/api/hot-params/${key}/history`, method: 'get' })
}
