<template>
  <div class="agent-kpi-grid">
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
      <div class="kpi-value">{{ positionsCount }}</div>
    </div>
    <div class="kpi-card" v-if="uptime">
      <div class="kpi-label">运行时长</div>
      <div class="kpi-value">{{ uptime }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentKpiGrid',
  props: {
    perf: {
      type: Object,
      default: () => ({ totalEquity: 0, totalPnl: 0, winRate: 0, totalTrades: 0 })
    },
    positionsCount: { type: Number, default: 0 },
    uptime: { type: String, default: '' }
  },
  methods: {
    formatNumber (v, d = 2) {
      if (v == null) return '—'
      return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.agent-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  .qd-glass-light();
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  .qd-card-hover-light();

  .theme-dark & {
    .qd-glass-dark();
    .qd-panel-glow();
    .qd-card-hover();
  }

  .kpi-label {
    font-size: 11px;
    color: @qd-text-secondary-light;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    .theme-dark & { color: @qd-text-secondary-dark; }
  }

  .kpi-value {
    font-size: 22px;
    font-weight: 700;
    color: @qd-text-primary-light;
    font-feature-settings: 'tnum';
    .theme-dark & { color: @qd-text-primary-dark; }
  }
}

.positive { color: @qd-green !important; }
.negative { color: @qd-red !important; }
</style>
