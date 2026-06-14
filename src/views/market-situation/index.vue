<template>
  <div class="situation-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header"><h3>市场态势</h3><a-button @click="fetchData"><a-icon type="reload" /></a-button></div>
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">恐惧贪婪指数</div><div class="kpi-value" :class="fearGreedClass">{{ fearGreed.value || '—' }}</div><div class="kpi-sub">{{ fearGreed.label }}</div></div>
      <div class="kpi-card"><div class="kpi-label">市场状态</div><div class="kpi-value">{{ regime.label || '—' }}</div></div>
      <div class="kpi-card"><div class="kpi-label">波动率</div><div class="kpi-value">{{ formatNumber(volatility.value) }}</div></div>
      <div class="kpi-card"><div class="kpi-label">趋势强度</div><div class="kpi-value">{{ formatNumber(trendStrength) }}</div></div>
    </div>
    <a-table :columns="columns" :data-source="symbols" :loading="loading" size="small" row-key="symbol" class="pro-table">
      <template slot="regime" slot-scope="text"><a-tag :color="regimeColor(text)">{{ text }}</a-tag></template>
    </a-table>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getMarketSituation, getRegimeDetection, getFearGreedIndex } from '@/api/situation'
export default {
  name: 'MarketSituation',
  data () {
    return { loading: false, fearGreed: {}, regime: {}, volatility: {}, trendStrength: 0, symbols: [],
      columns: [
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '状态', dataIndex: 'regime', width: 100, scopedSlots: { customRender: 'regime' } },
        { title: '趋势', dataIndex: 'trend', width: 80 },
        { title: '波动率', dataIndex: 'volatility', width: 100 },
        { title: '情绪', dataIndex: 'sentiment', width: 80 },
      ],
    }
  },
  computed: {
    ...mapState({ navTheme: s => s.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
    fearGreedClass () { const v = this.fearGreed.value; return v > 60 ? 'positive' : v < 40 ? 'negative' : '' },
  },
  mounted () { this.fetchData() },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const [sit, reg, fg] = await Promise.all([getMarketSituation(), getRegimeDetection(), getFearGreedIndex()])
        const d = sit.data || sit || {}; this.symbols = d.symbols || []; this.volatility = d.volatility || {}; this.trendStrength = d.trend_strength || 0
        this.regime = reg.data || reg || {}; this.fearGreed = fg.data || fg || {}
      } catch (e) { console.error(e) } finally { this.loading = false }
    },
    regimeColor (r) { return { trending: 'blue', ranging: 'green', volatile: 'red', breakout: 'purple' }[r] || 'default' },
    formatNumber (v, d = 2) { return v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) },
  },
}
</script>
<style lang="less" scoped>
@bg:#f8fafc;@card:#fff;@border:#e2e8f0;@tp:#1e293b;@ts:#64748b;@g:#10b981;@r:#ef4444;
.situation-page{padding:24px;background:@bg;min-height:100vh;
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;h3{margin:0}}
  .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px;}
  .kpi-card{background:@card;border:1px solid @border;border-radius:12px;padding:16px;
    .kpi-label{font-size:11px;color:@ts;text-transform:uppercase;margin-bottom:8px}
    .kpi-value{font-size:24px;font-weight:700;color:@tp}
    .kpi-sub{font-size:12px;color:@ts;margin-top:4px}}
  .positive{color:@g!important}.negative{color:@r!important}
}
</style>
