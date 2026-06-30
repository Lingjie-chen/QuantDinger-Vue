<template>
  <div class="chart-card" :class="{ 'theme-dark': isDarkTheme }">
    <div class="chart-header">
      <div class="chart-title-row">
        <span class="chart-title">{{ $t('dashboard.hourly_trading_activity') }}</span>
        <div class="chart-legend">
          <span class="legend-item"><span class="dot count-dot" />{{ $t('dashboard.trade_count') }}</span>
          <span class="legend-item"><span class="dot pnl-dot" />{{ $t('dashboard.pnl') }}</span>
        </div>
      </div>
    </div>
    <div ref="chartRef" class="chart-body" />
  </div>
</template>

<script>
import echarts from '@/utils/echarts'
import { formatProfitValue } from '../composables/dashboardData'
import { calcDailyPnlChart } from '../composables/dashboardData'

export default {
  name: 'HourlyChart',
  props: {
    dailyPnlChart: { type: Array, default: () => [] },
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
    dailyPnlChart: {
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
      const { hours, counts, profits } = calcDailyPnlChart(this.dailyPnlChart || [])

      if (hours.length === 0) {
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
          trigger: 'axis',
          backgroundColor: isDark ? '#1f1f1f' : '#fff',
          borderColor: isDark ? '#303030' : '#f0f0f0',
          textStyle: { color: isDark ? '#e6e6e6' : '#262626' }
        },
        legend: { show: false },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: hours,
          axisLine: { lineStyle: { color: isDark ? '#434343' : '#e8e8e8' } },
          axisLabel: { color: isDark ? '#8c8c8c' : '#8c8c8c', fontSize: 10 },
          splitLine: { show: false }
        },
        yAxis: [
          {
            type: 'value',
            name: this.$t('dashboard.trade_count'),
            axisLabel: { color: isDark ? '#8c8c8c' : '#8c8c8c', fontSize: 11 },
            splitLine: {
              lineStyle: { color: isDark ? '#262626' : '#f5f5f5', type: 'dashed' }
            }
          },
          {
            type: 'value',
            name: 'PnL',
            axisLabel: {
              color: isDark ? '#8c8c8c' : '#8c8c8c',
              fontSize: 11,
              formatter: (v) => formatProfitValue(v).value
            },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: this.$t('dashboard.trade_count'),
            type: 'bar',
            data: counts,
            yAxisIndex: 0,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.7)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]),
              borderRadius: [2, 2, 0, 0]
            },
            barWidth: '50%'
          },
          {
            name: 'PnL',
            type: 'line',
            data: profits,
            yAxisIndex: 1,
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: { width: 2, color: '#faad14' },
            itemStyle: { color: '#faad14' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(250, 173, 20, 0.25)' },
                { offset: 1, color: 'rgba(250, 173, 20, 0.02)' }
              ])
            }
          }
        ]
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
    .chart-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;

      .chart-title {
        font-weight: 600;
        font-size: 14px;
        color: #262626;
      }

      .chart-legend {
        display: flex;
        gap: 12px;
        .legend-item {
          font-size: 12px;
          color: #8c8c8c;
          display: flex;
          align-items: center;
          gap: 4px;
          .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            &.count-dot { background: #1890ff; }
            &.pnl-dot { background: #faad14; }
          }
        }
      }
    }
  }

  .chart-body { height: 280px; }

  &.theme-dark {
    background: #1f1f1f;
    border-color: #303030;
    .chart-header .chart-title { color: #e6e6e6; }
  }
}
</style>
