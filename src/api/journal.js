/**
 * Journal API - 交易日志
 */
import request from '@/utils/request'

// GET /api/journal/entries — 获取日志列表
export function getJournalEntries(params) {
  return request({ url: '/api/journal/entries', method: 'get', params })
}

// POST /api/journal/entries — 创建日志
export function createJournalEntry(data) {
  return request({ url: '/api/journal/entries', method: 'post', data })
}

// GET /api/journal/stats — 日志统计
export function getJournalStats() {
  return request({ url: '/api/journal/stats', method: 'get' })
}
