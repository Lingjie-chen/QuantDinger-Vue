<template>
  <div :class="['page-container', { 'theme-dark': navTheme === 'dark' }]">
    <a-page-header title="多市场" sub-title="跨市场数据" />

    <a-card :bordered="false">
      <a-form layout="inline" style="margin-bottom: 16px">
        <a-form-item label="市场">
          <a-select v-model="market" style="width: 150px" @change="loadTicker">
            <a-select-option v-for="m in markets" :key="m.code" :value="m.code">{{ m.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="品种">
          <a-input v-model="symbol" placeholder="e.g. BTC-USDT" style="width: 180px" @pressEnter="loadTicker" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="loadTicker">查询</a-button>
        </a-form-item>
      </a-form>

      <a-descriptions v-if="ticker" bordered size="small" :column="3">
        <a-descriptions-item label="最新价">{{ ticker.last }}</a-descriptions-item>
        <a-descriptions-item label="24h高">{{ ticker.high }}</a-descriptions-item>
        <a-descriptions-item label="24h低">{{ ticker.low }}</a-descriptions-item>
        <a-descriptions-item label="24h量">{{ ticker.volume }}</a-descriptions-item>
        <a-descriptions-item label="涨跌幅">
          <span :style="{ color: ticker.change >= 0 ? '#3f8600' : '#cf1322' }">{{ ticker.change }}%</span>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { listSupportedMarkets, getMultiMarketTicker } from '@/api/multi-market'

export default {
  name: 'MultiMarket',
  data() {
    return {
      market: 'okx',
      symbol: 'BTC-USDT',
      markets: [],
      ticker: null
    }
  },
  computed: { ...mapState(['navTheme']) },
  mounted() { this.loadMarkets() },
  methods: {
    async loadMarkets() {
      try {
        const res = await listSupportedMarkets()
        this.markets = res?.data || []
        if (this.markets.length) this.market = this.markets[0].code
      } catch (e) { /* ignore */ }
    },
    async loadTicker() {
      try {
        const res = await getMultiMarketTicker(this.market, this.symbol)
        this.ticker = res?.data || null
      } catch (e) { this.$message.error('查询失败') }
    }
  }
}
</script>
