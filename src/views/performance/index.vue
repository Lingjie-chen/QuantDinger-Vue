<template>
  <div class="performance-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Sharpe Ratio</div><div class="kpi-value">{{ formatNumber(metrics.sharpe) }}</div></div>
      <div class="kpi-card"><div class="kpi-label">最大回撤</div><div class="kpi-value negative">{{ formatNumber(metrics.maxDrawdown, 1) }}%</div></div>
      <div class="kpi-card"><div class="kpi-label">Calmar Ratio</div><div class="kpi-value">{{ formatNumber(metrics.calmar) }}</div></div>
      <div class="kpi-card"><div class="kpi-label">年化收益</div><div class="kpi-value" :class="metrics.annualizedReturn >= 0 ? 'positive' : 'negative'">{{ formatNumber(metrics.annualizedReturn, 1) }}%</div></div>
    </div>
    <div class="chart-panel"><div class="panel-title">收益曲线</div><div ref="equityChart" class="chart-body"></div></div>
    <a-tabs class="main-tabs" style="margin-top:16px">
      <a-tab-pane key="by-strategy" tab="按策略"><a-table :columns="strategyColumns" :data-source="strategies" size="small" row-key="strategy_id" class="pro-table" /></a-tab-pane>
      <a-tab-pane key="by-symbol" tab="按标的"><a-table :columns="symbolColumns" :data-source="symbols" size="small" row-key="symbol" class="pro-table" /></a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'
import request from '@/utils/request'
export function getPerformanceOverview () { return request({ url: '/api/performance/overview', method: 'get' }) }
export function getPerformanceByStrategy () { return request({ url: '/api/performance/by-strategy', method: 'get' }) }
export function getPerformanceBySymbol () { return request({ url: '/api/performance/by-symbol', method: 'get' }) }
export default {
  name: 'Performance',
  data () {
    return { metrics: {}, strategies: [], symbols: [], chart: null,
      strategyColumns: [
        { title: '策略', dataIndex: 'strategy_name' }, { title: 'Sharpe', dataIndex: 'sharpe', width: 80 },
        { title: '胜率', dataIndex: 'win_rate', width: 80 }, { title: '总收益', dataIndex: 'total_pnl', width: 100 },
      ],
      symbolColumns: [
        { title: '标的', dataIndex: 'symbol' }, { title: '交易数', dataIndex: 'trades', width: 80 },
        { title: '盈亏', dataIndex: 'pnl', width: 100 }, { title: '胜率', dataIndex: 'win_rate', width: 80 },
      ],
    }
  },
  computed: { ...mapState({ navTheme: s => s.app.theme }), isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' } },
  mounted () { this.fetchAll() },
  beforeDestroy () { if (this.chart) this.chart.dispose() },
  methods: {
    async fetchAll () {
      try {
        const [ov, st, sy] = await Promise.all([getPerformanceOverview(), getPerformanceByStrategy(), getPerformanceBySymbol()])
        this.metrics = (ov.data || ov) || {}
        this.strategies = (st.data || st) || []
        this.symbols = (sy.data || sy) || []
      } catch (e) { console.error(e) }
    },
    formatNumber (v, d = 2) { return v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;@tp:#1e293b;@ts:#64748b;@g:#10b981;@r:#ef4444;
.performance-page{padding:20px;background:@bg;min-height:100vh;
  .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px;}
  .kpi-card{background:@card;border:1px solid @border;border-radius:12px;padding:16px;
    .kpi-label{font-size:11px;color:@ts;text-transform:uppercase;margin-bottom:8px}
    .kpi-value{font-size:24px;font-weight:700;color:@tp}}
  .chart-panel{background:@card;border:1px solid @border;border-radius:12px;padding:16px;margin-bottom:16px;
    .panel-title{font-weight:600;margin-bottom:12px}.chart-body{height:300px}}
  .main-tabs{background:@card;border:1px solid @border;border-radius:12px;padding:16px}
  .positive{color:@g!important}.negative{color:@r!important}
}
</style>
