<template>
  <div class="agent-positions-tab">
    <div v-if="positions.length" class="chart-section">
      <div class="chart-header">
        <a-select
          :value="chartSymbol"
          style="width:200px"
          size="small"
          @change="onSymbolChange"
        >
          <a-select-option v-for="p in positions" :key="p.symbol" :value="p.symbol">
            {{ p.symbol }}
          </a-select-option>
        </a-select>
        <a-radio-group :value="chartInterval" size="small" @change="(e) => $emit('interval-change', e.target.value)">
          <a-radio-button value="1m">1m</a-radio-button>
          <a-radio-button value="5m">5m</a-radio-button>
          <a-radio-button value="15m">15m</a-radio-button>
          <a-radio-button value="1H">1H</a-radio-button>
          <a-radio-button value="4H">4H</a-radio-button>
          <a-radio-button value="1D">1D</a-radio-button>
        </a-radio-group>
      </div>
      <k-line-chart
        v-if="klineData.length"
        :data="klineData"
        :signals="klineSignals"
        :theme="theme"
        height="360px"
      />
      <a-empty v-else description="选择持仓标的查看K线" style="padding:60px" />
    </div>
    <a-table
      :columns="positionColumns"
      :data-source="positions"
      :pagination="false"
      size="small"
      class="pro-table"
      row-key="symbol"
      :row-selection="{
        selectedRowKeys: chartSymbol ? [chartSymbol] : [],
        onSelect: onRowSelect
      }"
    >
      <template slot="pnl" slot-scope="text">
        <span :class="text >= 0 ? 'positive' : 'negative'">
          {{ text >= 0 ? '+' : '' }}{{ formatNumber(text) }}
        </span>
      </template>
    </a-table>
  </div>
</template>

<script>
import { KLineChart } from '@/components/QdCharts'

export default {
  name: 'AgentPositionsTab',
  components: { KLineChart },
  props: {
    positions: { type: Array, default: () => [] },
    klineData: { type: Array, default: () => [] },
    klineSignals: { type: Array, default: () => [] },
    chartSymbol: { type: String, default: '' },
    chartInterval: { type: String, default: '15m' },
    theme: { type: String, default: 'light' }
  },
  data () {
    return {
      positionColumns: [
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '方向', dataIndex: 'side', width: 80 },
        { title: '数量', dataIndex: 'size', width: 100 },
        { title: '均价', dataIndex: 'avgPrice', width: 120 },
        { title: '盈亏', dataIndex: 'pnl', scopedSlots: { customRender: 'pnl' } }
      ]
    }
  },
  methods: {
    formatNumber (v, d = 2) {
      if (v == null) return '—'
      return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    },
    onSymbolChange (val) {
      this.$emit('symbol-change', val)
    },
    onRowSelect (record) {
      this.$emit('symbol-change', record.symbol)
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.agent-positions-tab {
  .chart-section {
    .qd-glass-light();
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    .qd-card-hover-light();

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .theme-dark & {
      .qd-glass-dark();
      .qd-panel-glow();
      .qd-grid-bg-dark();
      .qd-card-hover();
    }
  }

  .positive { color: @qd-green !important; }
  .negative { color: @qd-red !important; }
}
</style>
