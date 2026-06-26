<template>
  <div class="agent-console-view" :class="{ 'theme-dark': isDark }">
    <!-- 顶层视图切换 -->
    <a-tabs v-model="topView" class="top-view-tabs" :animated="false">
      <a-tab-pane key="console" tab="控制台">
        <agent-status-bar
          :state="agentState"
          :action-loading="actionLoading"
          :status-loading="statusLoading"
          @start="$emit('start')"
          @pause="$emit('pause')"
          @resume="$emit('resume')"
          @stop="$emit('stop')"
          @refresh="$emit('refresh')"
        />

        <agent-kpi-grid
          :perf="perf"
          :positions-count="positions.length"
          :uptime="uptime"
        />

        <a-tabs v-model="activeTab" class="main-tabs">
          <a-tab-pane key="positions" tab="持仓">
            <agent-positions-tab
              :positions="positions"
              :kline-data="klineData"
              :kline-signals="klineSignals"
              :chart-symbol="chartSymbol"
              :chart-interval="chartInterval"
              :theme="navTheme"
              @symbol-change="onSymbolChange"
              @interval-change="onIntervalChange"
            />
          </a-tab-pane>

          <a-tab-pane key="trades" tab="交易记录">
            <a-table
              :columns="tradeColumns"
              :data-source="trades"
              :pagination="{ pageSize: 20 }"
              size="small"
              class="pro-table"
              row-key="id"
            >
              <template slot="pnl" slot-scope="text">
                <span :class="text >= 0 ? 'positive' : 'negative'">
                  {{ text >= 0 ? '+' : '' }}{{ formatNumber(text) }}
                </span>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="decisions" tab="决策日志">
            <agent-decision-log :decisions="decisions" />
          </a-tab-pane>

          <a-tab-pane key="config" tab="配置">
            <agent-config-form
              :config="config"
              :saving="configSaving"
              @save="(cfg) => $emit('save-config', cfg)"
            />
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>

      <a-tab-pane key="workflow" tab="工作流">
        <quant-workflow-panel :is-dark="isDark" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AgentStatusBar from '@/components/BizTrading/AgentStatusBar.vue'
import AgentKpiGrid from '@/components/BizTrading/AgentKpiGrid.vue'
import AgentConfigForm from '@/components/BizTrading/AgentConfigForm.vue'
import AgentPositionsTab from './AgentPositionsTab.vue'
import AgentDecisionLog from './AgentDecisionLog.vue'
import QuantWorkflowPanel from '@/views/quant-workflow/index.vue'

export default {
  name: 'AgentConsoleView',
  components: {
    AgentStatusBar,
    AgentKpiGrid,
    AgentConfigForm,
    AgentPositionsTab,
    AgentDecisionLog,
    QuantWorkflowPanel
  },
  props: {
    agentState: { type: String, default: 'idle' },
    statusLoading: { type: Boolean, default: false },
    actionLoading: { type: Boolean, default: false },
    configSaving: { type: Boolean, default: false },
    status: { type: Object, default: () => ({}) },
    perf: { type: Object, default: () => ({}) },
    positions: { type: Array, default: () => [] },
    trades: { type: Array, default: () => [] },
    decisions: { type: Array, default: () => [] },
    config: { type: Object, default: () => ({}) },
    // K线状态由父容器持有，避免多实例重复请求
    klineData: { type: Array, default: () => [] },
    klineSignals: { type: Array, default: () => [] },
    chartSymbol: { type: String, default: '' },
    chartInterval: { type: String, default: '15m' }
  },
  data () {
    return {
      topView: 'console',
      activeTab: 'positions',
      tradeColumns: [
        { title: '时间', dataIndex: 'timestamp', width: 160 },
        { title: '标的', dataIndex: 'symbol', width: 140 },
        { title: '方向', dataIndex: 'action', width: 80 },
        { title: '数量', dataIndex: 'size', width: 100 },
        { title: '价格', dataIndex: 'price', width: 120 },
        { title: '置信度', dataIndex: 'confidence', width: 100, scopedSlots: { customRender: 'pnl' } }
      ]
    }
  },
  computed: {
    ...mapState({ navTheme: state => state.app.theme }),
    isDark () {
      return this.navTheme === 'dark' || this.navTheme === 'realdark'
    },
    uptime () {
      const s = this.status.uptime_seconds || 0
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      return h > 0 ? `${h}h ${m}m` : `${m}m`
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
    onIntervalChange (val) {
      this.$emit('interval-change', val)
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/assets/design-tokens.less';

.agent-console-view {
  &.theme-dark {
    .positive { color: @qd-green !important; }
    .negative { color: @qd-red !important; }
  }

  .top-view-tabs {
    margin-bottom: 16px;
  }

  .main-tabs {
    .qd-glass-light();
    border-radius: 12px;
    padding: 16px;
    .qd-card-hover-light();

    .theme-dark & {
      .qd-glass-dark();
      .qd-panel-glow();
      .qd-card-hover();
    }
  }

  .positive { color: @qd-green !important; }
  .negative { color: @qd-red !important; }
}
</style>
