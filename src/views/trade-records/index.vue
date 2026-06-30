<template>
  <div class="trade-records" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header">
      <h3>交易记录</h3>
      <a-button @click="fetchTrades"><a-icon type="reload" /></a-button>
    </div>
    <a-table :columns="columns" :data-source="trades" :loading="loading" :pagination="pagination" @change="handleTableChange" size="small" row-key="id" class="pro-table">
      <template slot="side" slot-scope="text">
        <span :class="text === 'buy' ? 'positive' : 'negative'">{{ text === 'buy' ? '买入' : '卖出' }}</span>
      </template>
      <template slot="pnl" slot-scope="text">
        <span v-if="text != null" :class="text >= 0 ? 'positive' : 'negative'">{{ text >= 0 ? '+' : '' }}{{ formatNumber(text) }}</span>
        <span v-else>—</span>
      </template>
      <template slot="status" slot-scope="text">
        <a-tag :color="statusColor(text)">{{ text }}</a-tag>
      </template>
    </a-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import request from '@/utils/request'

export function getTradeList (params) {
  return request({ url: '/api/trade/history', method: 'get', params })
}

export default {
  name: 'TradeRecords',
  data () {
    return {
      loading: false,
      trades: [],
      pagination: { current: 1, pageSize: 20, total: 0 },
      columns: [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '时间', dataIndex: 'timestamp', width: 160 },
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '方向', dataIndex: 'side', width: 80, scopedSlots: { customRender: 'side' } },
        { title: '数量', dataIndex: 'quantity', width: 100 },
        { title: '价格', dataIndex: 'price', width: 120 },
        { title: '置信度', dataIndex: 'confidence', width: 100 },
      ],
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDarkTheme () { return this.navTheme === 'dark' || this.navTheme === 'realdark' },
  },
  mounted () { this.fetchTrades() },
  methods: {
    async fetchTrades () {
      this.loading = true
      try {
        const offset = (this.pagination.current - 1) * this.pagination.pageSize
        const res = await getTradeList({ limit: this.pagination.pageSize, offset })
        const d = res.data || res || {}
        this.trades = d.trades || d.list || []
        this.pagination.total = d.total || 0
      } catch (e) { console.error(e) } finally { this.loading = false }
    },
    handleTableChange (pag) { this.pagination.current = pag.current; this.fetchTrades() },
    statusColor (s) { return { filled: 'green', canceled: 'default', partial: 'blue', rejected: 'red' }[s] || 'default' },
    formatNumber (v, d = 2) { return v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) },
  },
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.trade-records {
  padding: @qd-space-lg; min-height: 100vh;
  background: @qd-bg-gradient-light;
  background-attachment: fixed;
  &.theme-dark {
    background: @qd-bg-gradient-dark;
    background-attachment: fixed;
    ::v-deep .ant-card { .qd-glass-dark(); .qd-panel-glow(); .qd-card-hover(); }
  }
  ::v-deep .ant-card { .qd-glass-light(); .qd-card-hover-light(); }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: @qd-space-md; h3 { margin: 0; } }
  .positive { .qd-positive-text(); }
  .negative { .qd-negative-text(); }
}
</style>
