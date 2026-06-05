/**
 * News API - 新闻与情绪
 */
import request from '@/utils/request'

export function getLatestNews(params) {
  return request({ url: '/api/news/latest', method: 'get', params })
}

export function getNewsByCoin(coin, params) {
  return request({ url: `/api/news/coin/${coin}`, method: 'get', params })
}

export function getNewsSentiment(params) {
  return request({ url: '/api/news/sentiment', method: 'get', params })
}

export function searchNews(query, params) {
  return request({ url: '/api/news/search', method: 'get', params: { q: query, ...params } })
}

export function getNewsDetail(newsId) {
  return request({ url: `/api/news/${newsId}`, method: 'get' })
}

export function getSentimentRanking() {
  return request({ url: '/api/news/sentiment/ranking', method: 'get' })
}
