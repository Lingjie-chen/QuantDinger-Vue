/**
 * Journal API - 交易日志
 */
import request from '@/utils/request'

export function getJournalEntries(params) {
  return request({ url: '/api/journal', method: 'get', params })
}

export function createJournalEntry(data) {
  return request({ url: '/api/journal', method: 'post', data })
}

export function updateJournalEntry(id, data) {
  return request({ url: `/api/journal/${id}`, method: 'put', data })
}

export function deleteJournalEntry(id) {
  return request({ url: `/api/journal/${id}`, method: 'delete' })
}
