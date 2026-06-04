<template>
  <div class="table-panel">
    <div class="panel-header">
      <div class="panel-title">
        <a-icon type="stock" />
        <span>{{ $t('dashboard.currentPositions') }}</span>
      </div>
      <div class="panel-badge">{{ (dataSource || []).length }}</div>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      rowKey="id"
      :pagination="false"
      size="small"
      :scroll="{ x: 'max-content' }"
      class="pro-table"
    >
      <template slot="symbol" slot-scope="text, record">
        <div class="symbol-cell">
          <span class="symbol-name">{{ text }}</span>
          <span class="symbol-strategy">{{ record.strategy_name }}</span>
        </div>
      </template>
      <template slot="side" slot-scope="text">
        <span class="side-tag" :class="text === 'long' ? 'long' : 'short'">
          {{ text === 'long' ? 'LONG' : 'SHORT' }}
        </span>
      </template>
      <template slot="unrealized_pnl" slot-scope="text, record">
        <div class="pnl-cell">
          <span :class="text >= 0 ? 'positive' : 'negative'">
            {{ text >= 0 ? '+' : '' }}${{ formatNumber(text) }}
          </span>
          <span class="pnl-percent" :class="record.pnl_percent >= 0 ? 'positive' : 'negative'">
            {{ record.pnl_percent >= 0 ? '+' : '' }}{{ formatNumber(record.pnl_percent) }}%
          </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script>
export default {
  name: 'PositionTable',
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    columns () {
      return [
        {
          title: this.$t('dashboard.table.symbol'),
          dataIndex: 'symbol',
          scopedSlots: { customRender: 'symbol' }
        },
        {
          title: this.$t('dashboard.table.side'),
          dataIndex: 'side',
          scopedSlots: { customRender: 'side' }
        },
        {
          title: this.$t('dashboard.table.size'),
          dataIndex: 'size',
          customRender: (text) => this.formatNumber(text, 4)
        },
        {
          title: this.$t('dashboard.table.entryPrice'),
          dataIndex: 'entry_price',
          customRender: (text) => this.formatNumber(text)
        },
        {
          title: this.$t('dashboard.table.pnl'),
          dataIndex: 'unrealized_pnl',
          scopedSlots: { customRender: 'unrealized_pnl' },
          align: 'right'
        }
      ]
    }
  },
  methods: {
    formatNumber (num, digits = 2) {
      if (num === undefined || num === null) return '0.00'
      return Number(num).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    }
  }
}
</script>
