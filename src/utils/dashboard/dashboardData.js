/**
 * 纯工具函数 — 不依赖 Vue 实例
 */

export function getTypeClass (type) {
  if (!type) return ''
  const t = type.toLowerCase()
  if (t.includes('open_long') || t.includes('add_long')) return 'long'
  if (t.includes('open_short') || t.includes('add_short')) return 'short'
  if (t.includes('close_long')) return 'close-long'
  if (t.includes('close_short')) return 'close-short'
  return ''
}

export function getSignalTypeColor (type) {
  if (!type) return 'default'
  type = type.toLowerCase()
  if (type.includes('open_long') || type.includes('add_long')) return 'green'
  if (type.includes('open_short') || type.includes('add_short')) return 'red'
  if (type.includes('close_long')) return 'orange'
  if (type.includes('close_short')) return 'purple'
  return 'blue'
}

export function getNotifyIconType (channel) {
  const c = String(channel || '').trim().toLowerCase()
  const map = {
    browser: 'bell',
    webhook: 'link',
    discord: 'comment',
    telegram: 'message',
    tg: 'message',
    tele: 'message',
    email: 'mail',
    phone: 'phone'
  }
  return map[c] || 'notification'
}

export function getExchangeTagColor (exchange) {
  const ex = String(exchange || '').trim().toLowerCase()
  const map = {
    binance: 'gold',
    okx: 'purple',
    bitget: 'cyan',
    signal: 'geekblue'
  }
  return map[ex] || 'blue'
}

export function formatNumber (num, digits = 2) {
  if (num === undefined || num === null) return '0.00'
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function formatCompactNumber (num) {
  if (num === undefined || num === null) return '0'
  const abs = Math.abs(num)
  if (abs >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (abs >= 1000) return (num / 1000).toFixed(1) + 'k'
  if (abs >= 100) return Math.round(num)
  return num.toFixed(0)
}

export function formatProfitValue (value, recordType) {
  if (value === null || value === undefined) return '--'
  const numValue = parseFloat(value)
  const openTypes = ['open_long', 'open_short', 'add_long', 'add_short']
  if (numValue === 0 && recordType && openTypes.includes(recordType)) return '--'
  if (Math.abs(numValue) < 0.000001) {
    if (recordType && openTypes.includes(recordType)) return '--'
    return '$0.00'
  }
  const sign = numValue >= 0 ? '+' : ''
  return `${sign}$${formatNumber(numValue)}`
}

export default {
  getTypeClass,
  getSignalTypeColor,
  getNotifyIconType,
  getExchangeTagColor,
  formatNumber,
  formatCompactNumber,
  formatProfitValue
}
