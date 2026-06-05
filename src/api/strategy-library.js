import request from '@/utils/request'

export function listStrategies(params) {
  return request({ url: '/api/strategy-library/strategies', method: 'get', params })
}

export function createStrategy(data) {
  return request({ url: '/api/strategy-library/strategies', method: 'post', data })
}

export function addCandidate(data) {
  return request({ url: '/api/strategy-library/candidates', method: 'post', data })
}

export function listCandidates(params) {
  return request({ url: '/api/strategy-library/candidates', method: 'get', params })
}

export function qualifyStrategy(data) {
  return request({ url: '/api/strategy-library/qualify', method: 'post', data })
}

export function activateStrategy(data) {
  return request({ url: '/api/strategy-library/activate', method: 'post', data })
}

export function getActiveStrategies() {
  return request({ url: '/api/strategy-library/active', method: 'get' })
}

export function updateLivePerformance(data) {
  return request({ url: '/api/strategy-library/performance', method: 'put', data })
}
