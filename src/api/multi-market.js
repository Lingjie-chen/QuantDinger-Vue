import request from '@/utils/request'

export function getMultiMarketKline(market, symbol, params) {
  return request({ url: `/api/multi-market/kline`, method: 'get', params: { market, symbol, ...params } })
}

export function getMultiMarketTicker(market, symbol) {
  return request({ url: `/api/multi-market/ticker`, method: 'get', params: { market, symbol } })
}

export function listSupportedMarkets() {
  return request({ url: '/api/multi-market/markets', method: 'get' })
}
