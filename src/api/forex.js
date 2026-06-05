import request from '@/utils/request'

export function getForexSession() {
  return request({ url: '/api/forex/session', method: 'get' })
}

export function shouldTrade() {
  return request({ url: '/api/forex/should-trade', method: 'get' })
}

export function getForexQuote(symbol) {
  return request({ url: `/api/forex/quote/${symbol}`, method: 'get' })
}

export function getForexKlines(symbol, params) {
  return request({ url: `/api/forex/klines/${symbol}`, method: 'get', params })
}

export function getForexAccount() {
  return request({ url: '/api/forex/account', method: 'get' })
}

export function getForexPositions(params) {
  return request({ url: '/api/forex/positions', method: 'get', params })
}

export function placeForexOrder(data) {
  return request({ url: '/api/forex/order', method: 'post', data })
}

export function closeForexPosition(ticket) {
  return request({ url: `/api/forex/order/${ticket}`, method: 'delete' })
}

export function modifyForexSLTP(ticket, data) {
  return request({ url: `/api/forex/position/${ticket}`, method: 'patch', data })
}

export function getForexSymbols() {
  return request({ url: '/api/forex/symbols', method: 'get' })
}

export function getForexHealth() {
  return request({ url: '/api/forex/health', method: 'get' })
}
