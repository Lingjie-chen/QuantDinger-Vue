<template>
  <div :class="['page-container', { 'theme-dark': navTheme === 'dark' }]">
    <a-page-header title="外汇交易" sub-title="MT5 Bridge">
      <template slot="extra">
        <a-badge :status="mt5Health === 'ok' ? 'success' : 'error'" :text="mt5Health === 'ok' ? 'MT5 在线' : 'MT5 离线'" />
        <a-badge :status="canTrade ? 'success' : 'warning'" :text="canTrade ? '可交易' : '不可交易'" style="margin-left: 16px" />
      </template>
    </a-page-header>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6"><a-card><a-statistic title="账户余额" :value="account.balance" :precision="2" /></a-card></a-col>
      <a-col :span="6"><a-card><a-statistic title="净值" :value="account.equity" :precision="2" /></a-card></a-col>
      <a-col :span="6"><a-card><a-statistic title="浮动盈亏" :value="account.profit" :precision="2" :value-style="{ color: account.profit >= 0 ? '#3f8600' : '#cf1322' }" /></a-card></a-col>
      <a-col :span="6"><a-card><a-statistic title="交易时段" :value="session.name || '--'" /></a-card></a-col>
    </a-row>

    <a-card title="持仓" :bordered="false" style="margin-bottom: 16px">
      <a-table :columns="posCols" :data-source="positions" row-key="ticket" size="small" :pagination="false">
        <span slot="profit" slot-scope="v"><span :style="{ color: v >= 0 ? '#3f8600' : '#cf1322' }">{{ v?.toFixed(2) }}</span></span>
      </a-table>
    </a-card>

    <a-card title="可交易品种" :bordered="false">
      <a-table :columns="symCols" :data-source="symbols" row-key="symbol" size="small" :pagination="{ pageSize: 10 }" />
    </a-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getForexSession, shouldTrade, getForexAccount, getForexPositions, getForexSymbols, getForexHealth } from '@/api/forex'

export default {
  name: 'Forex',
  data() {
    return {
      session: {},
      canTrade: false,
      mt5Health: 'unknown',
      account: { balance: 0, equity: 0, profit: 0 },
      positions: [],
      symbols: [],
      posCols: [
        { title: 'Ticket', dataIndex: 'ticket' },
        { title: '品种', dataIndex: 'symbol' },
        { title: '方向', dataIndex: 'type' },
        { title: '手数', dataIndex: 'volume' },
        { title: '开仓价', dataIndex: 'open_price' },
        { title: '当前价', dataIndex: 'current_price' },
        { title: '盈亏', dataIndex: 'profit', scopedSlots: { customRender: 'profit' } }
      ],
      symCols: [
        { title: '品种', dataIndex: 'symbol' },
        { title: '描述', dataIndex: 'description' }
      ]
    }
  },
  computed: { ...mapState(['navTheme']) },
  mounted() { this.loadAll() },
  methods: {
    async loadAll() {
      try {
        const [sess, trade, acc, pos, syms, health] = await Promise.allSettled([
          getForexSession(), shouldTrade(), getForexAccount(), getForexPositions(), getForexSymbols(), getForexHealth()
        ])
        if (sess.status === 'fulfilled') this.session = sess.value?.data || {}
        if (trade.status === 'fulfilled') this.canTrade = trade.value?.data?.should_trade || false
        if (acc.status === 'fulfilled') this.account = acc.value?.data || {}
        if (pos.status === 'fulfilled') this.positions = pos.value?.data || []
        if (syms.status === 'fulfilled') this.symbols = syms.value?.data || []
        if (health.status === 'fulfilled') this.mt5Health = health.value?.data?.status || 'unknown'
      } catch (e) { this.$message.error('加载外汇数据失败') }
    }
  }
}
</script>
