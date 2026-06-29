import { ref, onUnmounted } from 'vue'
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
  getPhaseEventsUrl,
} from '@/api/autonomous'
import request, { getToken } from '@/utils/request'

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

  const phaseEvents = ref([])
  const sseConnected = ref(false)
  /** @type {AbortController|null} */
  let phaseEventController = null
  /** @type {ReturnType<typeof setTimeout>|null} */
  let sseReconnectTimer = null
  /** @type {string|null} */
  let sseLastEventId = null

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
        // 页面刷新后如果 Agent 正在运行，自动连接 SSE
        if (agentState.value === 'running' && !phaseEventController) {
          connectPhaseEvents()
        }
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

  /**
   * 使用 fetch + ReadableStream 模拟 SSE 连接，可携带 Authorization 头
   */
  function connectPhaseEvents() {
    disconnectPhaseEvents()
    const url = getPhaseEventsUrl()
    phaseEvents.value = []
    sseConnected.value = false

    const token = getToken()
    if (!token) {
      console.warn('connectPhaseEvents: no auth token, cannot connect SSE')
      return
    }

    const controller = new AbortController()
    phaseEventController = controller

    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
    // 重连时带上最后收到的 event id，避免重复推送
    if (sseLastEventId) {
      headers['Last-Event-ID'] = sseLastEventId
    }

    fetch(fullUrl, { headers, signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          sseConnected.value = false
          // 401/403 表示认证失效，不应重连
          if (response.status === 401 || response.status === 403) {
            console.warn('SSE auth failed (401/403), not reconnecting')
            return
          }
          throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`)
        }
        sseConnected.value = true

        if (!response.body) {
          throw new Error('SSE response body is null')
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let currentEvent = { type: 'message', dataLines: [] }

        function dispatchCurrentEvent() {
          if (currentEvent.dataLines.length === 0) return
          const dataStr = currentEvent.dataLines.join('\n')
          const eventType = currentEvent.type

          // 将 SSE 数据解析分发给各个事件类型，与原 EventSource 语义一致
          try {
            const data = JSON.parse(dataStr)
            _handleSSEEvent(eventType, data)
          } catch (_) { /* ignore malformed JSON */ }

          currentEvent = { type: 'message', dataLines: [] }
        }

        function processChunk(chunk) {
          buffer += decoder.decode(chunk, { stream: true })
          const lines = buffer.split('\n')
          // 最后一个元素可能是未完成的行，保留到下一块
          buffer = lines.pop() || ''

          for (const rawLine of lines) {
            const line = rawLine.trimEnd()
            if (line === '') {
              // 空行 → 派发事件
              dispatchCurrentEvent()
              continue
            }

            if (line.startsWith(':')) {
              // SSE 注释行，忽略
              continue
            }

            const colonIdx = line.indexOf(':')
            let field, value
            if (colonIdx === -1) {
              field = line
              value = ''
            } else {
              field = line.substring(0, colonIdx)
              value = line.substring(colonIdx + 1)
              // 按 SSE 规范，value 如果以空格开头则去掉一个空格
              if (value.startsWith(' ')) value = value.substring(1)
            }

            switch (field) {
              case 'event':
                currentEvent.type = value
                break
              case 'data':
                currentEvent.dataLines.push(value)
                break
              case 'id':
                currentEvent.lastEventId = value
                sseLastEventId = value
                break
              case 'retry':
                // retry 值在 fetch 模式下暂不处理
                break
            }
          }
        }

        function pump() {
          reader
            .read()
            .then(({ done, value }) => {
              if (controller.signal.aborted) return

              if (done) {
                // 处理残留 buffer
                if (buffer) {
                  processChunk(new TextEncoder().encode(buffer + '\n'))
                  buffer = ''
                }
                dispatchCurrentEvent()
                sseConnected.value = false
                _scheduleSSEReconnect()
                return
              }

              processChunk(value)
              pump()
            })
            .catch((err) => {
              if (err.name === 'AbortError' || controller.signal.aborted) return
              console.error('SSE read error:', err)
              sseConnected.value = false
              _scheduleSSEReconnect()
            })
        }

        pump()
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return
        console.error('connectPhaseEvents error:', err)
        sseConnected.value = false
        _scheduleSSEReconnect()
      })
  }

  /** 按事件类型分发 SSE 数据 */
  function _handleSSEEvent(eventType, data) {
    const timestamp = data.timestamp || Date.now()

    switch (eventType) {
      case 'phase_progress':
        phaseEvents.value.push({
          type: 'progress',
          phase: data.phase || '',
          message: data.message || '',
          timestamp,
        })
        break
      case 'phase_completed':
        phaseEvents.value.push({
          type: 'completed',
          phase: data.phase || '',
          message: data.message || '',
          timestamp,
        })
        break
      case 'cycle_completed':
        phaseEvents.value.push({
          type: 'cycle_completed',
          phase: 'cycle',
          message: `决策周期完成，生成了 ${(data.decisions || []).length} 条决策`,
          timestamp,
          decisions: data.decisions || [],
        })
        break
      case 'cycle_failed':
        phaseEvents.value.push({
          type: 'cycle_failed',
          phase: 'cycle',
          message: `决策周期失败: ${data.error || '未知错误'}`,
          timestamp,
          error: data.error,
        })
        break
    }

    // 保留最近 200 条，防止内存泄漏
    if (phaseEvents.value.length > 200) {
      phaseEvents.value = phaseEvents.value.slice(-200)
    }
  }

  /** 断线自动重连（5 秒后） */
  function _scheduleSSEReconnect() {
    if (sseReconnectTimer) return
    sseReconnectTimer = setTimeout(() => {
      sseReconnectTimer = null
      connectPhaseEvents()
    }, 5000)
  }

  function disconnectPhaseEvents() {
    if (sseReconnectTimer) {
      clearTimeout(sseReconnectTimer)
      sseReconnectTimer = null
    }
    if (phaseEventController) {
      phaseEventController.abort()
      phaseEventController = null
    }
    sseConnected.value = false
    sseLastEventId = null
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
        connectPhaseEvents()
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
      disconnectPhaseEvents()
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

  // 组件卸载时自动清理 SSE 和轮询，防止内存泄漏
  onUnmounted(() => {
    disconnectPhaseEvents()
    stopPolling()
  })

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
    phaseEvents,
    sseConnected,
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
    connectPhaseEvents,
    disconnectPhaseEvents,
  }
}
