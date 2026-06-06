import request from '@/utils/request'

export function getExchanges() {
  return request({ url: '/api/ccxt/exchanges', method: 'get' })
}

export function getCcxtTicker(exchange, symbol) {
  return request({ url: `/api/ccxt/${exchange}/ticker/${symbol}`, method: 'get' })
}

export function getCcxtOhlcv(exchange, symbol, params) {
  return request({ url: `/api/ccxt/${exchange}/ohlcv/${symbol}`, method: 'get', params })
}

export function getCcxtOrderbook(exchange, symbol, params) {
  return request({ url: `/api/ccxt/${exchange}/orderbook/${symbol}`, method: 'get', params })
}
