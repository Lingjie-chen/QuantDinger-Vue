<template>
  <div class="chart-card" :class="{ 'theme-dark': isDarkTheme }">
    <div class="chart-header">
      <span class="chart-title">{{ $t('dashboard.strategy_pnl_distribution') }}</span>
    </div>
    <div ref="chartRef" class="chart-body" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { formatProfitValue } from '../composables/dashboardData'

const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']

export default {
  name: 'StrategyPieChart',
  props: {
    strategyPnlData: { type: Array, default: () => [] },
    isDarkTheme: { type: Boolean, default: false }
  },
  data() {
    return { chart: null }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  watch: {
    strategyPnlData: {
      deep: true,
      handler() { this.updateChart() }
    },
    isDarkTheme() { this.updateChart() }
  },
  methods: {
    initChart() {
      const el = this.$refs.chartRef
      if (!el) return
      this.chart = echarts.init(el)
      this.updateChart()
    },
    updateChart() {
      if (!this.chart) return
      const isDark = this.isDarkTheme
      const data = (this.strategyPnlData || [])
        .filter(d => d.name)
        .map(d => ({
          name: d.name,
          value: Math.abs(d.pnl || 0)
        }))

      if (data.length === 0) {
        this.chart.clear()
        this.chart.setOption({
          title: {
            text: this.$t('dashboard.no_data'),
            left: 'center',
            top: 'center',
            textStyle: { color: isDark ? '#595959' : '#bfbfbf', fontSize: 14 }
          }
        })
        return
      }

      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const info = formatProfitValue(params.value)
            return `${params.name}<br/>${this.$t('dashboard.pnl')}: ${info.value}`
          },
          backgroundColor: isDark ? '#1f1f1f' : '#fff',
          borderColor: isDark ? '#303030' : '#f0f0f0',
          textStyle: { color: isDark ? '#e6e6e6' : '#262626' }
        },
        color: PIE_COLORS,
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: isDark ? '#a6a6a6' : '#595959', fontSize: 12 },
          itemWidth: 12,
          itemHeight: 12
        },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: true,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: isDark ? '#e6e6e6' : '#262626'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data
        }]
      }, true)
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    }
  }
}
</script>

<style scoped lang="less">
.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;

  &:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }

  .chart-header {
    margin-bottom: 12px;
    .chart-title {
      font-weight: 600;
      font-size: 14px;
      color: #262626;
    }
  }

  .chart-body {
    height: 280px;
  }

  &.theme-dark {
    background: #1f1f1f;
    border-color: #303030;
    .chart-header .chart-title { color: #e6e6e6; }
  }
}
</style>
