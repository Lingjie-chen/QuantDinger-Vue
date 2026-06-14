<template>
  <div class="backtest-center" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header">
      <h3>回测中心</h3>
      <a-button @click="fetchHistory"><a-icon type="reload" /></a-button>
    </div>

    <!-- 回测配置 -->
    <div class="bt-config-card">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="策略">
              <a-select v-model="config.strategyId" placeholder="选择策略" show-search :filter-option="filterOption">
                <a-select-option v-for="s in strategies" :key="s.id" :value="s.id">{{ s.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="交易对">
              <a-input v-model="config.symbol" placeholder="BTC-USDT-SWAP" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="周期">
              <a-select v-model="config.timeframe">
                <a-select-option value="1m">1分钟</a-select-option>
                <a-select-option value="5m">5分钟</a-select-option>
                <a-select-option value="15m">15分钟</a-select-option>
                <a-select-option value="1H">1小时</a-select-option>
                <a-select-option value="4H">4小时</a-select-option>
                <a-select-option value="1D">日线</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="初始资金">
              <a-input-number v-model="config.initialCapital" :min="100" :step="1000" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="手续费率 (%)">
              <a-input-number v-model="config.feeRate" :min="0" :max="1" :step="0.01" style="width:100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="开始日期">
              <a-date-picker v-model="config.startDate" style="width:100%" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="结束日期">
              <a-date-picker v-model="config.endDate" style="width:100%" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :span="8" style="display:flex;align-items:flex-end">
            <a-button type="primary" size="large" :loading="running" @click="runBacktest" block>
              <a-icon type="play-circle" /> 运行回测
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 回测结果 -->
    <div v-if="result" class="bt-result-section">
      <a-row :gutter="12" class="bt-metrics-grid">
        <div class="bt-metric-card">
          <div class="bt-metric-label">总收益</div>
          <div class="bt-metric-value" :class="result.total_pnl >= 0 ? 'positive' : 'negative'">
            {{ result.total_pnl >= 0 ? '+' : '' }}{{ formatNumber(result.total_pnl) }}
          </div>
        </div>
        <div class="bt-metric-card">
          <div class="bt-metric-label">收益率</div>
          <div class="bt-metric-value" :class="result.return_rate >= 0 ? 'positive' : 'negative'">
            {{ result.return_rate >= 0 ? '+' : '' }}{{ formatNumber(result.return_rate) }}%
          </div>
        </div>
        <div class="bt-metric-card">
          <div class="bt-metric-label">Sharpe 比率</div>
          <div class="bt-metric-value">{{ formatNumber(result.sharpe_ratio) }}</div>
        </div>
        <div class="bt-metric-card">
          <div class="bt-metric-label">最大回撤</div>
          <div class="bt-metric-value negative">{{ formatNumber(result.max_drawdown) }}%</div>
        </div>
        <div class="bt-metric-card">
          <div class="bt-metric-label">胜率</div>
          <div class="bt-metric-value">{{ formatNumber(result.win_rate) }}%</div>
        </div>
        <div class="bt-metric-card">
          <div class="bt-metric-label">交易次数</div>
          <div class="bt-metric-value">{{ result.total_trades }}</div>
        </div>
      </a-row>

      <!-- 权益曲线 -->
      <div class="bt-chart-card">
        <div class="bt-chart-title"><a-icon type="line-chart" /> 权益曲线</div>
        <e-chart :option="equityOption" :theme="navTheme" height="320px" />
      </div>

      <!-- 回撤曲线 -->
      <div class="bt-chart-card">
        <div class="bt-chart-title"><a-icon type="area-chart" /> 回撤曲线</div>
        <e-chart :option="drawdownOption" :theme="navTheme" height="240px" />
      </div>

      <!-- 交易明细 -->
      <div class="bt-chart-card">
        <div class="bt-chart-title"><a-icon type="unordered-list" /> 交易明细</div>
        <a-table :columns="tradeColumns" :data-source="result.trades || []" :pagination="{ pageSize: 15 }" size="small" row-key="id">
          <template slot="pnl" slot-scope="text">
            <span :class="text >= 0 ? 'positive' : 'negative'">{{ text >= 0 ? '+' : '' }}{{ formatNumber(text) }}</span>
          </template>
          <template slot="side" slot-scope="text">
            <a-tag :color="text === 'buy' ? 'green' : 'red'">{{ text === 'buy' ? '买入' : '卖出' }}</a-tag>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 历史回测 -->
    <div class="bt-history-section">
      <div class="bt-chart-title"><a-icon type="history" /> 回测历史</div>
      <a-table :columns="historyColumns" :data-source="history" :loading="historyLoading" size="small" row-key="id">
        <template slot="return_rate" slot-scope="text">
          <span :class="text >= 0 ? 'positive' : 'negative'">{{ text >= 0 ? '+' : '' }}{{ formatNumber(text) }}%</span>
        </template>
        <template slot="status" slot-scope="text">
          <a-tag :color="text === 'completed' ? 'green' : text === 'running' ? 'blue' : 'default'">{{ text }}</a-tag>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { EChart } from '@/components/QdCharts'
import { runStrategyBacktest, getStrategyBacktestHistory } from '@/api/strategy'
import request from '@/utils/request'

export default {
  name: 'BacktestCenter',
  components: { EChart },
  data () {
    return {
      running: false,
      historyLoading: false,
      strategies: [],
      config: {
        strategyId: undefined,
        symbol: 'BTC-USDT-SWAP',
        timeframe: '15m',
        initialCapital: 10000,
        feeRate: 0.05,
        startDate: '',
        endDate: '',
      },
      result: null,
      history: [],
      tradeColumns: [
        { title: '时间', dataIndex: 'timestamp', width: 160 },
        { title: '方向', dataIndex: 'side', width: 80, scopedSlots: { customRender: 'side' } },
        { title: '价格', dataIndex: 'price', width: 120 },
        { title: '数量', dataIndex: 'size', width: 100 },
        { title: '盈亏', dataIndex: 'pnl', width: 120, scopedSlots: { customRender: 'pnl' } },
      ],
      historyColumns: [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '策略', dataIndex: 'strategy_name', width: 140 },
        { title: '标的', dataIndex: 'symbol', width: 120 },
        { title: '收益率', dataIndex: 'return_rate', width: 100, scopedSlots: { customRender: 'return_rate' } },
        { title: 'Sharpe', dataIndex: 'sharpe_ratio', width: 80 },
        { title: '最大回撤', dataIndex: 'max_drawdown', width: 100 },
        { title: '状态', dataIndex: 'status', width: 80, scopedSlots: { customRender: 'status' } },
        { title: '时间', dataIndex: 'created_at', width: 160 },
      ],
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
    equityOption () {
      const curve = (this.result && this.result.equity_curve) || []
      return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: curve.map(p => p.timestamp), axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', scale: true, axisLabel: { fontSize: 10 } },
        series: [{
          type: 'line', data: curve.map(p => p.equity), smooth: true,
          lineStyle: { color: '#10b981', width: 2 }, areaStyle: { color: 'rgba(16,185,129,0.1)' },
          symbol: 'none',
        }],
      }
    },
    drawdownOption () {
      const curve = (this.result && this.result.drawdown_curve) || []
      return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: curve.map(p => p.timestamp), axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { formatter: '{value}%', fontSize: 10 } },
        series: [{
          type: 'line', data: curve.map(p => p.drawdown), smooth: true,
          lineStyle: { color: '#ef4444', width: 2 }, areaStyle: { color: 'rgba(239,68,68,0.1)' },
          symbol: 'none',
        }],
      }
    },
  },
  mounted () { this.fetchStrategies(); this.fetchHistory() },
  methods: {
    filterOption (input, option) {
      return option.componentOptions.children[0].text.toLowerCase().includes(input.toLowerCase())
    },
    async fetchStrategies () {
      try {
        const res = await request({ url: '/api/strategies', method: 'get' })
        const d = res.data || res || {}
        this.strategies = d.strategies || d.list || d || []
      } catch (e) { console.error(e) }
    },
    async fetchHistory () {
      this.historyLoading = true
      try {
        const res = await getStrategyBacktestHistory({ limit: 20 })
        const d = res.data || res || {}
        this.history = d.runs || d.list || d || []
      } catch (e) { console.error(e) } finally { this.historyLoading = false }
    },
    async runBacktest () {
      if (!this.config.strategyId) { this.$message.warning('请选择策略'); return }
      if (!this.config.symbol) { this.$message.warning('请输入交易对'); return }
      this.running = true
      try {
        const payload = {
          strategy_id: this.config.strategyId,
          symbol: this.config.symbol,
          timeframe: this.config.timeframe,
          initial_capital: this.config.initialCapital,
          fee_rate: this.config.feeRate / 100,
          start_date: this.config.startDate,
          end_date: this.config.endDate,
        }
        const res = await runStrategyBacktest(payload)
        const d = res.data || res
        if (d) {
          this.result = d
          this.$message.success('回测完成')
          this.fetchHistory()
        }
      } catch (e) {
        this.$message.error('回测失败: ' + (e.message || ''))
      } finally { this.running = false }
    },
    formatNumber (v, d = 2) {
      if (v == null) return '—'
      return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    },
  },
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.backtest-center {
  padding: 20px; background: @qd-bg-light; min-height: 100vh;
  &.theme-dark { background: @qd-bg-dark; }

  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
    h3 { margin: 0; font-size: 18px; font-weight: 700; color: @qd-text-primary-light; }
    .theme-dark & h3 { color: @qd-text-primary-dark; }
  }

  .bt-config-card {
    background: @qd-bg-card-light; border: 1px solid @qd-border-light; border-radius: @qd-radius-lg;
    padding: 20px; margin-bottom: 16px;
    .theme-dark & { background: @qd-bg-card-dark; border-color: @qd-border-dark; }
  }

  .bt-result-section { margin-bottom: 16px; }

  .bt-metrics-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px;
  }

  .bt-metric-card {
    background: @qd-bg-card-light; border: 1px solid @qd-border-light; border-radius: @qd-radius-md; padding: 14px; text-align: center;
    .theme-dark & { background: @qd-bg-card-dark; border-color: @qd-border-dark; }
    .bt-metric-label { font-size: @qd-font-sm; color: @qd-text-secondary-light; text-transform: uppercase; margin-bottom: 6px; }
    .theme-dark & .bt-metric-label { color: @qd-text-secondary-dark; }
    .bt-metric-value { font-size: @qd-font-lg; font-weight: @qd-font-bold; color: @qd-text-primary-light; font-feature-settings: 'tnum'; }
    .theme-dark & .bt-metric-value { color: @qd-text-primary-dark; }
  }

  .bt-chart-card {
    background: @qd-bg-card-light; border: 1px solid @qd-border-light; border-radius: @qd-radius-lg;
    padding: 16px; margin-bottom: 16px;
    .theme-dark & { background: @qd-bg-card-dark; border-color: @qd-border-dark; }
  }

  .bt-chart-title {
    font-size: @qd-font-md; font-weight: @qd-font-semibold; color: @qd-text-primary-light; margin-bottom: 12px;
    .theme-dark & { color: @qd-text-primary-dark; }
  }

  .bt-history-section {
    background: @qd-bg-card-light; border: 1px solid @qd-border-light; border-radius: @qd-radius-lg; padding: 16px;
    .theme-dark & { background: @qd-bg-card-dark; border-color: @qd-border-dark; }
  }

  .positive { color: @qd-green !important; }
  .negative { color: @qd-red !important; }
}
</style>
