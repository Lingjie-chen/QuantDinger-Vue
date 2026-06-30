<template>
  <div class="evolution-engine" :class="{ 'theme-dark': isDarkTheme }">
    <!-- 顶部 KPI 栏：真实交易绩效 -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">总交易数</div>
        <div class="kpi-value">{{ performance.total_trades || 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">买入信号</div>
        <div class="kpi-value buy">{{ performance.buy_signals || 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">卖出信号</div>
        <div class="kpi-value sell">{{ performance.sell_signals || 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">日均盈亏</div>
        <div class="kpi-value" :class="pnlClass(performance.daily_pnl)">
          {{ formatPnl(performance.daily_pnl) }}
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">平均置信度</div>
        <div class="kpi-value">{{ formatPercent(performance.avg_confidence) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Agent 状态</div>
        <div class="kpi-value">
          <a-tag :color="performance.is_running ? 'green' : 'default'">
            {{ performance.is_running ? '运行中' : '已停止' }}
          </a-tag>
        </div>
      </div>
    </div>

    <a-tabs v-model="activeTab" class="main-tabs">
      <!-- 实时交易流水 -->
      <a-tab-pane key="trades" tab="实时交易">
        <div class="trades-toolbar">
          <a-button @click="fetchTrades" :loading="loading.trades" size="small">
            <a-icon type="reload" /> 刷新
          </a-button>
          <span class="auto-update-hint">每 {{ POLL_INTERVAL / 1000 }}s 自动更新</span>
        </div>
        <a-table
          :columns="tradeColumns"
          :data-source="trades"
          :loading="loading.trades"
          :pagination="{ pageSize: 15, showSizeChanger: true }"
          size="small"
          row-key="id"
          class="pro-table"
        >
          <template slot="side" slot-scope="text">
            <a-tag :color="text === 'buy' ? 'green' : 'red'">{{ text === 'buy' ? '买入' : '卖出' }}</a-tag>
          </template>
          <template slot="confidence" slot-scope="text">
            <a-progress :percent="Math.round((text || 0) * 100)" size="small" />
          </template>
        </a-table>
      </a-tab-pane>

      <!-- 当前持仓 -->
      <a-tab-pane key="positions" tab="当前持仓">
        <a-table
          :columns="positionColumns"
          :data-source="positions"
          :loading="loading.positions"
          :pagination="false"
          size="small"
          row-key="symbol"
          class="pro-table"
        >
          <template slot="side" slot-scope="text">
            <a-tag :color="text === 'long' || text === 'buy' ? 'green' : 'red'">{{ text }}</a-tag>
          </template>
          <template slot="pnl" slot-scope="text">
            <span :class="text >= 0 ? 'positive' : 'negative'">{{ formatPnl(text) }}</span>
          </template>
        </a-table>
      </a-tab-pane>

      <!-- 进化引擎状态 -->
      <a-tab-pane key="dashboard" tab="进化仪表盘">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">进化状态</div>
            <div class="kpi-value">
              <a-tag :color="(dashboard.auto_evolver || {}).status === 'running' ? 'blue' : 'default'">
                {{ (dashboard.auto_evolver || {}).status || '—' }}
              </a-tag>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">因子数量</div>
            <div class="kpi-value">{{ (dashboard.auto_evolver || {}).factors_count || 0 }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">超参状态</div>
            <div class="kpi-value">{{ (dashboard.hyperopt || {}).status || '—' }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">沙盒状态</div>
            <div class="kpi-value">{{ (dashboard.sandbox || {}).status || '—' }}</div>
          </div>
        </div>
        <div v-if="(dashboard.auto_evolver || {}).top_factors" class="top-factors">
          <h4>Top 因子</h4>
          <a-list size="small" bordered :data-source="dashboard.auto_evolver.top_factors">
            <a-list-item slot="renderItem" slot-scope="item">{{ JSON.stringify(item) }}</a-list-item>
          </a-list>
        </div>
      </a-tab-pane>

      <!-- 超参优化 -->
      <a-tab-pane key="hyperopt" tab="超参优化">
        <div class="hyperopt-panel">
          <div class="hyperopt-status">
            <span>状态:</span>
            <a-tag :color="hyperopt.status === 'running' ? 'blue' : 'default'">
              {{ hyperopt.status === 'running' ? '运行中' : (hyperopt.status === 'completed' ? '已完成' : '空闲') }}
            </a-tag>
            <span v-if="hyperopt.trials != null">试验次数: {{ hyperopt.trials }}</span>
          </div>
          <a-form layout="inline" style="margin:16px 0">
            <a-form-item label="算法">
              <a-select v-model="hyperoptConfig.algorithm" style="width:140px">
                <a-select-option value="bayesian">贝叶斯</a-select-option>
                <a-select-option value="random">随机搜索</a-select-option>
                <a-select-option value="grid">网格搜索</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="轮数">
              <a-input-number v-model="hyperoptConfig.n_trials" :min="5" :max="500" />
            </a-form-item>
            <a-form-item>
              <a-button v-if="hyperopt.status !== 'running'" type="primary" @click="startHyperopt">开始优化</a-button>
              <a-button v-else danger @click="stopHyperoptRun">停止</a-button>
            </a-form-item>
          </a-form>
          <div v-if="hyperopt.best_params" class="best-params">
            <h4>最佳参数</h4>
            <pre>{{ JSON.stringify(hyperopt.best_params, null, 2) }}</pre>
          </div>
        </div>
      </a-tab-pane>

      <!-- A/B 测试 -->
      <a-tab-pane key="ab" tab="A/B 测试">
        <div class="ab-header">
          <a-button type="primary" @click="showCreateAb = true"><a-icon type="plus" /> 新建 A/B 测试</a-button>
        </div>
        <a-table :columns="abColumns" :data-source="abTests" size="small" row-key="id" class="pro-table">
          <template slot="status" slot-scope="text">
            <a-tag :color="text === 'running' ? 'blue' : text === 'completed' ? 'green' : 'default'">{{ text }}</a-tag>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  getEvolutionDashboard, getHyperoptStatus, startHyperopt, stopHyperopt,
  getAbTests, getTradeHistory, getPerformance, getPositions,
} from '@/api/evolution'

const POLL_INTERVAL = 5000

export default {
  name: 'EvolutionEngine',
  data () {
    return {
      POLL_INTERVAL,
      activeTab: 'trades',
      performance: {},
      trades: [],
      positions: [],
      dashboard: {},
      hyperopt: { status: 'idle', trials: 0, best_params: null },
      hyperoptConfig: { algorithm: 'bayesian', n_trials: 20 },
      abTests: [],
      showCreateAb: false,
      loading: { trades: false, positions: false },
      tradeColumns: [
        { title: '时间', dataIndex: 'timestamp', width: 180, customRender: (t) => t ? new Date(t).toLocaleString('zh-CN') : '—' },
        { title: '交易对', dataIndex: 'symbol', width: 130 },
        { title: '方向', dataIndex: 'side', width: 80, scopedSlots: { customRender: 'side' } },
        { title: '数量', dataIndex: 'quantity', width: 100, customRender: (v) => v ?? '—' },
        { title: '价格', dataIndex: 'price', width: 110, customRender: (v) => v ?? '—' },
        { title: '止损', dataIndex: 'stop_loss', width: 100, customRender: (v) => v ?? '—' },
        { title: '止盈', dataIndex: 'take_profit', width: 100, customRender: (v) => v ?? '—' },
        { title: '置信度', dataIndex: 'confidence', width: 140, scopedSlots: { customRender: 'confidence' } },
      ],
      positionColumns: [
        { title: '交易对', dataIndex: 'symbol', width: 140 },
        { title: '方向', dataIndex: 'side', width: 80, scopedSlots: { customRender: 'side' } },
        { title: '数量', dataIndex: 'size', width: 100 },
        { title: '开仓价', dataIndex: 'entry_price', width: 110 },
        { title: '当前价', dataIndex: 'mark_price', width: 110 },
        { title: '盈亏', dataIndex: 'pnl', width: 120, scopedSlots: { customRender: 'pnl' } },
        { title: '杠杆', dataIndex: 'leverage', width: 80 },
      ],
      abColumns: [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '名称', dataIndex: 'name' },
        { title: '状态', dataIndex: 'status', width: 100, scopedSlots: { customRender: 'status' } },
        { title: '创建时间', dataIndex: 'created_at', width: 160 },
      ],
      pollTimer: null,
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
  },
  mounted () {
    this.fetchAll()
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL)
  },
  beforeDestroy () { if (this.pollTimer) clearInterval(this.pollTimer) },
  methods: {
    async fetchAll () {
      await Promise.all([
        this.fetchPerformance(),
        this.fetchTrades(),
        this.fetchPositions(),
        this.fetchDashboard(),
        this.fetchHyperopt(),
        this.fetchAb(),
      ])
    },
    async poll () {
      // 轮询：仅刷新实时数据
      await Promise.all([
        this.fetchPerformance(),
        this.fetchTrades(),
        this.fetchPositions(),
        this.fetchDashboard(),
      ])
    },
    async fetchPerformance () {
      try {
        const r = await getPerformance()
        this.performance = r.data || r || {}
      } catch (e) { /* silent */ }
    },
    async fetchTrades () {
      this.loading.trades = true
      try {
        const r = await getTradeHistory({ limit: 100 })
        const data = r.data || r || {}
        this.trades = data.trades || data.items || []
      } catch (e) { /* silent */ } finally {
        this.loading.trades = false
      }
    },
    async fetchPositions () {
      this.loading.positions = true
      try {
        const r = await getPositions()
        const data = r.data || r || {}
        this.positions = data.positions || data.items || []
      } catch (e) { /* silent */ } finally {
        this.loading.positions = false
      }
    },
    async fetchDashboard () {
      try {
        const r = await getEvolutionDashboard()
        this.dashboard = r.data || r || {}
      } catch (e) { /* silent */ }
    },
    async fetchHyperopt () {
      try {
        const r = await getHyperoptStatus()
        this.hyperopt = r.data || r || this.hyperopt
      } catch (e) { /* silent */ }
    },
    async startHyperopt () {
      try {
        await startHyperopt(this.hyperoptConfig)
        this.$message.success('优化已启动')
        this.fetchHyperopt()
      } catch (e) { this.$message.error('启动失败') }
    },
    async stopHyperoptRun () {
      try {
        await stopHyperopt()
        this.$message.success('已停止')
        this.fetchHyperopt()
      } catch (e) { this.$message.error('停止失败') }
    },
    async fetchAb () {
      try {
        const r = await getAbTests()
        this.abTests = (r.data || r) || []
      } catch (e) { /* silent */ }
    },
    pnlClass (v) { return v == null ? '' : v >= 0 ? 'positive' : 'negative' },
    formatPnl (v) { return v == null ? '—' : `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)} USDT` },
    formatPercent (v) { return v == null ? '—' : `${(Number(v) * 100).toFixed(1)}%` },
  },
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.evolution-engine {
  padding: @qd-space-lg; background: @qd-bg-light; min-height: 100vh;
  &.theme-dark { background: @qd-bg-dark; }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: @qd-space-md;
    margin-bottom: @qd-space-md;
  }
  .kpi-card {
    .qd-card-base();
    .kpi-label { .qd-kpi-label(); }
    .kpi-value {
      font-size: @qd-font-xl; font-weight: @qd-font-bold;
      color: @qd-text-primary-light;
      &.buy { color: @qd-positive; }
      &.sell { color: @qd-negative; }
    }
  }

  .main-tabs {
    background: @qd-bg-card-light;
    border: 1px solid @qd-border-light;
    border-radius: @qd-radius-lg;
    padding: @qd-space-md;
  }

  .trades-toolbar {
    display: flex; align-items: center; gap: @qd-space-md;
    margin-bottom: @qd-space-md;
    .auto-update-hint { color: @qd-text-secondary-light; font-size: @qd-font-sm; }
  }

  .hyperopt-status { display: flex; align-items: center; gap: @qd-space-md; margin-bottom: @qd-space-md; }
  .best-params {
    margin-top: @qd-space-md;
    pre { background: @qd-bg-light; padding: @qd-space-md; border-radius: @qd-radius-md; font-size: @qd-font-sm; }
  }
  .ab-header { margin-bottom: @qd-space-md; }
  .top-factors { margin-top: @qd-space-md; }

  .positive { color: @qd-positive; font-weight: @qd-font-bold; }
  .negative { color: @qd-negative; font-weight: @qd-font-bold; }
}
</style>
