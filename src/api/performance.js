/**
 * Performance API - 自主交易绩效监控与日报
 */
import request from '@/utils/request'

// ==================== 实时快照 ====================

/**
 * 获取实时绩效快照
 */
export function getPerformanceSnapshot () {
  return request({
    url: '/api/performance/snapshot',
    method: 'get'
  })
}

/**
 * 获取各策略独立绩效指标
 */
export function getStrategyPerformance () {
  return request({
    url: '/api/performance/strategies',
    method: 'get'
  })
}

// ==================== 数据记录 ====================

/**
 * 记录一笔交易
 * @param {Object} data - 交易数据 {strategy, action, symbol, entry_price, exit_price, quantity, pnl, ...}
 */
export function recordTrade (data) {
  return request({
    url: '/api/performance/record',
    method: 'post',
    data
  })
}

/**
 * 重置 PerformanceTracker（清空历史）
 */
export function resetTracker () {
  return request({
    url: '/api/performance/reset',
    method: 'post'
  })
}

// ==================== 日报 ====================

/**
 * 生成今日交易日报
 * @param {Object} data - {report_type?: "summary"|"full", include_charts?: boolean}
 */
export function generateReport (data = {}) {
  return request({
    url: '/api/performance/report/generate',
    method: 'post',
    data
  })
}

/**
 * 检查模型重训状态
 */
export function getRetrainStatus () {
  return request({
    url: '/api/performance/retrain-status',
    method: 'get'
  })
}

// ==================== 报告文件管理 ====================

/**
 * 列出历史日报文件
 * @param {Object} params - {limit?: number, format?: "html"|"md"|"all"}
 */
export function listReports (params = {}) {
  return request({
    url: '/api/performance/reports/list',
    method: 'get',
    params
  })
}

/**
 * 下载指定日报文件
 * @param {string} filename - 文件名
 */
export function downloadReport (filename) {
  return request({
    url: `/api/performance/reports/${filename}`,
    method: 'get',
    responseType: 'blob'
  })
}
