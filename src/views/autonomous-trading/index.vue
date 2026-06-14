<template>
  <div class="autonomous-trading" :class="{ 'theme-dark': isDarkTheme }">
    <!-- 顶层视图切换 -->
    <a-tabs v-model="topView" class="top-view-tabs" :animated="false">
      <a-tab-pane key="console" tab="控制台">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="status-indicator" :class="agentState">
        <span class="status-dot"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div class="status-actions">
        <a-button v-if="agentState === 'idle' || agentState === 'stopped'" type="primary" @click="handleStart" :loading="actionLoading">
          <a-icon type="play-circle" /> 启动
        </a-button>
        <a-button v-if="agentState === 'running'" @click="handlePause" :loading="actionLoading">
          <a-icon type="pause-circle" /> 暂停
        </a-button>
        <a-button v-if="agentState === 'paused'" type="primary" @click="handleResume" :loading="actionLoading">
          <a-icon type="play-circle" /> 恢复
        </a-button>
        <a-button v-if="agentState === 'running' || agentState === 'paused'" danger @click="handleStop" :loading="actionLoading">
          <a-icon type="stop" /> 停止
        </a-button>
        <a-button @click="fetchStatus" :loading="statusLoading">
          <a-icon type="reload" />
        </a-button>
      </div>
    </div>

    <!-- KPI 卡片 -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">总权益</div>
        <div class="kpi-value">${{ formatNumber(perf.totalEquity) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">总收益</div>
        <div class="kpi-value" :class="perf.totalPnl >= 0 ? 'positive' : 'negative'">
          {{ perf.totalPnl >= 0 ? '+' : '' }}${{ formatNumber(perf.totalPnl) }}
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">胜率</div>
        <div class="kpi-value">{{ formatNumber(perf.winRate, 1) }}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">交易次数</div>
        <div class="kpi-value">{{ perf.totalTrades }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">当前持仓</div>
        <div class="kpi-value">{{ positions.length }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">运行时长</div>
        <div class="kpi-value">{{ uptime }}</div>
      </div>
    </div>

    <!-- Tab 内容 -->
    <a-tabs v-model="activeTab" class="main-tabs">
      <a-tab-pane key="positions" tab="持仓">
        <!-- K线图区域 -->
        <div class="chart-section" v-if="positions.length">
          <div class="chart-header">
            <a-select v-model="chartSymbol" style="width:200px" @change="fetchKlineData" size="small">
              <a-select-option v-for="p in positions" :key="p.symbol" :value="p.symbol">{{ p.symbol }}</a-select-option>
            </a-select>
            <a-radio-group v-model="chartInterval" size="small" @change="fetchKlineData">
              <a-radio-button value="1m">1m</a-radio-button>
              <a-radio-button value="5m">5m</a-radio-button>
              <a-radio-button value="15m">15m</a-radio-button>
              <a-radio-button value="1H">1H</a-radio-button>
              <a-radio-button value="4H">4H</a-radio-button>
              <a-radio-button value="1D">1D</a-radio-button>
            </a-radio-group>
          </div>
          <k-line-chart
            :data="klineData"
            :signals="klineSignals"
            :theme="navTheme"
            height="360px"
            v-if="klineData.length"
          />
          <a-empty v-else description="选择持仓标的查看K线" style="padding:60px" />
        </div>
        <a-table
          :columns="positionColumns"
          :data-source="positions"
          :pagination="false"
          size="small"
          class="pro-table"
          row-key="symbol"
          :row-selection="{ selectedRowKeys: [chartSymbol], onSelect: onPositionSelect }"
        >
          <template slot="pnl" slot-scope="text">
            <span :class="text >= 0 ? 'positive' : 'negative'">{{ text >= 0 ? '+' : '' }}{{ formatNumber(text) }}</span>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="trades" tab="交易记录">
        <a-table :columns="tradeColumns" :data-source="trades" :pagination="{ pageSize: 20 }" size="small" class="pro-table" row-key="id">
          <template slot="pnl" slot-scope="text">
            <span :class="text >= 0 ? 'positive' : 'negative'">{{ text >= 0 ? '+' : '' }}{{ formatNumber(text) }}</span>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="decisions" tab="决策日志">
        <a-table :columns="decisionColumns" :data-source="decisions" :pagination="{ pageSize: 20 }" size="small" class="pro-table" row-key="id">
          <template slot="confidence" slot-scope="text">
            <a-progress :percent="Math.round((text || 0) * 100)" size="small" :stroke-color="text > 0.7 ? '#10b981' : '#f59e0b'" />
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="config" tab="配置">
        <a-form-model :model="config" layout="vertical" class="config-form">
          <a-form-model-item label="交易标的">
            <a-select v-model="config.symbols" mode="tags" placeholder="输入交易对">
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="循环间隔（秒）">
            <a-input-number v-model="config.cycle_interval_s" :min="5" :max="3600" />
          </a-form-model-item>
          <a-form-model-item label="最大杠杆">
            <a-input-number v-model="config.max_leverage" :min="1" :max="125" />
          </a-form-model-item>
          <a-form-model-item label="单笔最大仓位（%）">
            <a-slider v-model="config.max_position_pct" :min="1" :max="100" />
          </a-form-model-item>
          <a-form-model-item>
            <a-button type="primary" @click="saveConfig" :loading="configSaving">保存配置</a-button>
          </a-form-model-item>
        </a-form-model>
      </a-tab-pane>
    </a-tabs>
      </a-tab-pane>
      <a-tab-pane key="workflow" tab="工作流">
        <quant-workflow-panel :is-dark="isDarkTheme" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  getAgentStatus, startAgent, stopAgent, pauseAgent, resumeAgent,
  getTradeHistory, getPositions, getDecisionLog, getPerformanceMetrics,
  getAgentConfig, updateAgentConfig
} from '@/api/autonomous'
import QuantWorkflowPanel from '@/views/quant-workflow/index.vue'
import { KLineChart } from '@/components/QdCharts'
import request from '@/utils/request'

export default {
  name: 'AutonomousTrading',
  components: { QuantWorkflowPanel, KLineChart },
  data () {
    return {
      topView: 'console',
      activeTab: 'positions',
      agentState: 'idle',
      statusLoading: false,
      actionLoading: false,
      configSaving: false,
      status: {},
      perf: { totalEquity: 0, totalPnl: 0, winRate: 0, totalTrades: 0 },
      positions: [],
      trades: [],
      decisions: [],
      config: { symbols: ['BTC-USDT-SWAP'], cycle_interval_s: 60, max_leverage: 5, max_position_pct: 10 },
      pollTimer: null,
      // K线图状态
      chartSymbol: '',
      chartInterval: '15m',
      klineData: [],
      klineSignals: [],
      positionColumns: [
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '方向', dataIndex: 'side', width: 80 },
        { title: '数量', dataIndex: 'size', width: 100 },
        { title: '均价', dataIndex: 'avgPrice', width: 120 },
        { title: '盈亏', dataIndex: 'pnl', scopedSlots: { customRender: 'pnl' } },
      ],
      tradeColumns: [
        { title: '时间', dataIndex: 'timestamp', width: 160 },
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '方向', dataIndex: 'action', width: 80 },
        { title: '数量', dataIndex: 'size', width: 100 },
        { title: '价格', dataIndex: 'price', width: 120 },
        { title: '置信度', dataIndex: 'confidence', width: 100, scopedSlots: { customRender: 'confidence' } },
      ],
      decisionColumns: [
        { title: '时间', dataIndex: 'timestamp', width: 160 },
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '动作', dataIndex: 'action', width: 80 },
        { title: '置信度', dataIndex: 'confidence', scopedSlots: { customRender: 'confidence' } },
        { title: '原因', dataIndex: 'reason' },
      ],
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
    statusText () {
      const map = { idle: '空闲', running: '运行中', paused: '已暂停', stopped: '已停止', error: '异常' }
      return map[this.agentState] || this.agentState
    },
    uptime () {
      const s = this.status.uptime_seconds || 0
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      return h > 0 ? `${h}h ${m}m` : `${m}m`
    },
  },
  mounted () {
    this.fetchStatus()
    this.fetchData()
    this.startPolling()
  },
  beforeDestroy () {
    this.stopPolling()
  },
  methods: {
    startPolling () {
      this.pollTimer = setInterval(() => this.fetchStatus(), 5000)
    },
    stopPolling () {
      if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null }
    },
    async fetchStatus () {
      this.statusLoading = true
      try {
        const res = await getAgentStatus()
        if (res.success || res.code === 1) {
          const d = res.data || res
          this.agentState = d.state || 'idle'
          this.status = d
        }
      } catch (e) { console.error('fetchStatus error:', e) } finally { this.statusLoading = false }
    },
    async fetchData () {
      try {
        const [posRes, tradeRes, perfRes] = await Promise.all([
          getPositions(), getTradeHistory({ limit: 50 }), getPerformanceMetrics()
        ])
        if (posRes.success || posRes.code === 1) {
          const posData = posRes.data || posRes
          const rawPos = posData.positions || posData || {}
          // 后端返回 Dict<symbol, PositionInfo>，转为数组
          this.positions = Array.isArray(rawPos)
            ? rawPos
            : Object.values(rawPos).map(p => ({
                ...p,
                avgPrice: p.entry_price ?? p.avgPrice,
                pnl: p.unrealized_pnl ?? p.pnl,
              }))
          // Auto-select first position for chart
          if (this.positions.length && !this.chartSymbol) {
            this.chartSymbol = this.positions[0].symbol
            this.fetchKlineData()
          }
        }
        if (tradeRes.success || tradeRes.code === 1) {
          const tradeData = tradeRes.data || tradeRes
          this.trades = tradeData.trades || tradeData.list || []
        }
        if (perfRes.success || perfRes.code === 1) {
          const perfData = perfRes.data || perfRes
          this.perf = {
            totalEquity: perfData.total_equity ?? perfData.totalEquity ?? 0,
            totalPnl: perfData.total_pnl ?? perfData.totalPnl ?? 0,
            winRate: perfData.win_rate ?? perfData.winRate ?? 0,
            totalTrades: perfData.total_trades ?? perfData.totalTrades ?? 0,
          }
        }
      } catch (e) { console.error('fetchData error:', e) }
      try {
        const decRes = await getDecisionLog({ limit: 50 })
        if (decRes.success || decRes.code === 1) {
          const decData = decRes.data || decRes
          this.decisions = decData.decisions || decData.list || []
        }
      } catch (e) { console.error('fetchDecisions error:', e) }
      try {
        const cfgRes = await getAgentConfig()
        if (cfgRes.success || cfgRes.code === 1) this.config = { ...this.config, ...(cfgRes.data || cfgRes) }
      } catch (e) { console.error('fetchConfig error:', e) }
    },
    async handleStart () {
      this.actionLoading = true
      try {
        const res = await startAgent(this.config)
        if (res.success || res.code === 1) { this.$message.success('代理已启动'); this.fetchStatus() }
        else this.$message.error(res.message || '启动失败')
      } catch (e) { this.$message.error('启动失败') } finally { this.actionLoading = false }
    },
    async handleStop () { this.actionLoading = true; try { await stopAgent(); this.$message.success('代理已停止'); this.fetchStatus() } finally { this.actionLoading = false } },
    async handlePause () { this.actionLoading = true; try { await pauseAgent(); this.$message.success('代理已暂停'); this.fetchStatus() } finally { this.actionLoading = false } },
    async handleResume () { this.actionLoading = true; try { await resumeAgent(); this.$message.success('代理已恢复'); this.fetchStatus() } finally { this.actionLoading = false } },
    async saveConfig () {
      this.configSaving = true
      try {
        const res = await updateAgentConfig(this.config)
        if (res.success || res.code === 1) this.$message.success('配置已保存')
        else this.$message.error(res.message || '保存失败')
      } catch (e) { this.$message.error('保存失败') } finally { this.configSaving = false }
    },
    formatNumber (v, d = 2) {
      if (v == null) return '—'
      return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    },
    onPositionSelect (record) {
      this.chartSymbol = record.symbol
      this.fetchKlineData()
    },
    async fetchKlineData () {
      if (!this.chartSymbol) return
      try {
        const res = await request({
          url: '/api/quant/market/candles',
          method: 'get',
          params: { symbol: this.chartSymbol, interval: this.chartInterval, limit: 200 },
        })
        const d = res.data || res || {}
        const candles = d.candles || d.data || d || []
        this.klineData = candles.map(c => ({
          timestamp: c[0] || c.timestamp,
          open: parseFloat(c[1] || c.open),
          high: parseFloat(c[2] || c.high),
          low: parseFloat(c[3] || c.low),
          close: parseFloat(c[4] || c.close),
          volume: parseFloat(c[5] || c.volume || 0),
        }))
        // Map trade signals for this symbol
        this.klineSignals = this.trades
          .filter(t => t.symbol === this.chartSymbol)
          .map(t => ({
            timestamp: t.timestamp,
            side: t.action || t.side,
          }))
      } catch (e) { console.error('fetchKline error:', e) }
    },
  },
}
</script>

<style lang="less" scoped>
@bg-light: #f8fafc; @bg-card-light: #fff; @border-light: #e2e8f0;
@text-primary: #1e293b; @text-secondary: #64748b;
@green: #10b981; @red: #ef4444; @blue: var(--emerald-500);

.autonomous-trading {
  padding: 20px; background: @bg-light; min-height: 100vh;
  &.theme-dark { background: #141414; }

  .top-view-tabs { margin-bottom: 16px; }

  .status-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 20px; background: @bg-card-light; border: 1px solid @border-light;
    border-radius: 12px; margin-bottom: 16px;
  }

  .status-indicator {
    display: flex; align-items: center; gap: 8px;
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: @text-secondary; }
    &.running .status-dot { background: @green; animation: pulse 2s infinite; }
    &.paused .status-dot { background: #f59e0b; }
    &.error .status-dot { background: @red; }
    .status-text { font-weight: 600; color: @text-primary; }
  }

  .kpi-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px; margin-bottom: 16px;
  }

  .kpi-card {
    background: @bg-card-light; border: 1px solid @border-light; border-radius: 12px;
    padding: 16px; text-align: center;
    .kpi-label { font-size: 11px; color: @text-secondary; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .kpi-value { font-size: 22px; font-weight: 700; color: @text-primary; font-feature-settings: 'tnum'; }
  }

  .positive { color: @green !important; }
  .negative { color: @red !important; }

  .main-tabs { background: @bg-card-light; border: 1px solid @border-light; border-radius: 12px; padding: 16px; }

  .config-form { max-width: 600px; }

  .chart-section {
    background: @bg-card-light; border: 1px solid @border-light;
    border-radius: 12px; padding: 12px; margin-bottom: 16px;
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  }
  &.theme-dark .chart-section { background: #1a1a1a; border-color: #2a2a2a; }
}

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>
