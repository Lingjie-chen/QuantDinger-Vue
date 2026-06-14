<template>
  <div ref="chartContainer" class="qd-kline-chart" :style="{ height: height }"></div>
</template>

<script>
import { init, dispose, registerLocale } from 'klinecharts'

export default {
  name: 'KLineChart',
  props: {
    height: { type: String, default: '400px' },
    theme: { type: String, default: 'dark' },
    symbol: { type: String, default: '' },
    data: { type: Array, default: () => [] },
    signals: { type: Array, default: () => [] },
  },
  data () {
    return { chart: null }
  },
  watch: {
    data () { this.updateData() },
    signals () { this.updateSignals() },
    theme () { this.applyTheme() },
  },
  mounted () {
    this.initChart()
  },
  beforeDestroy () {
    if (this.chart) { dispose(this.$refs.chartContainer) }
  },
  methods: {
    initChart () {
      this.chart = init(this.$refs.chartContainer)
      this.applyTheme()
      this.chart.createIndicator('MA', false, { id: 'candle_pane' })
      this.chart.createIndicator('VOL')
      this.updateData()
      this.updateSignals()
    },
    applyTheme () {
      if (!this.chart) return
      const isDark = this.theme === 'dark' || this.theme === 'realdark'
      this.chart.setStyles({
        grid: {
          horizontal: { color: isDark ? '#1c1c1c' : '#e2e8f0' },
          vertical: { color: isDark ? '#1c1c1c' : '#e2e8f0' },
        },
        candle: {
          tooltip: { showRule: 'always' },
          bar: {
            upColor: '#10b981',
            downColor: '#ef4444',
            upBorderColor: '#10b981',
            downBorderColor: '#ef4444',
            upWickColor: '#10b981',
            downWickColor: '#ef4444',
          },
        },
        crosshair: {
          horizontal: { text: { backgroundColor: isDark ? '#333' : '#333' } },
          vertical: { text: { backgroundColor: isDark ? '#333' : '#333' } },
        },
        xAxis: { show: true },
        yAxis: { show: true },
      })
    },
    updateData () {
      if (!this.chart || !this.data.length) return
      const kData = this.data.map(d => ({
        timestamp: d.timestamp || d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }))
      this.chart.applyNewData(kData)
    },
    updateSignals () {
      if (!this.chart || !this.signals.length) return
      const overlay = this.signals.map(s => ({
        timestamp: s.timestamp || s.time,
        position: s.side === 'buy' ? 'belowBar' : 'aboveBar',
        text: s.side === 'buy' ? 'B' : 'S',
        styles: {
          color: s.side === 'buy' ? '#10b981' : '#ef4444',
          background: s.side === 'buy' ? '#10b981' : '#ef4444',
          fontSize: 10,
        },
      }))
      this.chart.createOverlay({
        name: 'simpleAnnotation',
        points: overlay,
      })
    },
    resize () {
      if (this.chart) this.chart.resize()
    },
  },
}
</script>

<style scoped>
.qd-kline-chart { width: 100%; }
</style>
