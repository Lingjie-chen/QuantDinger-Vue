/**
 * Dashboard 数据映射和格式化工具
 * 从原 index.vue 提取的纯函数（无 Vue 实例依赖）
 */
import { getDashboardSummary as apiGetDashboardSummary, getPendingOrders as apiGetPendingOrders } from '@/api/dashboard'
import { formatUserDateTime } from '@/utils/userTime'

// ===================== 格式化 =====================

export function formatNumber(num, digits = 2) {
  if (num === undefined || num === null) return '0.00'
  if (typeof num === 'string') num = parseFloat(num)
  if (isNaN(num)) return '0.00'
  return num.toFixed(digits)
}

export function formatCompactNumber(num) {
  if (num === undefined || num === null) return '0'
  if (typeof num === 'string') num = parseFloat(num)
  const abs = Math.abs(num)
  if (abs >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (abs >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toFixed(0)
}

/**
 * 格式化盈亏值，返回 { value, class }
 */
export function formatProfitValue(value) {
  if (value === undefined || value === null) return { value: '0.00', class: '' }
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return { value: '0.00', class: '' }
  const prefix = num >= 0 ? '+' : ''
  return {
    value: prefix + num.toFixed(2),
    class: num >= 0 ? 'positive' : 'negative'
  }
}

export function formatTime(timestamp, showTime = false) {
  if (!timestamp) return ''
  return formatUserDateTime(timestamp, { showDate: true, showTime })
}

// ===================== 收益日历 =====================

export function getDayProfit(day) {
  const pnl = day.pnl ?? day.profit ?? day.pnl_usdt ?? 0
  return typeof pnl === 'number' ? pnl : 0
}

export function getDayClass(profit) {
  if (profit === 0) return 'zero'
  return profit > 0 ? 'profit' : 'loss'
}

// ===================== 策略排行榜映射 =====================

export function mapStrategyRanking(strategyStats, strategyPnlData) {
  if (!strategyStats || strategyStats.length === 0) return []
  const maxAbsPnl = strategyPnlData && strategyPnlData.length
    ? Math.max(...strategyPnlData.map(p => Math.abs(p.pnl || 0)), 1)
    : 1

  return strategyStats.map((s, idx) => {
    const pnl = s.pnl || 0
    return {
      name: s.name,
      trades: s.trades || 0,
      pnl,
      winRate: (s.winRate || 0) * 100,
      profitFactor: s.profitFactor || 0,
      rank: idx + 1,
      pnlPercent: maxAbsPnl > 0 ? Math.abs(pnl) / maxAbsPnl * 100 : 0
    }
  })
}

// ===================== 信号 / 状态 / 渠道映射 =====================

export const SIGNAL_TYPE_MAP = {
  entry: { label: 'entry', color: 'blue' },
  exit: { label: 'exit', color: 'volcano' },
  add: { label: 'add', color: 'cyan' },
  reduce: { label: 'reduce', color: 'orange' }
}

export const ORDER_STATUS_MAP = {
  pending: { label: 'pending', color: 'processing' },
  filled: { label: 'filled', color: 'success' },
  cancelled: { label: 'cancelled', color: 'default' },
  rejected: { label: 'rejected', color: 'error' }
}

export const NOTIFY_CHANNEL_MAP = {
  telegram: { label: 'Telegram', icon: 'send' },
  email: { label: 'Email', icon: 'mail' },
  sms: { label: 'SMS', icon: 'phone' },
  webhook: { label: 'Webhook', icon: 'api' }
}

export function getSignalType(type) {
  return SIGNAL_TYPE_MAP[type] || { label: type, color: 'default' }
}

export function getOrderStatus(status) {
  return ORDER_STATUS_MAP[status] || { label: status, color: 'default' }
}

export function getNotifyChannel(channel) {
  return NOTIFY_CHANNEL_MAP[channel] || { label: channel, icon: 'notification' }
}

// ===================== 每日 PnL 图表辅助 =====================

export function calcDailyPnlChart(chartData) {
  if (!chartData || !chartData.length) {
    return { hours: [], counts: [], profits: [] }
  }
  const hours = []
  const counts = []
  const profits = []
  for (const item of chartData) {
    hours.push(item.h !== undefined ? `${item.h}:00` : '')
    counts.push(item.trade_count || 0)
    profits.push(item.pnl || 0)
  }
  return { hours, counts, profits }
}

// ===================== 信号映射列表 =====================
// 生成用于 a-select 的选项数组

export const signalTypeOptions = Object.entries(SIGNAL_TYPE_MAP).map(([value, cfg]) => ({
  value,
  label: cfg.label
}))

export const orderStatusOptions = Object.entries(ORDER_STATUS_MAP).map(([value, cfg]) => ({
  value,
  label: cfg.label
}))

export const notifyChannelOptions = Object.entries(NOTIFY_CHANNEL_MAP).map(([value, cfg]) => ({
  value,
  label: cfg.label
}))

// ===================== 原始 API 包装 =====================

export function fetchSummary() {
  return apiGetDashboardSummary()
}

export function fetchPendingOrders(params) {
  return apiGetPendingOrders(params)
}
