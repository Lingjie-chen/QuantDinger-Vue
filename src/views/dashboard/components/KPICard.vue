<template>
  <div class="kpi-card" :class="{ 'theme-dark': isDarkTheme }">
    <div class="kpi-header">
      <a-icon :type="icon" class="kpi-icon" />
      <span class="kpi-label">{{ title }}</span>
    </div>
    <div class="kpi-value-row">
      <span class="kpi-value" v-text="displayValue" />
      <span v-if="suffix" class="kpi-suffix">{{ suffix }}</span>
      <span v-if="trend !== undefined" :class="['kpi-trend', trendClass]">
        <a-icon :type="trend >= 0 ? 'arrow-up' : 'arrow-down'" />
        {{ formatTrend(trend) }}
      </span>
    </div>
  </div>
</template>

<script>
import { formatCompactNumber as fmtCompact, formatNumber as fmtNum } from '../composables/dashboardData'

export default {
  name: 'KPICard',
  props: {
    icon: { type: String, default: 'info-circle' },
    title: { type: String, required: true },
    value: { type: [Number, String], default: 0 },
    suffix: { type: String, default: '' },
    trend: { type: Number, default: undefined },
    precision: { type: Number, default: 0 },
    isDarkTheme: { type: Boolean, default: false }
  },
  computed: {
    displayValue() {
      if (this.value === null || this.value === undefined) return '0'
      const val = typeof this.value === 'string' ? parseFloat(this.value) : this.value
      if (isNaN(val)) return '0'
      if (this.precision > 0) return fmtNum(val, this.precision)
      return fmtCompact(val)
    },
    trendClass() {
      if (this.trend === undefined) return ''
      return this.trend >= 0 ? 'trend-up' : 'trend-down'
    }
  },
  methods: {
    formatTrend(val) {
      const prefix = val >= 0 ? '+' : ''
      return prefix + val.toFixed(1) + '%'
    }
  }
}
</script>

<style scoped lang="less">
.kpi-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  .kpi-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .kpi-icon {
      font-size: 18px;
      color: #1890ff;
    }

    .kpi-label {
      font-size: 14px;
      color: #8c8c8c;
      font-weight: 500;
    }
  }

  .kpi-value-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;

    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: #262626;
      line-height: 1.2;
    }

    .kpi-suffix {
      font-size: 13px;
      color: #8c8c8c;
    }

    .kpi-trend {
      font-size: 12px;
      padding: 1px 8px;
      border-radius: 10px;
      font-weight: 600;

      &.trend-up {
        color: #52c41a;
        background: #f6ffed;
      }
      &.trend-down {
        color: #ff4d4f;
        background: #fff2f0;
      }
    }
  }

  // dark theme
  &.theme-dark {
    background: #1f1f1f;
    border-color: #303030;

    .kpi-header {
      .kpi-icon { color: #177ddc; }
      .kpi-label { color: #a6a6a6; }
    }

    .kpi-value-row {
      .kpi-value { color: #e6e6e6; }
      .kpi-suffix { color: #a6a6a6; }
    }
  }
}
</style>
