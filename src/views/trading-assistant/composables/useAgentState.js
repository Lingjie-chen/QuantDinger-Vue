import { ref } from 'vue'
import {
  getAgentStatus,
  startAgent,
  stopAgent,
  pauseAgent,
  resumeAgent,
  precheckAgent,
  getTradeHistory,
  getPositions,
  getDecisionLog,
  getPerformanceMetrics,
  getAgentConfig,
  updateAgentConfig,
} from '@/api/autonomous'
import request from '@/utils/request'

/**
 * 自主交易 Agent 状态管理 composable
 * 封装状态机、轮询、API 调用，与 strategy API 完全隔离。
 */
export function useAgentState() {
  const agentState = ref('idle')
  const statusLoading = ref(false)
  const actionLoading = ref(false)
  const configSaving = ref(false)
  const status = ref({})
  const perf = ref({ totalEquity: 0, totalPnl: 0, winRate: 0, totalTrades: 0 })
  const positions = ref([])
  const trades = ref([])
  const decisions = ref([])
  const config = ref({
    symbols: ['ETH-USDT-SWAP'],
    analysis_interval: 60,
    max_position_size: 0.1,
    strategy: 'mean_reversion',
  })

  let pollTimer = null

  function startPolling(interval = 5000) {
    if (pollTimer) return
    pollTimer = setInterval(() => fetchStatus(), interval)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function fetchStatus() {
    statusLoading.value = true
    try {
      const res = await getAgentStatus()
      if (res.success || res.code === 1) {
        const d = res.data || res
        agentState.value = d.state || 'idle'
        status.value = d
      }
    } catch (e) {
      console.error('fetchStatus error:', e)
    } finally {
      statusLoading.value = false
    }
  }

  async function fetchData() {
    try {
      const [posRes, tradeRes, perfRes] = await Promise.all([
        getPositions(),
        getTradeHistory({ limit: 50 }),
        getPerformanceMetrics(),
      ])
      if (posRes.success || posRes.code === 1) {
        const posData = posRes.data || posRes
        const rawPos = posData.positions || posData || {}
        positions.value = Array.isArray(rawPos)
          ? rawPos
          : Object.values(rawPos).map((p) => ({
              ...p,
              avgPrice: p.entry_price ?? p.avgPrice,
              pnl: p.unrealized_pnl ?? p.pnl,
            }))
      }
      if (tradeRes.success || tradeRes.code === 1) {
        const tradeData = tradeRes.data || tradeRes
        trades.value = tradeData.trades || tradeData.list || []
      }
      if (perfRes.success || perfRes.code === 1) {
        const perfData = perfRes.data || perfRes
        perf.value = {
          totalEquity: perfData.total_equity ?? perfData.totalEquity ?? 0,
          totalPnl: perfData.total_pnl ?? perfData.totalPnl ?? perfData.daily_pnl ?? 0,
          winRate: (perfData.win_rate ?? perfData.winRate ?? 0) * 100,
          totalTrades: perfData.total_trades ?? perfData.totalTrades ?? perfData.daily_trades ?? 0,
        }
      }
    } catch (e) {
      console.error('fetchData error:', e)
    }
    try {
      const decRes = await getDecisionLog({ limit: 50 })
      if (decRes.success || decRes.code === 1) {
        const decData = decRes.data || decRes
        decisions.value = decData.decisions || decData.list || []
      }
    } catch (e) {
      console.error('fetchDecisions error:', e)
    }
    try {
      const cfgRes = await getAgentConfig()
      if (cfgRes.success || cfgRes.code === 1) {
        config.value = { ...config.value, ...(cfgRes.data || cfgRes) }
      }
    } catch (e) {
      console.error('fetchConfig error:', e)
    }
  }

  function _extractErrorMsg(error, fallback = '操作失败') {
    const data = error?.response?.data || error?.data
    const detail = data?.detail
    if (Array.isArray(detail)) {
      return detail.map((item) => item?.msg || item?.message || JSON.stringify(item)).join('；') || fallback
    }
    if (typeof detail === 'string' && detail) return detail
    return data?.message || data?.msg || error?.message || fallback
  }

  async function handleStart() {
    actionLoading.value = true
    try {
      const payload = {
        symbols: config.value.symbols,
        analysis_interval: config.value.analysis_interval,
        max_position_size:
          config.value.max_position_size > 1 ? config.value.max_position_size / 100 : config.value.max_position_size,
        strategy: config.value.strategy || 'mean_reversion',
      }
      try {
        const precheck = await precheckAgent(payload)
        const pcData = precheck.data || precheck
        if (pcData && pcData.errors && pcData.errors.length > 0) {
          return { success: false, message: '预检失败: ' + pcData.errors.join('；') }
        }
      } catch (e) {
        /* precheck 失败不阻塞启动 */
      }
      const res = await startAgent(payload)
      if (res.success || res.code === 1) {
        await fetchStatus()
        return { success: true }
      }
      return { success: false, message: _extractErrorMsg(res, '启动失败') }
    } catch (e) {
      return { success: false, message: _extractErrorMsg(e, '启动失败') }
    } finally {
      actionLoading.value = false
    }
  }

  async function handleStop() {
    actionLoading.value = true
    try {
      await stopAgent()
      await fetchStatus()
      return { success: true }
    } finally {
      actionLoading.value = false
    }
  }

  async function handlePause() {
    actionLoading.value = true
    try {
      await pauseAgent()
      await fetchStatus()
      return { success: true }
    } finally {
      actionLoading.value = false
    }
  }

  async function handleResume() {
    actionLoading.value = true
    try {
      await resumeAgent()
      await fetchStatus()
      return { success: true }
    } finally {
      actionLoading.value = false
    }
  }

  async function saveConfig(newConfig) {
    configSaving.value = true
    try {
      const merged = { ...config.value, ...newConfig }
      const res = await updateAgentConfig(merged)
      if (res.success || res.code === 1) {
        config.value = merged
        return { success: true }
      }
      return { success: false, message: res.message || '保存失败' }
    } catch (e) {
      return { success: false, message: '保存失败' }
    } finally {
      configSaving.value = false
    }
  }

  /**
   * 获取 K 线数据（autonomous 专用，不走 strategy API）
   * 返回 Promise，由调用方持有 state，避免多实例重复请求。
   */
  async function fetchKlineData(symbol, interval = '15m') {
    if (!symbol) return { klineData: [], klineSignals: [] }
    try {
      const res = await request({
        url: '/api/quant/market/candles',
        method: 'get',
        params: { symbol, interval, limit: 200 },
      })
      const d = res.data || res || {}
      const candles = d.candles || d.data || d || []
      const klineData = candles.map((c) => ({
        timestamp: c[0] || c.timestamp,
        open: parseFloat(c[1] || c.open),
        high: parseFloat(c[2] || c.high),
        low: parseFloat(c[3] || c.low),
        close: parseFloat(c[4] || c.close),
        volume: parseFloat(c[5] || c.volume || 0),
      }))
      const klineSignals = trades.value
        .filter((t) => t.symbol === symbol)
        .map((t) => ({ timestamp: t.timestamp, side: t.action || t.side }))
      return { klineData, klineSignals }
    } catch (e) {
      console.error('fetchKline error:', e)
      return { klineData: [], klineSignals: [] }
    }
  }

  return {
    agentState,
    statusLoading,
    actionLoading,
    configSaving,
    status,
    perf,
    positions,
    trades,
    decisions,
    config,
    startPolling,
    stopPolling,
    fetchStatus,
    fetchData,
    handleStart,
    handleStop,
    handlePause,
    handleResume,
    saveConfig,
    fetchKlineData,
  }
}
