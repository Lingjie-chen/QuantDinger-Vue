<template>
  <div class="chart-card" :class="{ 'theme-dark': isDarkTheme }">
    <div class="chart-header">
      <div class="chart-title-row">
        <span class="chart-title">{{ $t('dashboard.equity_drawdown') }}</span>
        <div class="chart-legend">
          <span class="legend-item"><span class="dot equity-dot" />{{ $t('dashboard.equity_curve') }}</span>
          <span class="legend-item"><span class="dot drawdown-dot" />{{ $t('dashboard.drawdown') }}</span>
        </div>
      </div>
    </div>
    <div ref="chartRef" class="chart-body" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'DrawdownChart',
  props: {
    equityData: { type: Array, default: () => [] },
    drawdownData: { type: Array, default: () => [] },
    dateLabels: { type: Array, default: () => [] },
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
    equityData: { deep: true, handler() { this.updateChart() } },
    drawdownData: { deep: true, handler() { this.updateChart() } },
    dateLabels: { handler() { this.updateChart() } },
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
      const labels = this.dateLabels || []
      const equity = this.equityData || []
      const dd = this.drawdownData || []

      if (labels.length === 0) {
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
          data: labels,
          axisLine: { lineStyle: { color: isDark ? '#434343' : '#e8e8e8' } },
          axisLabel: { color: isDark ? '#8c8c8c' : '#8c8c8c', fontSize: 11 },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: isDark ? '#8c8c8c' : '#8c8c8c',
            fontSize: 11,
            formatter: '{value}%'
          },
          splitLine: {
            lineStyle: { color: isDark ? '#262626' : '#f5f5f5', type: 'dashed' }
          }
        },
        series: [
          {
            name: this.$t('dashboard.equity_curve'),
            type: 'line',
            data: equity,
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2, color: '#1890ff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.25)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.02)' }
              ])
            }
          },
          {
            name: this.$t('dashboard.drawdown'),
            type: 'bar',
            data: dd,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 77, 79, 0.6)' },
                { offset: 1, color: 'rgba(255, 77, 79, 0.05)' }
              ])
            },
            barWidth: '60%'
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
            &.equity-dot { background: #1890ff; }
            &.drawdown-dot { background: #ff4d4f; }
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
