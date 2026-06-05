import request from '@/utils/request'

export function listEarnProducts(params) {
  return request({ url: '/api/earn/products', method: 'get', params })
}

export function subscribeEarn(data) {
  return request({ url: '/api/earn/subscribe', method: 'post', data })
}

export function redeemEarn(data) {
  return request({ url: '/api/earn/redeem', method: 'post', data })
}

export function getEarnPositions() {
  return request({ url: '/api/earn/positions', method: 'get' })
}
