/**
 * News API - 新闻与情绪
 */
import request from '@/utils/request'

// GET /api/news/ — 最新新闻列表
export function getLatestNews(params) {
  return request({ url: '/api/news/', method: 'get', params })
}

// GET /api/news/sentiment — 情绪分析
export function getNewsSentiment(params) {
  return request({ url: '/api/news/sentiment', method: 'get', params })
}

// GET /api/news/announcements — 交易所公告
export function getAnnouncements(params) {
  return request({ url: '/api/news/announcements', method: 'get', params })
}

// GET /api/news/fear-greed — 恐惧贪婪指数
export function getFearGreedIndex() {
  return request({ url: '/api/news/fear-greed', method: 'get' })
}

// GET /api/news/google-finance — Google Finance 新闻
export function getGoogleFinanceNews(params) {
  return request({ url: '/api/news/google-finance', method: 'get', params })
}

// GET /api/news/macro-market — 宏观市场数据
export function getMacroMarketData(params) {
  return request({ url: '/api/news/macro-market', method: 'get', params })
}

// 兼容别名：前端页面 searchNews 调用
export function searchNews(query, params) {
  return request({ url: '/api/news/', method: 'get', params: { q: query, ...params } })
}
