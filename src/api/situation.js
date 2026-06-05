/**
 * Situation API - 市场态势
 */
import request from '@/utils/request'

export function getMarketSituation() {
  return request({ url: '/api/situation', method: 'get' })
}

export function getSituationBySymbol(symbol) {
  return request({ url: `/api/situation/${symbol}`, method: 'get' })
}

export function getRegimeDetection(params) {
  return request({ url: '/api/situation/regime', method: 'get', params })
}

export function getFearGreedIndex() {
  return request({ url: '/api/situation/fear-greed', method: 'get' })
}

export function getMarketPhases(params) {
  return request({ url: '/api/situation/phases', method: 'get', params })
}
