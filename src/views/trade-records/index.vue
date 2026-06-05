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
        { title: '数量', dataIndex: 'size', width: 100 },
        { title: '价格', dataIndex: 'price', width: 120 },
        { title: '盈亏', dataIndex: 'pnl', scopedSlots: { customRender: 'pnl' } },
        { title: '状态', dataIndex: 'status', width: 100, scopedSlots: { customRender: 'status' } },
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
        const res = await getTradeList({ page: this.pagination.current, pageSize: this.pagination.pageSize })
        const d = res.data || res || {}
        this.trades = d.list || []
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
@bg-light: #f8fafc; @bg-card: #fff; @border: #e2e8f0; @text-primary: #1e293b;
@green: #10b981; @red: #ef4444;

.trade-records {
  padding: 20px; background: @bg-light; min-height: 100vh;
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h3 { margin: 0; } }
  .positive { color: @green !important; }
  .negative { color: @red !important; }
}
</style>
