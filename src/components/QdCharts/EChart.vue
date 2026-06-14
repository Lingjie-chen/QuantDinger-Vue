<template>
  <div ref="chartContainer" class="qd-echart" :style="{ height: height }"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChart',
  props: {
    height: { type: String, default: '300px' },
    option: { type: Object, required: true },
    theme: { type: String, default: 'dark' },
    loading: { type: Boolean, default: false },
  },
  data () {
    return { chart: null }
  },
  watch: {
    option: {
      deep: true,
      handler () { this.updateChart() },
    },
    theme () { this.reInit() },
    loading (v) { v ? this.chart?.showLoading() : this.chart?.hideLoading() },
  },
  mounted () {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) { this.chart.dispose() }
  },
  methods: {
    initChart () {
      const isDark = this.theme === 'dark' || this.theme === 'realdark'
      this.chart = echarts.init(this.$refs.chartContainer, isDark ? 'dark' : null, {
        renderer: 'canvas',
      })
      this.updateChart()
    },
    updateChart () {
      if (!this.chart) return
      const baseOption = this.option
      // Inject theme-aware defaults
      const isDark = this.theme === 'dark' || this.theme === 'realdark'
      const merged = {
        ...baseOption,
        textStyle: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
          ...(baseOption.textStyle || {}),
        },
        grid: {
          left: '8%',
          right: '4%',
          bottom: '8%',
          top: '12%',
          containLabel: true,
          ...(baseOption.grid || {}),
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(28,28,28,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: isDark ? '#2a2a2a' : '#e2e8f0',
          textStyle: { color: isDark ? 'rgba(255,255,255,0.85)' : '#1e293b' },
          ...(baseOption.tooltip || {}),
        },
      }
      this.chart.setOption(merged, true)
    },
    reInit () {
      if (this.chart) { this.chart.dispose() }
      this.initChart()
    },
    handleResize () {
      if (this.chart) this.chart.resize()
    },
  },
}
</script>

<style scoped>
.qd-echart { width: 100%; }
</style>
